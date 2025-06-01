"use client"

import { useState, useEffect } from "react"
import { AnimatedCounter } from "@/components/animated-counter"

interface StatsSectionProps {
  stats: {
    preRegistered: string
    cities: string
    businesses: string
    referrals: string
  }
}

export function StatsSection({ stats }: StatsSectionProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    // Render placeholder during SSR
    return (
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">0+</div>
              <div className="text-blue-100">{stats.preRegistered}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">0+</div>
              <div className="text-blue-100">{stats.cities}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">0+</div>
              <div className="text-blue-100">{stats.businesses}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">0+</div>
              <div className="text-blue-100">{stats.referrals}</div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Only render animated counters on client
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold mb-2">
              <AnimatedCounter end={15000} suffix="+" />
            </div>
            <div className="text-blue-100">{stats.preRegistered}</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold mb-2">
              <AnimatedCounter end={50} suffix="+" />
            </div>
            <div className="text-blue-100">{stats.cities}</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold mb-2">
              <AnimatedCounter end={2000} suffix="+" />
            </div>
            <div className="text-blue-100">{stats.businesses}</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold mb-2">
              <AnimatedCounter end={5000} suffix="+" />
            </div>
            <div className="text-blue-100">{stats.referrals}</div>
          </div>
        </div>
      </div>
    </section>
  )
} 