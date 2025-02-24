"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function GpsVerifyPage() {
  const [gpsId, setGpsId] = useState("")
  const [plateNumber, setPlateNumber] = useState("")
  const router = useRouter()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    // Add your verification logic here
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Verify GPS Device</CardTitle>
          <CardDescription className="text-center">Enter your GPS ID and vehicle plate number</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Input placeholder="GPS ID" value={gpsId} onChange={(e) => setGpsId(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Plate Number"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Verify
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

