"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function UserMenu() {
  const { user, logout } = useAuth();

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
    <div className="flex flex-col items-center px-4 py-6 border-t border-b">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="group relative w-24 h-24 rounded-full overflow-hidden transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <Avatar className="w-full h-full">
              <AvatarImage src="/avatar.png" alt="User" className="group-hover:opacity-90 transition-opacity" />
              <AvatarFallback className="text-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <p className="mt-4 font-medium">{user?.email || "User"}</p>
      <p className="text-sm text-muted-foreground">
        Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
      </p>
    </div>
  );
} 