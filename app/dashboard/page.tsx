"use client";

import { useState, useEffect } from "react";
import {
  LogOut,
  Menu,
  Plus,
  Settings,
  User as UserIcon,
  Search,
  Moon,
  Sun,
  Box,
  Package,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
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
import { Input } from "@/components/ui/input";
import { AddAssetDialog } from "@/components/add-asset-dialog";
import { AssetMap } from "@/components/asset-map";
import { AssetLogo } from "@/components/ui/asset-logo";
import { ProfileDialog } from "@/components/profile-dialog";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Asset {
  id: string;
  name: string;
  gpsId: string;
  type: string;
  status: 'active' | 'inactive';
  location: {
    latitude: number;
    longitude: number;
    timestamp?: string;
  };
}

const getAssetIcon = (type: string) => {
  switch (type) {
    case "equipment":
      return Box;
    case "machinery":
      return Wrench;
    default:
      return Package;
  }
};

const initialAssets = [
  {
    id: "1",
    name: "Asset 1",
    assetId: "AST001",
    status: "active",
    type: "equipment",
    trackerId: "TRK001",
    location: { lat: 51.5074, lng: -0.1278 }
  },
  {
    id: "2",
    name: "Asset 2",
    assetId: "AST002",
    status: "inactive",
    type: "machinery",
    trackerId: "TRK002",
    location: { lat: 51.5174, lng: -0.1378 }
  },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [addAssetOpen, setAddAssetOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const response = await api.getAssets();
      const assetsData = Array.isArray(response) ? response : [];
      
      // Initialize assets with default location if none exists
      const assetsWithLocation = assetsData.map(asset => ({
        ...asset,
        location: asset.location || {
          latitude: 28.6139, // Default to Delhi coordinates
          longitude: 77.2090,
          timestamp: new Date().toISOString()
        }
      }));

      setAssets(assetsWithLocation);
      if (assetsWithLocation.length > 0) {
        setSelectedAsset(assetsWithLocation[0]);
      }
    } catch (err) {
      setError("Failed to fetch assets");
      console.error("Error fetching assets:", err);
      toast.error("Failed to fetch assets");
    } finally {
      setIsLoading(false);
    }
  };

  // Update locations periodically
  useEffect(() => {
    if (!assets.length) return;

    const updateInterval = setInterval(() => {
      setAssets(prevAssets => 
        prevAssets.map(asset => {
          // Check if location exists before accessing properties
          if (!asset.location) {
            return asset;
          }

          return {
            ...asset,
            location: {
              latitude: asset.location.latitude + (Math.random() - 0.5) * 0.001,
              longitude: asset.location.longitude + (Math.random() - 0.5) * 0.001,
              timestamp: new Date().toISOString()
            }
          };
        })
      );
    }, 5000);

    return () => clearInterval(updateInterval);
  }, [assets.length]);

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

  // Add theme toggle effect
  useEffect(() => {
    // Check if theme exists in localStorage
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleAddAsset = async (assetData: {
    name: string;
    gpsId: string;
    type: string;
  }) => {
    try {
      const newAsset = await api.createAsset(assetData);
      setAssets(prev => [...prev, newAsset]);
      setSelectedAsset(newAsset);
      setAddAssetOpen(false);
      toast.success("Asset added successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add asset");
    }
  };

  const handleEditAsset = async (id: string, assetData: Partial<Asset>) => {
    try {
      const updatedAsset = await api.updateAsset(id, assetData);
      setAssets(prev => prev.map(asset => 
        asset.id === id ? updatedAsset : asset
      ));
      setSelectedAsset(updatedAsset);
      toast.success("Asset updated successfully");
    } catch (err) {
      toast.error("Failed to update asset");
      console.error("Error updating asset:", err);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      await api.deleteAsset(id);
      setAssets(prev => prev.filter(asset => asset.id !== id));
      setSelectedAsset(null);
      toast.success("Asset deleted successfully");
    } catch (err) {
      toast.error("Failed to delete asset");
      console.error("Error deleting asset:", err);
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

  // Filter assets based on search query and status
  const filteredAssets = assets?.filter(asset => {
    const matchesSearch = searchQuery.toLowerCase() === "" ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.gpsId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" ||
      asset.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  }) ?? [];

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-6 data-[state=open]:animate-in data-[state=open]:fade-in-0 duration-500">
        <AssetLogo className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-semibold">Asset Tracker</span>
      </div>
      
      {/* User Menu - only shown on desktop */}
      <div className="hidden lg:block">
        <UserMenu />
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-3 border-b">
        <h3 className="text-xs font-medium mb-2 text-muted-foreground">Quick Stats</h3>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="bg-secondary/40 rounded-md p-2">
            <div className="text-lg font-semibold">{assets.length}</div>
            <div className="text-[10px] text-muted-foreground">Total Assets</div>
          </div>
          <div className="bg-secondary/40 rounded-md p-2">
            <div className="text-lg font-semibold">
              {assets.filter(a => a.status === 'active').length}
            </div>
            <div className="text-[10px] text-muted-foreground">Active</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="px-4 py-3 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="relative">
          <Input
            placeholder="Search by name, ID or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 h-7 text-xs"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
            className="h-6 text-[10px] flex-1"
          >
            All Assets
          </Button>
          <Button
            variant={filterStatus === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("active")}
            className="h-6 text-[10px] flex-1"
          >
            <div className="w-1 h-1 rounded-full bg-green-500 mr-1" />
            Active
          </Button>
          <Button
            variant={filterStatus === "inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("inactive")}
            className="h-6 text-[10px] flex-1"
          >
            <div className="w-1 h-1 rounded-full bg-red-500 mr-1" />
            Inactive
          </Button>
        </div>
      </div>

      {/* Asset List */}
      <div className="flex-1 mt-2 overflow-y-auto">
        <div className="sticky top-0 px-4 py-2 mb-2 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-b">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-medium">Your Assets</h3>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary">
            {filteredAssets.length} of {assets.length}
          </span>
        </div>
        <nav className="px-2 space-y-1">
          {filteredAssets.length > 0 ? (
            filteredAssets.map((asset, index) => {
              const AssetIcon = getAssetIcon(asset.type);
              return (
                <Button
                  key={asset.id}
                  variant={selectedAsset?.id === asset.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start py-2.5 px-3 transition-all duration-200",
                    "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-left",
                    "group hover:bg-secondary/40",
                    selectedAsset?.id === asset.id && "bg-secondary/60 shadow-sm"
                  )}
                  style={{ 
                    animationDelay: `${(index + 1) * 100}ms`,
                    animationDuration: '500ms',
                  }}
                  onClick={() => {
                    setSelectedAsset(asset);
                    setSidebarOpen(false);
                  }}
                >
                  <div className="flex items-center w-full gap-3">
                    <div className={cn(
                      "p-1.5 rounded-md transition-colors",
                      selectedAsset?.id === asset.id ? "bg-background/40" : "bg-secondary/40 group-hover:bg-background/40"
                    )}>
                      <AssetIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">{asset.name}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <span>{asset.gpsId}</span>
                        <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/50" />
                        <span className="capitalize">{asset.type}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className={cn(
                        "px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                        asset.status === 'active' 
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                      )}>
                        {asset.status}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center">
              <Package className="h-8 w-8 mx-auto text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">No assets found</p>
              <p className="text-xs text-muted-foreground/70">Try adjusting your search or filters</p>
            </div>
          )}
        </nav>
        {assets.length > 0 && (
          <div className="px-4 py-3 mt-2 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Button
              className="w-full justify-start bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-left group"
              style={{ 
                animationDelay: `${(assets.length + 1) * 100}ms`,
                animationDuration: '500ms',
              }}
              onClick={() => setAddAssetOpen(true)}
            >
              <div className="flex items-center w-full">
                <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                <span className="flex-1 text-sm">Add New Asset</span>
              </div>
            </Button>
            <p className="text-[11px] text-muted-foreground mt-2 text-center">
              Add and track your assets in real-time
            </p>
          </div>
        )}
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingCar className="w-16 h-16 mb-4" />
          <p className="text-muted-foreground">Loading assets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

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
              <AssetLogo className="h-6 w-6 text-primary" />
              <span className="ml-2 text-lg font-semibold">Asset Tracker</span>
            </div>
          </div>

          {/* Mobile Header Icons */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={toggleTheme}
                  >
                    {theme === "light" ? (
                      <Moon className="h-5 w-5 rotate-90 transition-transform" />
                    ) : (
                      <Sun className="h-5 w-5 rotate-0 transition-transform" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {theme === "light" ? "Dark Mode" : "Light Mode"}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setProfileOpen(true)}
                  >
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
        <main className="flex-1 pt-16 lg:pt-0 flex items-center">
          <div className="w-full p-5">
            {filteredAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] lg:min-h-screen p-8 text-center">
                <div className="w-48 h-48 mb-6 text-primary/20">
                  <Package className="w-full h-full animate-float" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">No Assets Found</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  {assets.length === 0 
                    ? "You haven't added any assets yet. Add your first asset to start tracking!"
                    : "No assets match your search criteria."}
                </p>
                <Button
                  onClick={() => setAddAssetOpen(true)}
                  className="bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  {assets.length === 0 ? "Add Your First Asset" : "Add New Asset"}
                </Button>
              </div>
            ) : selectedAsset ? (
              <AssetMap
                asset={selectedAsset}
                onEdit={handleEditAsset}
                onDelete={handleDeleteAsset}
              />
            ) : null}
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

        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .slide-in {
          animation: slideIn 0.3s ease-out;
        }

        .slide-out {
          animation: slideOut 0.3s ease-out;
        }
      `}</style>

      <AddAssetDialog
        open={addAssetOpen}
        onOpenChange={setAddAssetOpen}
        onAdd={handleAddAsset}
      />

      <ProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        user={user}
      />
    </div>
  );
}
