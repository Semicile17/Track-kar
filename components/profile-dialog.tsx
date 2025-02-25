"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"
import { LoadingCar } from "./ui/loading-car"
import { useRouter } from "next/navigation"

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, updateUserProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    firstName: user?.profile?.firstName || "",
    lastName: user?.profile?.lastName || "",
    phone: user?.profile?.phone || "",
    address: user?.profile?.address || "",
    company: user?.profile?.company || "",
    role: user?.profile?.role || "",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await updateUserProfile(formData)
      onOpenChange(false)
    } catch (err) {
      setError("Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewFullProfile = () => {
    onOpenChange(false)
    router.push("/profile")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile Options</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Button onClick={handleViewFullProfile} className="w-full">
            View Full Profile
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 