"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function GpsCheckPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">GPS Device Check</CardTitle>
          <CardDescription className="text-center">Do you have a GPS tracking device?</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={() => router.push("/gps-verify")} className="w-full">
            Yes, I have a GPS device
          </Button>
          <Button onClick={() => router.push("/get-gps")} variant="outline" className="w-full">
            No, I need a GPS device
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

