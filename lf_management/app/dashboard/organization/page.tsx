"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { initializeFirebase } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Users, Edit2, Plus, Building2 } from "lucide-react"

interface OrgDetails {
  name: string
  type: string
  address: string
  phone: string
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: string
}

interface Location {
  id: string
  name: string
  items?: number // Optional: if you decide to track item count per location later
}

export default function OrganizationPage() {
  const { userProfile } = useAuth()
  
  const [orgDetails, setOrgDetails] = useState<OrgDetails | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait until we have the user's profile and orgId
    if (!userProfile?.orgId) return

    async function fetchOrganizationData() {
      const { db } = initializeFirebase()
      setLoading(true)

      try {
        // 1. Fetch Organization Details
        const orgRef = doc(db, 'organizations', userProfile!.orgId)
        const orgSnap = await getDoc(orgRef)
        if (orgSnap.exists()) {
          setOrgDetails(orgSnap.data() as OrgDetails)
        }

        // 2. Fetch Team Members in the same org
        const usersRef = collection(db, 'users')
        const usersQuery = query(usersRef, where('orgId', '==', userProfile!.orgId))
        const usersSnap = await getDocs(usersQuery)
        const membersData = usersSnap.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || 'Unknown User', // Fallback if name isn't set yet
          email: doc.data().email,
          role: doc.data().role,
          status: doc.data().status,
        }))
        setTeamMembers(membersData)

        // 3. Fetch Departments/Locations for this org
        const locsRef = collection(db, 'locations')
        const locsQuery = query(locsRef, where('orgId', '==', userProfile!.orgId))
        const locsSnap = await getDocs(locsQuery)
        const locsData = locsSnap.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          items: doc.data().items || 0,
        }))
        setLocations(locsData)

      } catch (error) {
        console.error("Error fetching organization data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizationData()
  }, [userProfile?.orgId])

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading organization data...</div>
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Administration</h1>
        <p className="text-muted-foreground mt-2">Manage your organization settings and team members</p>
      </div>

      {/* Organization Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Update your organization information</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2 border-border">
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm">Organization Name</Label>
              <p className="text-foreground">{orgDetails?.name || 'Not configured'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Organization Type</Label>
              <p className="text-foreground">{orgDetails?.type || 'Not configured'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Address</Label>
              <p className="text-foreground">{orgDetails?.address || 'Not configured'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Phone</Label>
              <p className="text-foreground">{orgDetails?.phone || 'Not configured'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="bg-border" />

      {/* Team Members */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>Manage staff and permissions</CardDescription>
            </div>
            <Button size="sm" className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No team members found.</p>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent font-semibold uppercase">
                      {member.name !== 'Unknown User' ? member.name.charAt(0) : member.email.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{member.role}</p>
                      <p className="text-xs text-green-600">{member.status}</p>
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Departments */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Departments/Locations</CardTitle>
              <CardDescription>Manage collection points</CardDescription>
            </div>
            <Button size="sm" className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <Building2 className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No locations added yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {locations.map((dept) => (
                <div key={dept.id} className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{dept.name}</p>
                      <p className="text-sm text-muted-foreground">{dept.items} items in inventory</p>
                    </div>
                    <Button variant="ghost" size="sm">Manage</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}