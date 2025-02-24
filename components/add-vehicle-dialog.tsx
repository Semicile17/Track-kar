"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Car, Truck, Bus } from "lucide-react"

const vehicleTypes = [
  { id: "car", name: "Car", icon: Car },
  { id: "truck", name: "Truck", icon: Truck },
  { id: "bus", name: "Bus", icon: Bus },
]

interface AddVehicleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (vehicle: any) => void
}

export function AddVehicleDialog({ open, onOpenChange, onAdd }: AddVehicleDialogProps) {
  const [vehicleData, setVehicleData] = useState({
    type: "",
    name: "",
    gpsId: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(vehicleData)
    onOpenChange(false)
    setVehicleData({ type: "", name: "", gpsId: "" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogDescription>Enter the details of your new vehicle.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Vehicle Type</label>
            <Select value={vehicleData.type} onValueChange={(value) => setVehicleData({ ...vehicleData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center">
                      <type.icon className="mr-2 h-4 w-4" />
                      {type.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Vehicle Name</label>
            <Input
              value={vehicleData.name}
              onChange={(e) => setVehicleData({ ...vehicleData, name: e.target.value })}
              placeholder="Enter vehicle name"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">GPS ID</label>
            <Input
              value={vehicleData.gpsId}
              onChange={(e) => setVehicleData({ ...vehicleData, gpsId: e.target.value })}
              placeholder="Enter GPS ID"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Add Vehicle</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

