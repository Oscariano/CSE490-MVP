"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Spinner } from "@/components/ui/spinner"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      router.replace(user ? "/dashboard" : "/login")
    }
  }, [user, loading, router])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Spinner className="size-8 text-muted-foreground" />
    </div>
  )
}
