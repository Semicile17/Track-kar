"use client"

import { Car } from "lucide-react"

export function LoadingCar() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Car className="h-12 w-12 text-primary animate-bounce" />
        <p className="text-muted-foreground">Loading your vehicles...</p>
      </div>
    </div>
  )
} 