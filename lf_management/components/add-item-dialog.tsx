"use client"

import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { initializeFirebase } from '@/lib/firebase'
import { useAuth } from '@/contexts/auth-context'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Image as ImageIcon, MapPin } from "lucide-react"
import { toast } from "sonner"
import { ITEM_CATEGORIES, STORAGE_LOCATIONS } from "@/lib/types"
import type { ItemLocation } from "@/lib/types"
import { LocationPicker } from "@/components/location-picker"

export function AddItemDialog() {
  const { userProfile } = useAuth()
  
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [foundLocation, setFoundLocation] = useState<ItemLocation | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    dateFound: '',
    storageLocation: '',
    imageUrl: '', // Changed from file upload to simple URL string
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userProfile?.orgId) {
      toast.error("Error: No organization linked to your account.")
      return
    }

    setIsSubmitting(true)

    try {
      const { db } = initializeFirebase()
      
      // Auto-calculate expiration (e.g., 90 days from logging)
      const expiration = new Date()
      expiration.setDate(expiration.getDate() + 90)

      await addDoc(collection(db, 'items'), {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        dateFound: formData.dateFound ? new Date(formData.dateFound) : null,
        dateLogged: serverTimestamp(),
        expirationDate: expiration,
        storageLocation: formData.storageLocation,
        locationAddress: foundLocation?.address || null,
        coordinates: foundLocation ? { lat: foundLocation.lat, lng: foundLocation.lng } : null,
        status: 'available',
        imageUrl: formData.imageUrl,
        orgId: userProfile.orgId // Link item to the user's organization
      })

      toast.success("Item added to inventory")
      setOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error adding document: ", error)
      toast.error("Failed to add item to inventory")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      dateFound: '',
      storageLocation: '',
      imageUrl: '',
    })
    setFoundLocation(null)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="h-4 w-4" />
          Add New Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Catalog Lost Item</DialogTitle>
          <DialogDescription>
            Enter the details of the item and provide an image link.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Left column: form fields */}
            <div className="space-y-4">
              
              {/* Replaced File Upload with Image URL Input */}
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  placeholder="https://example.com/image.jpg"
                  className="bg-background border-border"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                />
                
                {formData.imageUrl ? (
                  <div className="relative mt-2 rounded-lg overflow-hidden border border-border">
                    <img
                      src={formData.imageUrl}
                      alt="Item preview"
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL'
                      }}
                    />
                  </div>
                ) : (
                  <div className="mt-2 flex h-32 w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/50">
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <ImageIcon className="h-6 w-6" />
                      <span className="text-xs">Image Preview</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-name">Item Name</Label>
                <Input
                  id="item-name"
                  placeholder="e.g., Black Leather Wallet"
                  className="bg-background border-border"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  required
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEM_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the item in detail (color, condition, distinctive marks, etc.)"
                  className="bg-background border-border resize-none"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-found">Date Found</Label>
                <Input
                  id="date-found"
                  type="date"
                  className="bg-background border-border"
                  value={formData.dateFound}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateFound: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage-location">Storage Location</Label>
                <Select
                  value={formData.storageLocation}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, storageLocation: value }))}
                  required
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select storage location" />
                  </SelectTrigger>
                  <SelectContent>
                    {STORAGE_LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location.toLowerCase().replace(/\s+/g, '-')}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right column: map location picker */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                Location Found
              </Label>
              {foundLocation ? (
                <div className="flex flex-col gap-3 h-[calc(100%-2rem)]">
                  <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">Location confirmed</p>
                      <p className="text-xs text-muted-foreground truncate" title={foundLocation.address}>
                        {foundLocation.address}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {foundLocation.lat.toFixed(6)}, {foundLocation.lng.toFixed(6)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-xs"
                      onClick={() => setFoundLocation(null)}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-[calc(100%-2rem)]">
                  <LocationPicker
                    onConfirm={(loc) => {
                      setFoundLocation(loc)
                      toast.success("Location confirmed", {
                        description: loc.address,
                      })
                    }}
                  />
                </div>
              )}
            </div>
            
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="border-border"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}