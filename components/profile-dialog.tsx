"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin, Calendar, Building, Camera } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: {
    email: string
    createdAt: string
  } | null
}

export function ProfileDialog({ open, onOpenChange, user }: ProfileDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : "UN"

  // Mock user data - in a real app, this would come from your backend
  const mockUserData = {
    name: "John Doe",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, New York, NY 10001",
    company: "Tech Solutions Inc.",
    role: "Fleet Manager",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] overflow-hidden p-0">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground" />
        <div className="grid grid-cols-[280px_1fr]">
          {/* Left Column - Profile Info */}
          <div className="bg-muted/30 p-6 flex flex-col items-center justify-center border-r">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-2 border-primary/20 group-hover:border-primary/40 transition-all duration-300">
                <AvatarImage src="/avatar.png" alt={mockUserData.name} className="object-cover" />
                <AvatarFallback className="text-4xl bg-gradient-to-br from-primary/80 to-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="secondary"
                size="icon"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 bg-primary hover:bg-primary/90"
              >
                <Camera className="h-4 w-4 text-primary-foreground" />
              </Button>
            </div>
            <div className="mt-4 text-center space-y-1">
              <h2 className="text-xl font-semibold">{mockUserData.name}</h2>
              <span className="text-sm text-muted-foreground">{mockUserData.role}</span>
            </div>
            <div className="mt-6 w-full">
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Active Account
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="p-6">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl">Profile Details</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4">
              {[
                { icon: Mail, label: "Email", value: user?.email || "", key: "email" },
                { icon: Phone, label: "Phone", value: mockUserData.phone, key: "phone" },
                { icon: MapPin, label: "Address", value: mockUserData.address, key: "address" },
                { icon: Building, label: "Company", value: mockUserData.company, key: "company" },
                { icon: Calendar, label: "Member Since", value: new Date(user?.createdAt || Date.now()).toLocaleDateString(), key: "memberSince" }
              ].map((field, index) => (
                <div
                  key={field.key}
                  className={cn(
                    "space-y-1.5 transition-all duration-500",
                    isEditing ? "translate-y-0 opacity-100" : "translate-y-0 opacity-100",
                  )}
                  style={{
                    transitionDelay: `${index * 50}ms`
                  }}
                >
                  <Label className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
                    <field.icon className="h-4 w-4 text-primary/70" />
                    {field.label}
                  </Label>
                  <Input
                    disabled={!isEditing || field.key === "memberSince"}
                    value={field.value}
                    className={cn(
                      "border-0 bg-muted/50 focus-visible:ring-1",
                      !isEditing && "cursor-default",
                      field.key === "memberSince" && "text-muted-foreground"
                    )}
                  />
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  className="transition-all duration-300 hover:bg-destructive hover:text-destructive-foreground"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => setIsEditing(false)}
                  className="bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90 transition-all duration-300"
                >
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 