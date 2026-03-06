"use client"

import { useState, useRef } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { initializeFirebase } from '@/lib/firebase'
import { useAuth } from '@/contexts/auth-context'
import { identifyItem, generateDescriptionFromAI } from '@/lib/image-recognition'

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
import { Plus, Image as ImageIcon, MapPin, Camera, Link } from "lucide-react"
import { toast } from "sonner"
import { ITEM_CATEGORIES, STORAGE_LOCATIONS } from "@/lib/types"
import type { ItemLocation } from "@/lib/types"
import { LocationPicker } from "@/components/location-picker"

export function AddItemDialog() {
  const { userProfile } = useAuth()
  
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [foundLocation, setFoundLocation] = useState<ItemLocation | null>(null)
  const [captureMode, setCaptureMode] = useState<'url' | 'camera'>('url')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    dateFound: '',
    storageLocation: '',
    imageUrl: '',
    imageBase64: '',
  })

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      toast.error("Could not access camera", { description: "Please check your browser permissions." })
      setCaptureMode('url')
    }
  }

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
  }

  const capturePhoto = async () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg')

    setFormData(prev => ({ ...prev, imageBase64: dataUrl, imageUrl: dataUrl }))
    stopCamera()
    setCaptureMode('url')
    toast.success("Photo captured!")

    try {
      setIsAnalyzing(true)
      const toastId = toast.loading("Analyzing image...")

      // Convert base64 to File and use partner's utility
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' })
      const data = await identifyItem(file)

      toast.dismiss(toastId)

      if (data) {
        setFormData(prev => ({
          ...prev,
          imageBase64: dataUrl,
          imageUrl: dataUrl,
          name: prev.name || data.item,
          description: prev.description || generateDescriptionFromAI(data),
        }))
        toast.success(`Detected: ${data.color} ${data.item}`, {
          description: `Confidence: ${(data.confidence * 100).toFixed(0)}%`
        })
      } else {
        toast.warning("Couldn't identify item", { description: "Fill in details manually." })
      }
    } catch (err) {
      toast.error("Image analysis failed", { description: "Fill in details manually." })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSwitchToCamera = () => {
    setCaptureMode('camera')
    startCamera()
  }

  const handleSwitchToUrl = () => {
    stopCamera()
    setCaptureMode('url')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userProfile?.orgId) {
      toast.error("Error: No organization linked to your account.")
      return
    }

    setIsSubmitting(true)

    try {
      const { db } = initializeFirebase()
      
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
        imageBase64: formData.imageBase64 || null,
        orgId: userProfile.orgId
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
    stopCamera()
    setCaptureMode('url')
    setFormData({
      name: '',
      category: '',
      description: '',
      dateFound: '',
      storageLocation: '',
      imageUrl: '',
      imageBase64: '',
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
            Enter the details of the item and provide an image.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Left column: form fields */}
            <div className="space-y-4">
              
              <div className="space-y-2">
                <Label>Item Image</Label>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={captureMode === 'url' ? 'default' : 'outline'}
                    className="gap-1.5"
                    onClick={handleSwitchToUrl}
                  >
                    <Link className="h-3.5 w-3.5" />
                    Image URL
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={captureMode === 'camera' ? 'default' : 'outline'}
                    className="gap-1.5"
                    onClick={handleSwitchToCamera}
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Take Photo
                  </Button>
                </div>

                {captureMode === 'url' && (
                  <Input
                    id="image-url"
                    placeholder="https://example.com/image.jpg"
                    className="bg-background border-border"
                    value={formData.imageBase64 ? '' : formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value, imageBase64: '' }))}
                  />
                )}

                {captureMode === 'camera' && (
                  <div className="relative rounded-lg overflow-hidden border border-border bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      type="button"
                      onClick={capturePhoto}
                      disabled={isAnalyzing}
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white text-black hover:bg-gray-100 gap-1.5"
                    >
                      <Camera className="h-4 w-4" />
                      Capture
                    </Button>
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />

                {formData.imageUrl && captureMode === 'url' ? (
                  <div className="relative mt-2 rounded-lg overflow-hidden border border-border">
                    <img
                      src={formData.imageUrl}
                      alt="Item preview"
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL'
                      }}
                    />
                    {formData.imageBase64 && (
                      <div className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">
                        📷 Captured
                      </div>
                    )}
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <p className="text-white text-sm font-medium">Analyzing...</p>
                      </div>
                    )}
                  </div>
                ) : captureMode === 'url' && (
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
              disabled={isSubmitting || isAnalyzing}
            >
              {isSubmitting ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}