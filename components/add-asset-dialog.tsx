"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import type { Asset } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Package, Wrench as Tool, Box } from "lucide-react"

interface AddAssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: { name: string; assetId: string; gpsId: string; type: string }) => Promise<void>
}

export function AddAssetDialog({ open, onOpenChange, onAdd }: AddAssetDialogProps) {
  const [name, setName] = useState("")
  const [assetId, setAssetId] = useState("")
  const [gpsId, setGpsId] = useState("")
  const [type, setType] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // First validate GPS ID using the API endpoint
      await api.validateGpsId(gpsId);
      
      // If validation passes, proceed with asset creation
      await onAdd({
        name,
        assetId,
        gpsId,
        type,
      })
      onOpenChange(false)
      // Reset form
      setName("")
      setAssetId("")
      setGpsId("")
      setType("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add asset")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>
            Add a new asset to track its location and movement.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name</Label>
              <Input
                id="name"
                placeholder="Enter asset name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetId">Asset ID</Label>
              <Input
                id="assetId"
                placeholder="Enter Asset ID"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gpsId">GPS ID</Label>
              <Input
                id="gpsId"
                placeholder="Enter GPS ID"
                value={gpsId}
                onChange={(e) => setGpsId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Asset Type</Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipment">
                    <div className="flex items-center">
                      <Box className="mr-2 h-4 w-4" />
                      Equipment
                    </div>
                  </SelectItem>
                  <SelectItem value="machinery">
                    <div className="flex items-center">
                      <Tool className="mr-2 h-4 w-4" />
                      Machinery
                    </div>
                  </SelectItem>
                  <SelectItem value="package">
                    <div className="flex items-center">
                      <Package className="mr-2 h-4 w-4" />
                      Package
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Adding..." : "Add Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}