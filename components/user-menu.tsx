"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, Moon, Sun } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { ProfileDialog } from "./profile-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Add theme toggle effect
  useEffect(() => {
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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "UN";

  return (
    <div className="flex flex-col items-center px-4 py-6 border-t border-b bg-gradient-to-b from-background to-secondary/5">
      <div className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group relative w-24 h-24 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:shadow-xl">
              <Avatar className="w-full h-full border-2 border-transparent group-hover:border-primary transition-colors">
                <AvatarImage src="/avatar.png" alt={user?.email || "User"} className="group-hover:opacity-90 transition-opacity" />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/80 to-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/10 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[1px]">
                <Settings className="w-5 h-5 text-white/90 transform rotate-0 group-hover:rotate-90 transition-all duration-500 hover:scale-110" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56 mt-2 p-2">
            <div className="flex flex-col items-center gap-1 p-2 border-b mb-2">
              <p className="font-medium text-sm">{user?.email}</p>
              <p className="text-xs text-muted-foreground">
                Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
            <DropdownMenuItem 
              className="flex items-center gap-2 py-2 cursor-pointer hover:bg-secondary focus:bg-secondary group"
              onClick={() => setProfileOpen(true)}
            >
              <User className="h-4 w-4 text-primary group-hover:text-primary/80 transition-colors" />
              <span>View Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 py-2 cursor-pointer hover:bg-secondary focus:bg-secondary group">
              <Settings className="h-4 w-4 text-primary group-hover:text-primary/80 transition-colors" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 py-2 cursor-pointer hover:bg-destructive focus:bg-destructive hover:text-destructive-foreground focus:text-destructive-foreground group transition-colors" onClick={handleLogout}>
              <LogOut className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-background hover:bg-secondary"
                onClick={toggleTheme}
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4 rotate-90 transition-transform duration-300" />
                ) : (
                  <Sun className="h-4 w-4 rotate-0 transition-transform duration-300" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{theme === "light" ? "Dark Mode" : "Light Mode"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="mt-4 flex flex-col items-center gap-1">
        <p className="font-medium text-sm">{user?.email}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Online</span>
        </div>
      </div>

      <ProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        user={user}
      />
    </div>
  );
} 