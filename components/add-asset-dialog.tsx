"use client"

import { useState } from "react"
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
  onAdd: (data: any) => void
}

export function AddAssetDialog({ open, onOpenChange, onAdd }: AddAssetDialogProps) {
  const [name, setName] = useState("")
  const [assetId, setAssetId] = useState("")
  const [type, setType] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onAdd({
        name,
        assetId,
        type,
      })
      onOpenChange(false)
      // Reset form
      setName("")
      setAssetId("")
      setType("")
    } catch (error) {
      console.error("Failed to add asset:", error)
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
                placeholder="Enter asset ID"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
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