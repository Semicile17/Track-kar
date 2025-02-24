"use client";

import { useState, useEffect } from "react";
import {
  Car,
  LogOut,
  Menu,
  Truck,
  Bus,
  Plus,
  Settings,
  User as UserIcon,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    type: "Sedan",
    gpsId: "GPS001",
    location: { lat: 51.5074, lng: -0.1278 }
  },
  {
    id: 2,
    name: "Vehicle 2",
    plateNumber: "XYZ789",
    status: "inactive",
    type: "SUV",
    gpsId: "GPS002",
    location: { lat: 51.5174, lng: -0.1378 }
  },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
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

  // Simulate fetching updated vehicle locations
  useEffect(() => {
    const fetchVehicleUpdates = () => {
      // In a real application, this would be a WebSocket connection or API call
      // For now, we'll just update the vehicles array with new locations
      setVehicles(prevVehicles => 
        prevVehicles.map(vehicle => ({
          ...vehicle,
          location: {
            lat: vehicle.location?.lat || 51.5074,
            lng: vehicle.location?.lng || -0.1278
          }
        }))
      );
    };

    // Initial fetch
    fetchVehicleUpdates();

    // Cleanup interval on unmount
    return () => {
      setIsLoading(false);
    };
  }, []);

  // Add effect to handle body scroll
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  const handleAddVehicle = (vehicleData: any) => {
    const newVehicle = {
      id: vehicles.length + 1,
      name: vehicleData.name || `Vehicle ${vehicles.length + 1}`,
      plateNumber: vehicleData.plateNumber || `TEMP${vehicles.length + 1}`,
      status: "inactive",
      type: vehicleData.type || "Sedan",
      gpsId: `GPS${(vehicles.length + 1).toString().padStart(3, '0')}`,
      location: { lat: 51.5074, lng: -0.1278 },
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

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-6 data-[state=open]:animate-in data-[state=open]:fade-in-0 duration-500">
        <Car className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-semibold">Track-kar</span>
      </div>
      
      {/* User Menu - only shown on desktop */}
      <div className="hidden lg:block">
        <UserMenu />
      </div>

      <div className="flex-1 mt-4 overflow-y-auto">
        <nav className="px-2 space-y-1">
          {vehicles.map((vehicle, index) => {
            const VehicleIcon = getVehicleIcon(vehicle.type);
            return (
              <Button
                key={vehicle.id}
                variant={selectedVehicle.id === vehicle.id ? "secondary" : "ghost"}
                className="w-full justify-start data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-left"
                style={{ 
                  animationDelay: `${(index + 1) * 100}ms`,
                  animationDuration: '500ms',
                }}
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
            className="w-full justify-start data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-left"
            style={{ 
              animationDelay: `${(vehicles.length + 1) * 100}ms`,
              animationDuration: '500ms',
            }}
            onClick={() => setAddVehicleOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Mobile Logout Button */}
      <div className="lg:hidden px-4 py-4 mt-auto border-t">
        <Button 
          variant="destructive" 
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
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
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="left" 
                className={`
                  p-0 w-64 border-r shadow-lg
                  data-[state=open]:animate-in
                  data-[state=closed]:animate-out
                  data-[state=closed]:fade-out-0
                  data-[state=open]:fade-in-0
                  data-[state=closed]:slide-out-to-left
                  data-[state=open]:slide-in-from-left
                  duration-300
                  ease-in-out
                `}
                onInteractOutside={(e) => {
                  e.preventDefault();
                  setSidebarOpen(false);
                }}
                onEscapeKeyDown={() => setSidebarOpen(false)}
              >
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <div className="ml-4 flex items-center">
              <Car className="h-6 w-6 text-primary" />
              <span className="ml-2 text-lg font-semibold">Track-kar</span>
            </div>
          </div>

          {/* Mobile Header Icons */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <UserIcon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Profile</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
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

      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-100%);
          }
        }

        .slide-in {
          animation: slideIn 0.3s ease-out;
        }

        .slide-out {
          animation: slideOut 0.3s ease-out;
        }
      `}</style>

      <AddVehicleDialog
        open={addVehicleOpen}
        onOpenChange={setAddVehicleOpen}
        onAdd={handleAddVehicle}
      />
    </div>
  );
}
