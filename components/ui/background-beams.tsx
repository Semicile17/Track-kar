"use client"

import { cn } from "@/lib/utils"

export function BackgroundBeams({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 z-0 overflow-hidden bg-secondary", className)}>
      <div className="absolute -top-[10%] left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/20 to-secondary opacity-50 blur-3xl" />
      <div className="absolute -bottom-[10%] left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/20 to-secondary opacity-50 blur-3xl" />
    </div>
  )
}

