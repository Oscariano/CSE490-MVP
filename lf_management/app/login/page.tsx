"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "Invalid email address."
    case "auth/user-disabled":
      return "This account has been disabled."
    case "auth/user-not-found":
    case "auth/invalid-credential":
      return "Invalid email or password."
    case "auth/wrong-password":
      return "Invalid email or password."
    case "auth/email-already-in-use":
      return "An account with this email already exists."
    case "auth/weak-password":
      return "Password must be at least 6 characters."
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later."
    default:
      return "An unexpected error occurred. Please try again."
  }
}

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signUp } = useAuth()

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)

  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [signUpConfirm, setSignUpConfirm] = useState("")
  const [signUpError, setSignUpError] = useState("")
  const [signUpLoading, setSignUpLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError("")
    setLoginLoading(true)
    try {
      await signIn(loginEmail, loginPassword)
      router.push("/dashboard")
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? ""
      setLoginError(getFirebaseErrorMessage(code))
    } finally {
      setLoginLoading(false)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setSignUpError("")

    if (signUpPassword !== signUpConfirm) {
      setSignUpError("Passwords do not match.")
      return
    }

    setSignUpLoading(true)
    try {
      await signUp(signUpEmail, signUpPassword)
      router.push("/dashboard")
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? ""
      setSignUpError(getFirebaseErrorMessage(code))
    } finally {
      setSignUpLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Package className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Lost &amp; Found</h1>
          <p className="text-sm text-muted-foreground">Enterprise Inventory Management</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="login" className="flex-1">Log In</TabsTrigger>
            <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Sign in to your account to continue</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  {loginError && (
                    <p className="text-sm text-destructive">{loginError}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={loginLoading}>
                    {loginLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>Get started with Lost &amp; Found</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="Repeat your password"
                      value={signUpConfirm}
                      onChange={(e) => setSignUpConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  {signUpError && (
                    <p className="text-sm text-destructive">{signUpError}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={signUpLoading}>
                    {signUpLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
