"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Trash2, Search, Calendar, Clock, Gauge, MapPin, Info, History, Navigation2 } from "lucide-react"
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

// Simulate vehicle movement within a boundary
const generateNewLocation = (currentLocation: { lat: number; lng: number }) => {
  const movement = 0.001; // Approximately 100 meters
  return {
    lat: currentLocation.lat + (Math.random() - 0.5) * movement,
    lng: currentLocation.lng + (Math.random() - 0.5) * movement,
  };
};

const getCardinalDirection = (angle: number): string => {
  const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
  const index = Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 45) % 8;
  return directions[index];
};

const calculateHeading = (prev: google.maps.LatLngLiteral, current: google.maps.LatLngLiteral): number => {
  const lat1 = prev.lat * Math.PI / 180;
  const lat2 = current.lat * Math.PI / 180;
  const lng1 = prev.lng * Math.PI / 180;
  const lng2 = current.lng * Math.PI / 180;

  const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
          Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
  const angle = Math.atan2(y, x) * 180 / Math.PI;
  return (angle + 360) % 360;
};

// Mock history data
const mockHistoryData = [
  {
    date: "2024-01-20",
    locations: [
      { time: "09:00", location: { lat: 51.5074, lng: -0.1278 }, address: "London Bridge" },
      { time: "14:30", location: { lat: 51.5171, lng: -0.1404 }, address: "Oxford Street" },
    ]
  },
  {
    date: "2024-01-19",
    locations: [
      { time: "10:15", location: { lat: 51.5074, lng: -0.1278 }, address: "Piccadilly Circus" },
      { time: "16:45", location: { lat: 51.5171, lng: -0.1404 }, address: "Covent Garden" },
    ]
  },
  // Add more mock data as needed
];

export default function VehicleMap({ vehicle, onEdit, onDelete }: VehicleMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [searchBox, setSearchBox] = useState<google.maps.places.Autocomplete | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentLocation, setCurrentLocation] = useState(vehicle.location || center)
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
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"]
  })

  // Initialize geocoder
  useEffect(() => {
    if (isLoaded && !geocoder.current) {
      geocoder.current = new google.maps.Geocoder();
    }
  }, [isLoaded]);

  // Update location name
  useEffect(() => {
    if (geocoder.current && currentLocation) {
      geocoder.current.geocode(
        { location: currentLocation },
        (results, status) => {
          if (status === 'OK' && results?.[0]) {
            // Get the most relevant address component
            const address = results[0].formatted_address;
            setLocationName(address);
          }
        }
      );
    }
  }, [currentLocation]);

  // Simulate real-time updates
  useEffect(() => {
    // Set vehicle as stationary
    setIsMoving(false);
    
    // Keep the vehicle at its initial position
    const initialLocation = vehicle.location || center;
    setCurrentLocation(initialLocation);
    
    // Clear any existing path
    setPathCoordinates([]);
    
    // Center map on the stationary location
    if (map) {
      map.panTo(initialLocation);
    }
  }, [map, vehicle.location]);

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

  if (loadError) {
    console.error("Error loading maps:", loadError)
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem-3rem)] pb-16 lg:pb-24">
      {/* Header Section */}
      <Card className="p-4 border-none shadow-md bg-gradient-to-r from-background to-secondary/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">{vehicle.name}</h2>
              <Badge variant="outline" className="text-xs font-normal">
                {vehicle.type}
              </Badge>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center text-sm text-gray-500">
                <Info className="h-4 w-4 mr-2 text-primary" />
                <span>Plate Number: {vehicle.plateNumber}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                <span>Near: {locationName || "Loading location..."}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Gauge className="h-4 w-4 mr-2 text-primary" />
                <span>Status: </span>
                <span className="ml-1 inline-flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-1 ${isMoving ? 'bg-green-500' : 'bg-red-500'}`} />
                  {isMoving ? "Moving" : "At Rest"}
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
                  <Button variant="outline" size="icon" onClick={() => onEdit(vehicle)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Vehicle</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="destructive" size="icon" onClick={() => onDelete(vehicle)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete Vehicle</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden">
        {/* Map Section */}
        <div className="flex-1 min-h-[300px] lg:min-h-0">
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
          {/* Vehicle Info Card */}
          <Card className="p-3 border-none shadow-md bg-gradient-to-b from-background to-secondary/5">
            <div className="flex items-center gap-1.5 mb-2">
              <Info className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Vehicle Details</h3>
            </div>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex justify-between items-center pb-1.5 border-b">
                <span>Type</span>
                <span className="font-medium">{vehicle.type}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b">
                <span>GPS ID</span>
                <span className="font-medium">{vehicle.gpsId}</span>
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
                  {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
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
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Location History</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Date</label>
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Time</label>
                      <Select onValueChange={setSelectedTime} value={selectedTime}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedDate && mockHistoryData
                            .find(h => h.date === selectedDate.toISOString().split('T')[0])
                            ?.locations.map(l => (
                              <SelectItem key={l.time} value={l.time}>
                                {l.time}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleHistorySelect}>View Location</Button>
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
    </div>
  )
}

