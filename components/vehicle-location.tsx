"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { LoadingCar } from "./ui/loading-car"

interface VehicleLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
  speed: number;
}

export function VehicleLocation({ vehicleId }: { vehicleId: string }) {
  const [location, setLocation] = useState<VehicleLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const data = await api.getVehicleLocation(vehicleId);
        setLocation(data);
      } catch (error) {
        setError("Failed to fetch vehicle location");
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
    // Poll for location updates every 30 seconds
    const interval = setInterval(fetchLocation, 30000);

    return () => clearInterval(interval);
  }, [vehicleId]);

  if (loading) return <LoadingCar />;
  if (error) return <div className="text-destructive">{error}</div>;
  if (!location) return <div>No location data available</div>;

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Current Location</h3>
      <div className="space-y-2">
        <p>Latitude: {location.latitude}</p>
        <p>Longitude: {location.longitude}</p>
        <p>Speed: {location.speed} km/h</p>
        <p>Last Updated: {new Date(location.timestamp).toLocaleString()}</p>
      </div>
    </div>
  );
} 