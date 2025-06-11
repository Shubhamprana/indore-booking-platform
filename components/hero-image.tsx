"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Rocket } from "lucide-react"

export function HeroImage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    // Render placeholder during SSR to prevent hydration mismatch
    return (
      <div className="relative animate-float">
        <div className="relative z-10">
          <div className="w-[500px] h-[600px] bg-gray-200 rounded-2xl shadow-2xl animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-3xl opacity-20 transform rotate-6 animate-pulse"></div>
      </div>
    )
  }

  // Only render actual image on client
  return (
    <div className="relative animate-float">
      <div className="relative z-10">
        <img
          src="/hero-section-image.png"
          alt="FastBookr App Preview"
          width={500}
          height={600}
          className="rounded-2xl shadow-2xl"
          style={{ height: "auto" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl flex items-end justify-center pb-8">
          <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm">
            <Rocket className="w-4 h-4 mr-2" />
            Coming Soon
          </Badge>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-3xl opacity-20 transform rotate-6 animate-pulse"></div>
    </div>
  )
} 