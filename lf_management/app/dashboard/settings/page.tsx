"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Bell, Lock, Palette, Database } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.")
      return
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.")
      return
    }
    if (!user || !user.email) return

    setPasswordLoading(true)
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, newPassword)
      toast.success("Password updated successfully.")
      setPasswordDialogOpen(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      toast.error("Failed to update password. Check your current password and try again.")
    } finally {
      setPasswordLoading(false)
    }
  }

  async function handleSignOutAllDevices() {
    try {
      await signOut()
      router.push("/login")
    } catch {
      toast.error("Failed to sign out.")
    }
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your preferences and system configuration</p>
      </div>

      {/* Notifications */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure alert preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="email-matches" className="text-base font-medium">Email notifications on AI matches</Label>
              <p className="text-sm text-muted-foreground">Get notified when AI finds a potential match</p>
            </div>
            <Switch id="email-matches" defaultChecked />
          </div>
          <Separator className="bg-border" />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="expiry-alerts" className="text-base font-medium">Expiration alerts</Label>
              <p className="text-sm text-muted-foreground">Receive reminders for items expiring soon</p>
            </div>
            <Switch id="expiry-alerts" defaultChecked />
          </div>
          <Separator className="bg-border" />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="daily-digest" className="text-base font-medium">Daily digest emails</Label>
              <p className="text-sm text-muted-foreground">Summary of daily activities</p>
            </div>
            <Switch id="daily-digest" />
          </div>
        </CardContent>
      </Card>

      {/* AI System */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>AI Matching System</CardTitle>
              <CardDescription>Configure automated matching</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="match-sensitivity" className="text-base font-medium">Match Sensitivity</Label>
            <p className="text-sm text-muted-foreground mb-3">Adjust how strict the AI matching is</p>
            <Select defaultValue="balanced">
              <SelectTrigger className="bg-background border-border w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strict">Strict (high confidence only)</SelectItem>
                <SelectItem value="balanced">Balanced (recommended)</SelectItem>
                <SelectItem value="loose">Loose (more suggestions)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator className="bg-border" />
          <div className="space-y-2">
            <Label htmlFor="item-retention" className="text-base font-medium">Item Retention Period</Label>
            <p className="text-sm text-muted-foreground mb-3">How long items are kept in inventory</p>
            <Select defaultValue="90days">
              <SelectTrigger className="bg-background border-border w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">30 days</SelectItem>
                <SelectItem value="60days">60 days</SelectItem>
                <SelectItem value="90days">90 days</SelectItem>
                <SelectItem value="180days">180 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator className="bg-border" />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-cleanup" className="text-base font-medium">Automatic cleanup</Label>
              <p className="text-sm text-muted-foreground">Archive expired items automatically</p>
            </div>
            <Switch id="auto-cleanup" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Display */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Display Preferences</CardTitle>
              <CardDescription>Customize how you view data</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="items-per-page" className="text-base font-medium">Items per page</Label>
            <Select defaultValue="25">
              <SelectTrigger className="bg-background border-border w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 items</SelectItem>
                <SelectItem value="25">25 items</SelectItem>
                <SelectItem value="50">50 items</SelectItem>
                <SelectItem value="100">100 items</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator className="bg-border" />
          <div className="space-y-2">
            <Label htmlFor="default-view" className="text-base font-medium">Default view</Label>
            <Select defaultValue="table">
              <SelectTrigger className="bg-background border-border w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="table">Table view</SelectItem>
                <SelectItem value="grid">Grid view</SelectItem>
                <SelectItem value="list">List view</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage account security</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="border-border w-full sm:w-auto"
            onClick={() => setPasswordDialogOpen(true)}
          >
            Change Password
          </Button>
          <div className="pt-2">
            <Button
              variant="outline"
              className="border-border border-red-600 text-red-600 hover:bg-red-600/10 w-full sm:w-auto"
              onClick={handleSignOutAllDevices}
            >
              Sign Out of All Devices
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
