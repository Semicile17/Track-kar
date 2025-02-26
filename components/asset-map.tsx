"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Trash2, Search, Calendar, Clock, Gauge, MapPin, Info, History, Navigation2, Package } from "lucide-react"
import { GoogleMap, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api"
import { Autocomplete } from "@react-google-maps/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DeleteAssetDialog } from "@/components/delete-asset-dialog"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { LoadingCar } from "./ui/loading-car"

interface Asset {
  id: string
  name: string
  assetId: string
  gpsId: string
  status: string
  type: string
  trackerId: string
  location: {
    latitude: number
    longitude: number
    timestamp?: string
  }
}

interface AssetMapProps {
  asset: Asset
  onEdit: (id: string, data: Partial<Asset>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
}

const center = {
  lat: 51.5074,
  lng: -0.1278,
}

// Simulate asset movement within a boundary
const generateNewLocation = (currentLocation: { lat: number; lng: number }) => {
  const movement = 0.001 // Approximately 100 meters
  return {
    lat: currentLocation.lat + (Math.random() - 0.5) * movement,
    lng: currentLocation.lng + (Math.random() - 0.5) * movement,
  }
}

const getCardinalDirection = (angle: number): string => {
  const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest']
  const index = Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 45) % 8
  return directions[index]
}

const calculateHeading = (prev: google.maps.LatLngLiteral, current: google.maps.LatLngLiteral): number => {
  const lat1 = prev.lat * Math.PI / 180
  const lat2 = current.lat * Math.PI / 180
  const lng1 = prev.lng * Math.PI / 180
  const lng2 = current.lng * Math.PI / 180

  const y = Math.sin(lng2 - lng1) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) -
          Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1)
  const angle = Math.atan2(y, x) * 180 / Math.PI
  return (angle + 360) % 360
}

// Mock history data
const mockHistoryData = [
  {
    date: "2024-01-20",
    locations: [
      { time: "09:00", location: { lat: 51.5074, lng: -0.1278 }, address: "Warehouse A" },
      { time: "14:30", location: { lat: 51.5171, lng: -0.1404 }, address: "Storage Unit B" },
    ]
  },
  {
    date: "2024-01-19",
    locations: [
      { time: "10:15", location: { lat: 51.5074, lng: -0.1278 }, address: "Factory Floor" },
      { time: "16:45", location: { lat: 51.5171, lng: -0.1404 }, address: "Loading Bay" },
    ]
  },
]

export function AssetMap({ asset, onEdit, onDelete }: AssetMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [searchBox, setSearchBox] = useState<google.maps.places.Autocomplete | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentLocation, setCurrentLocation] = useState({
    lat: asset.location?.latitude ?? center.lat,
    lng: asset.location?.longitude ?? center.lng
  })
  const [pathCoordinates, setPathCoordinates] = useState<google.maps.LatLngLiteral[]>([])
  const [isMoving, setIsMoving] = useState(false)
  const [locationName, setLocationName] = useState("")
  const [heading, setHeading] = useState("")
  const lastUpdateTime = useRef(Date.now())
  const geocoder = useRef<google.maps.Geocoder | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [selectedHistoryLocation, setSelectedHistoryLocation] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [location, setLocation] = useState<google.maps.LatLngLiteral>({
    lat: asset.location?.latitude ?? center.lat,
    lng: asset.location?.longitude ?? center.lng
  })
  const [isLoading, setIsLoading] = useState(false)
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"]
  })

  // Initialize geocoder
  useEffect(() => {
    if (isLoaded && !geocoder.current) {
      geocoder.current = new google.maps.Geocoder()
    }
  }, [isLoaded])

  // Update location name
  useEffect(() => {
    if (geocoder.current && currentLocation) {
      geocoder.current.geocode(
        { location: currentLocation },
        (results, status) => {
          if (status === 'OK' && results?.[0]) {
            const address = results[0].formatted_address
            setLocationName(address)
          }
        }
      )
    }
  }, [currentLocation])

  // Simulate real-time updates
  useEffect(() => {
    setIsMoving(false)
    const initialLocation = {
      lat: asset.location?.latitude ?? center.lat,
      lng: asset.location?.longitude ?? center.lng
    }
    setCurrentLocation(initialLocation)
    setPathCoordinates([])
    
    if (map) {
      map.panTo(initialLocation)
    }
  }, [map, asset.location])

  useEffect(() => {
    const pollLocation = async () => {
      try {
        const data = await api.getAsset(asset.gpsId);
        if (data?.location) {
          const newLocation = {
            lat: data.location.latitude,
            lng: data.location.longitude
          }
          setLocation(newLocation)
          setCurrentLocation(newLocation)
        }
      } catch (error) {
        console.error("Error fetching location:", error)
      }
    }

    pollLocation()
    const interval = setInterval(pollLocation, 30000)
    return () => clearInterval(interval)
  }, [asset.gpsId])

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

  const handleHistorySelect = () => {
    if (selectedDate && selectedTime) {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const dayHistory = mockHistoryData.find(h => h.date === dateStr)
      const locationAtTime = dayHistory?.locations.find(l => l.time === selectedTime)
      
      if (locationAtTime) {
        setSelectedHistoryLocation(locationAtTime)
        if (map) {
          map.panTo(locationAtTime.location)
          map.setZoom(15)
        }
      }
      setHistoryDialogOpen(false)
    }
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    onDelete(asset.id)
    setDeleteDialogOpen(false)
  }

  if (loadError) {
    console.error("Error loading maps:", loadError)
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] lg:min-h-[calc(100vh-4rem)] gap-4">
      {/* Header Section */}
      <Card className="p-4 border-none shadow-md bg-gradient-to-r from-background to-secondary/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">{asset.name}</h2>
              <Badge variant="outline" className="text-xs font-normal">
                {asset.type}
              </Badge>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center text-sm text-gray-500">
                <Info className="h-4 w-4 mr-2 text-primary" />
                <span>Asset ID: {asset.assetId}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                <span>Location: {locationName || "Loading location..."}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Gauge className="h-4 w-4 mr-2 text-primary" />
                <span>Status: </span>
                <span className="ml-1 inline-flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-1 ${isMoving ? 'bg-green-500' : 'bg-red-500'}`} />
                  {isMoving ? "Moving" : "Stationary"}
                </span>
              </div>
              {isMoving && heading && (
                <div className="flex items-center text-sm text-gray-500">
                  <Navigation2 className="h-4 w-4 mr-2 text-primary" />
                  <span>Heading: {heading}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 min-w-[250px]">
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
                    className="pr-8 bg-background/60 backdrop-blur-sm"
                  />
                </Autocomplete>
              )}
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => onEdit(asset.id, {})}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Asset</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete Asset</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1">
        {/* Map Section */}
        <div className="flex-1 min-h-[400px] lg:min-h-0">
          <Card className="border-none shadow-md overflow-hidden h-full">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 'inherit'
                }}
                center={currentLocation}
                zoom={15}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: true,
                  styles: [
                    {
                      featureType: "all",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#6b7280" }]
                    },
                    {
                      featureType: "water",
                      elementType: "geometry",
                      stylers: [{ color: "#dbeafe" }]
                    }
                  ]
                }}
              >
                <Marker
                  position={currentLocation}
                  icon={{
                    url: `https://maps.google.com/mapfiles/ms/icons/${isMoving ? 'green' : 'red'}-dot.png`,
                    scaledSize: new google.maps.Size(40, 40)
                  }}
                />
                {isMoving && pathCoordinates.length > 1 && (
                  <Polyline
                    path={pathCoordinates}
                    options={{
                      strokeColor: "#2563eb",
                      strokeOpacity: 0.8,
                      strokeWeight: 3,
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

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-2 overflow-y-auto">
          {/* Asset Info Card */}
          <Card className="p-3 border-none shadow-md bg-gradient-to-b from-background to-secondary/5">
            <div className="flex items-center gap-1.5 mb-2">
              <Info className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Asset Details</h3>
            </div>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex justify-between items-center pb-1.5 border-b">
                <span>Type</span>
                <span className="font-medium">{asset.type}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b">
                <span>Tracker ID</span>
                <span className="font-medium">{asset.trackerId}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b">
                <span>Status</span>
                <span className={`font-medium ${isMoving ? 'text-green-500' : 'text-red-500'}`}>
                  {isMoving ? "Moving" : "Stationary"}
                </span>
              </div>
            </div>
          </Card>

          {/* Location Info Card */}
          <Card className="p-3 border-none shadow-md bg-gradient-to-b from-background to-secondary/5">
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Location Details</h3>
            </div>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex justify-between items-center pb-1.5 border-b">
                <span>Last Updated</span>
                <span className="font-medium">Just now</span>
              </div>
              <div className="pb-1.5 border-b">
                <div className="flex justify-between items-center mb-0.5">
                  <span>Coordinates</span>
                </div>
                <div className="text-[10px] font-mono bg-secondary/20 p-1 rounded">
                  {location?.lat?.toFixed(6)}, {location?.lng?.toFixed(6)}
                </div>
              </div>
              <div className="pb-1.5 border-b">
                <span>Location</span>
                <p className="mt-0.5 text-[10px]">{locationName || "Loading..."}</p>
              </div>
            </div>
          </Card>

          {/* History Card */}
          <Card className="p-3 border-none shadow-md bg-gradient-to-b from-background to-secondary/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <History className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Movement History</h3>
              </div>
              <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-6 text-xs">
                    See More
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
                  <DialogHeader className="px-6 py-4 border-b bg-background sticky top-0 z-10">
                    <DialogTitle className="text-xl">Asset Movement History</DialogTitle>
                  </DialogHeader>
                  <div className="p-6 overflow-y-auto max-h-[80vh]">
                    <div className="space-y-6">
                      {/* Date Selection */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          Select Date
                        </Label>
                        <div className="border rounded-lg bg-muted/30">
                          <CalendarComponent
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="[&>div]:!bg-transparent [&_.rdp-day_focus]:bg-primary [&_.rdp-day_hover]:bg-primary/10"
                            initialFocus
                            disabled={(date) => date > new Date()}
                          />
                        </div>
                      </div>

                      {/* Time Selection - Shows up when date is selected */}
                      {selectedDate && (
                        <div 
                          className="space-y-2 animate-in fade-in-50 slide-in-from-top-3 duration-300"
                          style={{ '--enter-delay': '200ms' } as React.CSSProperties}
                        >
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            Select Time
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedDate && mockHistoryData
                              .find(h => h.date === selectedDate.toISOString().split('T')[0])
                              ?.locations.map(l => (
                                <Button
                                  key={l.time}
                                  variant={selectedTime === l.time ? "default" : "outline"}
                                  className={cn(
                                    "w-full justify-start text-sm",
                                    selectedTime === l.time && "bg-primary text-primary-foreground"
                                  )}
                                  onClick={() => setSelectedTime(l.time)}
                                >
                                  <Clock className="mr-2 h-4 w-4" />
                                  {l.time}
                                </Button>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Location Details - Shows up when both date and time are selected */}
                      {selectedDate && selectedTime && (
                        <div 
                          className="space-y-2 animate-in fade-in-50 slide-in-from-top-3 duration-300"
                          style={{ '--enter-delay': '400ms' } as React.CSSProperties}
                        >
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            Location Details
                          </Label>
                          <Card className="p-4 bg-muted/30 border shadow-sm">
                            {selectedHistoryLocation ? (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b">
                                  <span className="text-sm text-muted-foreground">Time</span>
                                  <span className="font-medium">{selectedTime}</span>
                                </div>
                                <div className="flex items-center justify-between pb-2 border-b">
                                  <span className="text-sm text-muted-foreground">Location</span>
                                  <span className="font-medium text-right">{selectedHistoryLocation.address}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Coordinates</span>
                                  <span className="font-mono text-xs bg-muted p-1 rounded">
                                    {selectedHistoryLocation.location.lat.toFixed(6)}, {selectedHistoryLocation.location.lng.toFixed(6)}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-2">
                                Select a date and time to view location details
                              </p>
                            )}
                          </Card>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end mt-6">
                      <Button 
                        onClick={handleHistorySelect}
                        disabled={!selectedDate || !selectedTime}
                        className="bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90 transition-all duration-300"
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        View on Map
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-2">
              {mockHistoryData.slice(0, 3).map((day) => (
                <div key={day.date} className="space-y-1 pb-2 border-b last:border-0">
                  <div className="flex items-center text-xs font-medium text-primary/80">
                    <Calendar className="h-3 w-3 mr-1.5" />
                    {new Date(day.date).toLocaleDateString()}
                  </div>
                  {day.locations.map((loc) => (
                    <div key={loc.time} className="ml-4 text-[10px] text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-2.5 w-2.5 mr-1.5" />
                        <span className="font-medium">{loc.time}</span>
                        <span className="mx-1.5">-</span>
                        <span className="text-[10px]">{loc.address}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <DeleteAssetDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        assetName={asset.name}
        assetId={asset.assetId}
      />
    </div>
  )
}