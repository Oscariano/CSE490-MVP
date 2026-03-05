"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { initializeFirebase } from "@/lib/firebase"

export interface UserProfile {
  orgId: string
  role: string
  email: string
  status: string
}

interface AuthContextValue {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { auth, db } = initializeFirebase()
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        try {
          // Fetch the user's profile to get their orgId
          const docRef = doc(db, 'users', firebaseUser.uid)
          const docSnap = await getDoc(docRef)
          
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile)
          } else {
            setUserProfile(null)
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })
    
    return unsubscribe
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { auth } = initializeFirebase()
    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const { auth, db } = initializeFirebase()
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const newUser = userCredential.user

    // Immediately create their profile in Firestore upon signup
    await setDoc(doc(db, 'users', newUser.uid), {
      email: newUser.email,
      role: 'Administrator', // Default role
      status: 'Active',
      // For demonstration, everyone gets the same default org ID.
      // In a real app, you might generate this or get it from an invite code.
      orgId: 'demo-org-123', 
    })
    
    // The onAuthStateChanged listener will automatically pick up the new user
    // and fetch this profile document shortly after.
  }, [])

  const signOut = useCallback(async () => {
    const { auth } = initializeFirebase()
    await firebaseSignOut(auth)
  }, [])

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}