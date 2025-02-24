"use client";

import { useState, useEffect } from "react";
import {
  Car,
  LogOut,
  Menu,
  Truck,
  Bus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import VehicleMap from "@/components/vehicle-map";
import { AddVehicleDialog } from "@/components/add-vehicle-dialog";
import { UserMenu } from "@/components/user-menu";
import { LoadingCar } from "@/components/ui/loading-car";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

const getVehicleIcon = (type: string) => {
  switch (type) {
    case "truck":
      return Truck;
    case "bus":
      return Bus;
    default:
      return Car;
  }
};

const initialVehicles = [
  {
    id: 1,
    name: "Vehicle 1",
    plateNumber: "ABC123",
    status: "active",
    type: "car",
    gpsId: "GPS001",
    location: { lat: 51.5074, lng: -0.1278 },
  },
  {
    id: 2,
    name: "Vehicle 2",
    plateNumber: "XYZ789",
    status: "inactive",
    type: "truck",
    gpsId: "GPS002",
    location: { lat: 51.5174, lng: -0.1378 },
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0]);
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useState(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  });

  const handleAddVehicle = (vehicleData: any) => {
    const newVehicle = {
      id: vehicles.length + 1,
      plateNumber: `TEMP${vehicles.length + 1}`,
      status: "inactive",
      location: { lat: 51.5074, lng: -0.1278 },
      ...vehicleData,
    };
    setVehicles([...vehicles, newVehicle]);
  };

  const handleEditVehicle = (vehicle: any) => {
    // Add edit logic
    console.log("Edit vehicle:", vehicle);
  };

  const handleDeleteVehicle = (vehicle: any) => {
    setVehicles(vehicles.filter((v) => v.id !== vehicle.id));
    if (selectedVehicle.id === vehicle.id) {
      setSelectedVehicle(vehicles[0]);
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-6">
        <Car className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-semibold">Track-kar</span>
      </div>
      
      {/* User Menu - only shown on desktop */}
      <div className="hidden lg:block">
        <UserMenu />
      </div>

      <div className="flex-1 mt-4">
        <nav className="px-2">
          {vehicles.map((vehicle) => {
            const VehicleIcon = getVehicleIcon(vehicle.type);
            return (
              <Button
                key={vehicle.id}
                variant={selectedVehicle.id === vehicle.id ? "secondary" : "ghost"}
                className="w-full justify-start mb-1"
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setSidebarOpen(false);
                }}
              >
                <VehicleIcon className="mr-2 h-4 w-4" />
                {vehicle.name}
              </Button>
            );
          })}
        </nav>
        <div className="px-4 py-2">
          <Button
            className="w-full justify-start"
            onClick={() => setAddVehicleOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 border-r bg-background fixed h-screen">
        <SidebarContent />
      </div>

      {/* Mobile Header & Sidebar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="flex items-center p-4">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="ml-4 flex items-center">
            <Car className="h-6 w-6 text-primary" />
            <span className="ml-2 text-lg font-semibold">Track-kar</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <main className="flex-1 pt-16 lg:pt-0">
          <div className="h-screen p-5">
            {isLoading ? (
              <LoadingCar />
            ) : (
              <VehicleMap
                vehicle={selectedVehicle}
                onEdit={handleEditVehicle}
                onDelete={handleDeleteVehicle}
              />
            )}
          </div>
        </main>
        <Footer />
      </div>

      <AddVehicleDialog
        open={addVehicleOpen}
        onOpenChange={setAddVehicleOpen}
        onAdd={handleAddVehicle}
      />
    </div>
  );
}
