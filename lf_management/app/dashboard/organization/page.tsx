import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Users, Edit2, Plus } from "lucide-react"

export default function OrganizationPage() {
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
              <p className="text-foreground">City Lost & Found Center</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Organization Type</Label>
              <p className="text-foreground">Municipal Service</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Address</Label>
              <p className="text-foreground">123 Main Street, City, State 12345</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Phone</Label>
              <p className="text-foreground">(555) 123-4567</p>
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
          <div className="space-y-4">
            {[
              { name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Administrator', status: 'Active' },
              { name: 'Mike Chen', email: 'mike@example.com', role: 'Staff', status: 'Active' },
              { name: 'Emma Wilson', email: 'emma@example.com', role: 'Staff', status: 'Active' },
            ].map((member, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-accent/20"></div>
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
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { name: 'Main Office', items: 12 },
              { name: 'Downtown Station', items: 8 },
              { name: 'Airport Terminal', items: 4 },
            ].map((dept, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-muted/30 p-4">
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
        </CardContent>
      </Card>
    </div>
  )
}
