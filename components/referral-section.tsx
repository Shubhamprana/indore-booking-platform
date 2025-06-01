"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Gift, UserPlus, Star, ArrowRight } from "lucide-react"

interface ReferralSectionProps {
  title: string
  subtitle: string
  benefits: string[]
  cta: string
}

export function ReferralSection({ title, subtitle, benefits, cta }: ReferralSectionProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    // Render placeholder during SSR
    return (
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-green-100 text-green-800 border-green-200 mb-4">
              <Gift className="w-4 h-4 mr-2" />
              Referral Program
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Card className="p-8 border-2 border-green-200 bg-white">
                <CardContent className="p-0">
                  <div className="flex items-center mb-6">
                    <UserPlus className="w-8 h-8 text-green-600 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-900">Earn While You Wait</h3>
                  </div>
                  <ul className="space-y-4">
                    {benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <Star className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Link href="/referral">
                      <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                        {cta}
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative">
              <div className="w-[500px] h-[400px] bg-gray-200 rounded-2xl shadow-xl animate-pulse flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-green-600/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Only render actual image on client
  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="bg-green-100 text-green-800 border-green-200 mb-4">
            <Gift className="w-4 h-4 mr-2" />
            Referral Program
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Card className="p-8 border-2 border-green-200 bg-white">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <UserPlus className="w-8 h-8 text-green-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900">Earn While You Wait</h3>
                </div>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center">
                      <Star className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href="/referral">
                    <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                      {cta}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative">
            <img
              src="/refferal.png?height=400&width=500"
              alt="Referral Program"
              width={500}
              height={400}
              style={{ height: "auto" }}
              className="rounded-2xl shadow-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-green-600/20 to-transparent rounded-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  )
} 