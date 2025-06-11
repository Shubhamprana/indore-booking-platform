"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"

interface Service {
  icon: LucideIcon
  name: string
  count: string
  image: string
}

interface ServicesSectionProps {
  services: Service[]
  title: string
  subtitle: string
}

export function ServicesSection({ services, title, subtitle }: ServicesSectionProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    // Render placeholder during SSR
    return (
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">{title}</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {services.map((service, index) => (
              <Card
                key={index}
                className="p-3 md:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 md:hover:-translate-y-2 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-1 right-1 md:top-2 md:right-2">
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5">
                    Soon
                  </Badge>
                </div>
                <CardContent className="p-0 text-center">
                  <div className="relative mb-2 md:mb-4">
                    <div className="w-full h-20 md:h-32 bg-gray-200 rounded-lg mb-2 md:mb-4 animate-pulse flex items-center justify-center">
                      <div className="text-gray-400 text-xs md:text-sm">Loading...</div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 md:w-12 md:h-12 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <service.icon className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">{service.name}</h3>
                  <p className="text-xs md:text-sm text-gray-600">{service.count} Partners</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Only render actual images on client
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">{title}</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {services.map((service, index) => (
            <Card
              key={index}
              className="p-3 md:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 md:hover:-translate-y-2 cursor-pointer group relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute top-1 right-1 md:top-2 md:right-2">
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5">
                  Soon
                </Badge>
              </div>
              <CardContent className="p-0 text-center">
                <div className="relative mb-2 md:mb-4">
                  <img
                    src={service.image || "/placeholder.svg"}
                    alt={service.name}
                    width={300}
                    height={200}
                    style={{ height: "auto" }}
                    className="w-full h-20 md:h-32 object-cover rounded-lg mb-2 md:mb-4"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <service.icon className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">{service.name}</h3>
                <p className="text-xs md:text-sm text-gray-600">{service.count} Partners</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 