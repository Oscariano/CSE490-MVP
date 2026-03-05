'use client'

import { useState, useCallback, useRef } from 'react'
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Check, Loader2, Search } from 'lucide-react'

interface LatLng {
  lat: number
  lng: number
}

interface LocationPickerProps {
  onConfirm: (location: { lat: number; lng: number; address: string }) => void
  defaultCenter?: LatLng
}

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem',
}

const DEFAULT_CENTER: LatLng = { lat: 47.6553, lng: -122.3035 }

export function LocationPicker({ onConfirm, defaultCenter = DEFAULT_CENTER }: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    libraries: ['places'],
  })

  const [marker, setMarker] = useState<LatLng | null>(null)
  const [address, setAddress] = useState('')
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const mapRef = useRef<google.maps.Map | null>(null)

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const reverseGeocode = useCallback((position: LatLng) => {
    if (!window.google) return
    setIsGeocoding(true)
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ location: position }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        setAddress(results[0].formatted_address)
      } else {
        setAddress(`${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`)
      }
      setIsGeocoding(false)
    })
  }, [])

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return
    const position = { lat: e.latLng.lat(), lng: e.latLng.lng() }
    setMarker(position)
    reverseGeocode(position)
  }, [reverseGeocode])

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim() || !window.google || !mapRef.current) return
    const geocoder = new google.maps.Geocoder()
    setIsGeocoding(true)
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const loc = results[0].geometry.location
        const position = { lat: loc.lat(), lng: loc.lng() }
        setMarker(position)
        setAddress(results[0].formatted_address)
        mapRef.current?.panTo(position)
        mapRef.current?.setZoom(17)
      }
      setIsGeocoding(false)
    })
  }, [searchQuery])

  const handleConfirm = () => {
    if (!marker) return
    onConfirm({ lat: marker.lat, lng: marker.lng, address })
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-destructive">
        Failed to load Google Maps
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading map...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex gap-2">
        <Input
          placeholder="Search for a location..."
          className="bg-background border-border text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleSearch}
          disabled={isGeocoding}
          className="shrink-0 border-border"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative flex-1 min-h-[200px] rounded-lg overflow-hidden border border-border">
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={marker ?? defaultCenter}
          zoom={15}
          onClick={handleMapClick}
          onLoad={onMapLoad}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {marker && <MarkerF position={marker} />}
        </GoogleMap>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0 text-accent" />
          {isGeocoding ? (
            <span className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Resolving address...
            </span>
          ) : marker ? (
            <span className="truncate" title={address}>{address}</span>
          ) : (
            <span className="italic">Click on the map to pick a location</span>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          disabled={!marker || isGeocoding}
          onClick={handleConfirm}
          className="gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground shrink-0"
        >
          <Check className="h-4 w-4" />
          Confirm Location
        </Button>
      </div>
    </div>
  )
}
