'use client'

import { useState, useRef } from 'react'
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
import { Plus, Upload, Loader2, Sparkles, X, MapPin } from "lucide-react"
import { toast } from "sonner"
import { identifyItem, generateDescriptionFromAI } from "@/lib/image-recognition"
import { ITEM_CATEGORIES, STORAGE_LOCATIONS } from "@/lib/types"
import type { AIDescription, ItemLocation } from "@/lib/types"
import { LocationPicker } from "@/components/location-picker"

export function AddItemDialog() {
  const [open, setOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [aiDescription, setAiDescription] = useState<AIDescription | null>(null)
  const [foundLocation, setFoundLocation] = useState<ItemLocation | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    dateFound: '',
    location: '',
    storageLocation: '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setIsAnalyzing(true)
    toast.info("Analyzing image with AI...")

    try {
      const result = await identifyItem(file)
      if (result) {
        setAiDescription(result)
        const generatedDescription = generateDescriptionFromAI(result)
        setFormData(prev => ({
          ...prev,
          name: result.item ? `${result.color} ${result.item}`.trim() : prev.name,
          description: generatedDescription,
        }))
        toast.success("AI analysis complete!", {
          description: `Detected: ${result.item} (${Math.round(result.confidence * 100)}% confidence)`,
        })
      } else {
        toast.warning("Could not identify item", {
          description: "Please enter details manually.",
        })
      }
    } catch {
      toast.error("Failed to analyze image", {
        description: "Please try again or enter details manually.",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearImage = () => {
    setImagePreview(null)
    setAiDescription(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success("Item added to inventory")
    setOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      dateFound: '',
      location: '',
      storageLocation: '',
    })
    setImagePreview(null)
    setAiDescription(null)
    setFoundLocation(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
            Upload an image for AI-powered description or enter details manually.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Left column: form fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Item Image</Label>
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative rounded-lg overflow-hidden border border-border">
                      <img
                        src={imagePreview}
                        alt="Item preview"
                        className="w-full h-40 object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={clearImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {aiDescription && (
                        <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1 text-xs">
                          <Sparkles className="h-3 w-3 text-accent" />
                          <span>AI: {aiDescription.item} ({Math.round(aiDescription.confidence * 100)}%)</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-lg cursor-pointer bg-background hover:bg-muted/50 transition-colors"
                    >
                      {isAnalyzing ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-6 w-6 animate-spin text-accent" />
                          <span className="text-sm text-muted-foreground">Analyzing with AI...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Upload image for AI analysis
                          </span>
                          <span className="text-xs text-muted-foreground">
                            PNG, JPG up to 10MB
                          </span>
                        </div>
                      )}
                    </label>
                  )}
                  <input
                    ref={fileInputRef}
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isAnalyzing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-name">Item Name</Label>
                <Input
                  id="item-name"
                  placeholder="e.g., Black Leather Wallet"
                  className="bg-background border-border"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
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
                <Label htmlFor="description">
                  Description
                  {aiDescription && (
                    <span className="ml-2 text-xs text-accent font-normal">
                      (AI-generated)
                    </span>
                  )}
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the item in detail (color, condition, distinctive marks, etc.)"
                  className="bg-background border-border resize-none"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage-location">Storage Location</Label>
                <Select
                  value={formData.storageLocation}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, storageLocation: value }))}
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
                      setFormData(prev => ({ ...prev, location: loc.address }))
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
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={isAnalyzing}
            >
              Add Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
