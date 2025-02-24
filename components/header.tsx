"use client"

import { Car, User, Settings } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-sm border-b z-40">
      <div className="container h-full mx-auto px-4 flex items-center">
        <div className="flex items-center gap-2 ml-12 md:ml-0">
          <Car className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Track-kar</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
} 