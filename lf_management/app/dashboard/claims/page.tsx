"use client"

import { useState, useEffect, useMemo } from "react"
import { collection, onSnapshot, doc, updateDoc, orderBy, query } from "firebase/firestore"
import { initializeFirebase } from "@/lib/firebase"
import type { ClaimRequest, ClaimStatus } from "@/lib/types"

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, XCircle, Clock, Mail, User } from "lucide-react"
import { format } from "date-fns"

const STATUS_FILTERS = ["all", "pending", "approved", "rejected"] as const
type StatusFilter = (typeof STATUS_FILTERS)[number]

function getStatusBadge(status: ClaimStatus) {
  switch (status) {
    case "pending":
      return (
        <Badge className="gap-1 bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      )
    case "approved":
      return (
        <Badge className="gap-1 bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-100">
          <CheckCircle2 className="h-3 w-3" />
          Approved
        </Badge>
      )
    case "rejected":
      return (
        <Badge className="gap-1 bg-red-100 text-red-800 border-red-300 hover:bg-red-100">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      )
    default:
      return <Badge variant="secondary" className="capitalize">{status}</Badge>
  }
}

export default function ClaimsPage() {
  const [claims, setClaims] = useState<ClaimRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const { db } = initializeFirebase()
    const q = query(collection(db, "claims"), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched = snapshot.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            itemId: data.itemId,
            itemTitle: data.itemTitle,
            claimantName: data.claimantName,
            claimantEmail: data.claimantEmail,
            description: data.description,
            status: data.status,
            createdAt: data.createdAt?.toDate() ?? undefined,
          } satisfies ClaimRequest
        })
        setClaims(fetched)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching claims:", error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const filteredClaims = useMemo(
    () => (filter === "all" ? claims : claims.filter((c) => c.status === filter)),
    [claims, filter]
  )

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: claims.length }
    for (const c of claims) map[c.status] = (map[c.status] ?? 0) + 1
    return map
  }, [claims])

  async function handleStatusChange(claimId: string, newStatus: ClaimStatus) {
    setUpdating(claimId)
    try {
      const { db } = initializeFirebase()
      await updateDoc(doc(db, "claims", claimId), { status: newStatus })
    } catch (err) {
      console.error("Failed to update claim status:", err)
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Claim Requests</h1>
          <p className="text-muted-foreground mt-2">Review and manage ownership claims</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          Loading claims...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Claim Requests</h1>
        <p className="text-muted-foreground mt-2">Review and manage ownership claims</p>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as StatusFilter)}>
        <TabsList>
          {STATUS_FILTERS.map((s) => (
            <TabsTrigger key={s} value={s} className="capitalize">
              {s} {counts[s] ? `(${counts[s]})` : ""}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filteredClaims.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <h3 className="text-lg font-medium">No claims found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {filter === "all"
              ? "Claim requests submitted by users will appear here."
              : `No ${filter} claims at the moment.`}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader className="border-b border-border bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead>Item</TableHead>
                <TableHead>Claimant</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClaims.map((claim) => (
                <TableRow key={claim.id} className="border-border hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">
                    {claim.itemTitle || claim.itemId}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-sm">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {claim.claimantName}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {claim.claimantEmail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-xs">
                    <p className="truncate text-sm text-muted-foreground" title={claim.description}>
                      {claim.description}
                    </p>
                  </TableCell>
                  <TableCell>{getStatusBadge(claim.status)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {claim.createdAt ? format(claim.createdAt, "MMM d, yyyy") : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    {claim.status === "pending" ? (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                          disabled={updating === claim.id}
                          onClick={() => handleStatusChange(claim.id, "approved")}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-red-700 border-red-300 hover:bg-red-50 hover:text-red-800"
                          disabled={updating === claim.id}
                          onClick={() => handleStatusChange(claim.id, "rejected")}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground capitalize">{claim.status}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
