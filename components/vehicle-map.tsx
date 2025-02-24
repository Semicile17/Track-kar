"use client"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Trash2, Search } from "lucide-react"
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api"
import { Autocomplete } from "@react-google-maps/api"

interface Vehicle {
  id: number
  name: string
  plateNumber: string
  status: string
  type: string
  gpsId: string
  location?: {
    lat: number
    lng: number
  }
}

interface VehicleMapProps {
  vehicle: Vehicle
  onEdit: (vehicle: Vehicle) => void
  onDelete: (vehicle: Vehicle) => void
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
}

const center = {
  lat: 51.5074,
  lng: -0.1278,
}

export default function VehicleMap({ vehicle, onEdit, onDelete }: VehicleMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [searchBox, setSearchBox] = useState<google.maps.places.Autocomplete | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"]
  })

  const onLoad = (map: google.maps.Map) => {
    setMap(map)
  }

  const onUnmount = () => {
    setMap(null)
  }

  const onPlaceChanged = () => {
    if (searchBox) {
      const place = searchBox.getPlace()
      if (place.geometry && place.geometry.location) {
        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        }
        map?.panTo(newLocation)
        map?.setZoom(15)
      }
    }
  }

  const onSearchBoxLoad = (ref: google.maps.places.Autocomplete) => {
    setSearchBox(ref)
  }

  if (loadError) {
    console.error("Error loading maps:", loadError)
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{vehicle.name}</h2>
          <p className="text-sm text-gray-500">Plate Number: {vehicle.plateNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            {isLoaded && (
              <Autocomplete
                onLoad={onSearchBoxLoad}
                onPlaceChanged={onPlaceChanged}
              >
                <Input
                  type="text"
                  placeholder="Search location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-8"
                />
              </Autocomplete>
            )}
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          <Badge variant={vehicle.status === "active" ? "default" : "secondary"}>{vehicle.status}</Badge>
          <Button variant="outline" size="icon" onClick={() => onEdit(vehicle)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={() => onDelete(vehicle)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-4 flex-1">
        <div className="flex-1 min-h-[400px] lg:min-h-0">
          <Card className="h-full">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 'inherit'
                }}
                center={vehicle.location || center}
                zoom={13}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: true,
                }}
              >
                {vehicle.location && (
                  <Marker
                    position={vehicle.location}
                    icon={{
                      url: `https://maps.google.com/mapfiles/ms/icons/${vehicle.status === 'active' ? 'green' : 'red'}-dot.png`
                    }}
                  />
                )}
              </GoogleMap>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
                <p>{loadError ? 'Error loading map' : 'Loading map...'}</p>
              </div>
            )}
          </Card>
        </div>
        <div className="w-full lg:w-80 space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Vehicle Info</h3>
            <div className="space-y-2 text-sm text-gray-500">
              <p>Type: {vehicle.type}</p>
              <p>GPS ID: {vehicle.gpsId}</p>
              <p>Status: {vehicle.status}</p>
            </div>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Location Info</h3>
            <div className="space-y-2 text-sm text-gray-500">
              <p>Last Updated: 2 minutes ago</p>
              <p>Speed: 45 km/h</p>
              <p>Direction: North</p>
            </div>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Statistics</h3>
            <div className="space-y-2 text-sm text-gray-500">
              <p>Total Distance: 1,234 km</p>
              <p>Avg. Speed: 55 km/h</p>
              <p>Fuel Efficiency: Good</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

