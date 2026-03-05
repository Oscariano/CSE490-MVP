"use client"

import { useState, useEffect } from "react"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { initializeFirebase } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Clock, CheckCircle2, AlertCircle, Image as ImageIcon } from "lucide-react"
import { format } from "date-fns"

interface Item {
  id: string
  name: string
  category: string
  description: string
  dateLogged: Date | null
  expirationDate: Date | null
  status: string
  storageLocation: string
  imageUrl?: string
  orgId: string
}

function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case 'matched':
      return (
        <Badge className="gap-1 bg-accent text-accent-foreground">
          <CheckCircle2 className="h-3 w-3" />
          AI Match Found
        </Badge>
      )
    case 'claimed':
      return (
        <Badge variant="outline" className="gap-1 text-emerald-700 border-emerald-700">
          <CheckCircle2 className="h-3 w-3" />
          Claimed
        </Badge>
      )
    case 'expiring':
      return (
        <Badge className="gap-1 bg-orange-700 text-white hover:bg-orange-800">
          <AlertCircle className="h-3 w-3" />
          Expiring Soon
        </Badge>
      )
    case 'available':
      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Available
        </Badge>
      )
    default:
      return <Badge variant="secondary" className="capitalize">{status}</Badge>
  }
}

export function ItemList() {
  const { userProfile } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userProfile?.orgId) return

    const { db } = initializeFirebase()
    
    // Query items strictly belonging to the user's organization
    const q = query(
      collection(db, 'items'),
      where('orgId', '==', userProfile.orgId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedItems = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          // Convert Firestore Timestamps to native JS Dates safely
          dateLogged: data.dateLogged?.toDate() || null,
          expirationDate: data.expirationDate?.toDate() || null,
        } as Item
      })

      // Sort client-side to avoid needing a custom Firebase index immediately
      fetchedItems.sort((a, b) => {
        const dateA = a.dateLogged?.getTime() || 0
        const dateB = b.dateLogged?.getTime() || 0
        return dateB - dateA // Descending order (newest first)
      })

      setItems(fetchedItems)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching items:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userProfile?.orgId])

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        Loading inventory...
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
        <h3 className="text-lg font-medium">No items found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Items added to your organization will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader className="border-b border-border bg-muted/30">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-16">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date Logged</TableHead>
            <TableHead>Expiration</TableHead>
            <TableHead>Storage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="border-border hover:bg-muted/50 transition-colors">
              <TableCell className="py-3">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="h-10 w-10 rounded-md object-cover border border-border"
                    onError={(e) => {
                      // Fallback if the URL breaks
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=?'
                    }}
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted border border-border">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground capitalize">{item.category}</TableCell>
              <TableCell className="text-sm">
                {item.dateLogged ? format(item.dateLogged, 'MMM d, yyyy') : 'N/A'}
              </TableCell>
              <TableCell className="text-sm">
                {item.expirationDate ? format(item.expirationDate, 'MMM d, yyyy') : 'N/A'}
              </TableCell>
              <TableCell className="text-sm font-medium">{item.storageLocation || 'Unassigned'}</TableCell>
              <TableCell>{getStatusBadge(item.status)}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}