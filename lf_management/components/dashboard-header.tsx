"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { initializeFirebase } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"

import { Package, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function DashboardHeader() {
  const { userProfile } = useAuth()
  const [stats, setStats] = useState({
    total: 0,
    matched: 0,
    expiring: 0,
    claimed: 0
  })

  useEffect(() => {
    // Don't query until we have the user's organization ID
    if (!userProfile?.orgId) return

    const { db } = initializeFirebase()
    const q = query(
      collection(db, 'items'),
      where('orgId', '==', userProfile.orgId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data())
      
      const now = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(now.getDate() + 30)

      setStats({
        total: items.length,
        matched: items.filter(i => i.status === 'matched').length,
        claimed: items.filter(i => i.status === 'claimed').length,
        // Check if expiration is within the next 30 days
        expiring: items.filter(i => {
          if (!i.expirationDate) return false
          // Safely convert Firestore timestamp to JS Date
          const expDate = i.expirationDate.toDate ? i.expirationDate.toDate() : new Date(i.expirationDate.seconds * 1000)
          return expDate > now && expDate <= thirtyDaysFromNow
        }).length
      })
    })

    return () => unsubscribe()
  }, [userProfile?.orgId])

  const statConfig = [
    { label: 'Total Items', value: stats.total.toString(), icon: Package, color: 'text-amber-800', bgColor: 'bg-amber-800/10' },
    { label: 'AI Matches Found', value: stats.matched.toString(), icon: CheckCircle2, color: 'text-emerald-700', bgColor: 'bg-emerald-700/10' },
    { label: 'Expiring Soon', value: stats.expiring.toString(), icon: AlertCircle, color: 'text-orange-700', bgColor: 'bg-orange-700/10' },
    { label: 'Claimed', value: stats.claimed.toString(), icon: Clock, color: 'text-stone-600', bgColor: 'bg-stone-600/10' },
  ]

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {statConfig.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div
                key={stat.label}
                className={`flex-1 flex items-center gap-4 p-6 ${
                  index !== statConfig.length - 1 ? 'border-b sm:border-b-0 sm:border-r border-border' : ''
                }`}
              >
                <div className={`rounded-lg p-3 ${stat.bgColor} flex-shrink-0`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}