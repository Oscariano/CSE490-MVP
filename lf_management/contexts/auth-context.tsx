"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth"
import { initializeFirebase } from "@/lib/firebase"

interface AuthContextValue {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { auth } = initializeFirebase()
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { auth } = initializeFirebase()
    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const { auth } = initializeFirebase()
    await createUserWithEmailAndPassword(auth, email, password)
  }, [])

  const signOut = useCallback(async () => {
    const { auth } = initializeFirebase()
    await firebaseSignOut(auth)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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
