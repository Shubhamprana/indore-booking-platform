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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                    Soon
                  </Badge>
                </div>
                <CardContent className="p-0 text-center">
                  <div className="relative mb-4">
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-4 animate-pulse flex items-center justify-center">
                      <div className="text-gray-400">Loading...</div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <service.icon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.count} Partners Ready</p>
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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 cursor-pointer group relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                  Soon
                </Badge>
              </div>
              <CardContent className="p-0 text-center">
                <div className="relative mb-4">
                  <img
                    src={service.image || "/placeholder.svg"}
                    alt={service.name}
                    width={300}
                    height={200}
                    style={{ height: "auto" }}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <service.icon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-sm text-gray-600">{service.count} Partners Ready</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 