"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Package } from "lucide-react"

interface DeleteAssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  assetName: string
  assetId: string
}

export function DeleteAssetDialog({
  open,
  onOpenChange,
  onConfirm,
  assetName,
  assetId,
}: DeleteAssetDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-destructive" />
            Delete Asset
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete <span className="font-medium text-foreground">{assetName}</span>?
            </p>
            <p className="text-sm text-muted-foreground">
              Asset ID: <span className="font-mono">{assetId}</span>
            </p>
            <p className="text-sm text-destructive">
              This action cannot be undone. This will permanently delete the asset and remove all associated data.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            Delete Asset
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 