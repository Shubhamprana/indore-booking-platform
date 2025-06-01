"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Share2,
  Gift,
  Users,
  Star,
  Copy,
  Twitter,
  Facebook,
  MessageCircle,
  Linkedin,
  Mail,
  Bell,
  Rocket,
  Trophy,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import confetti from "canvas-confetti"
import BusinessReferralBenefits from "@/components/business-referral-benefits"
import { useAuth } from "@/hooks/use-auth"

export default function WelcomePage() {
  const { toast } = useToast()
  const { profile } = useAuth()
  const [referralCode, setReferralCode] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [mounted, setMounted] = useState(false)

  const nextSteps = [
    {
      icon: Share2,
      title: "Share Your Referral Code",
      description: "Invite friends and earn ₹50 for each 2 successful referral",
      action: "Start Sharing",
      color: "green",
    },
    {
      icon: Bell,
      title: "Enable Notifications",
      description: "Get instant updates about launch timeline and exclusive offers",
      action: "Enable Now",
      color: "blue",
    },
    {
      icon: Users,
      title: "Join Our Community",
      description: "Connect with other early adopters and get insider updates",
      action: "Join Community",
      color: "purple",
    },
    {
      icon: Star,
      title: "Complete Your Profile",
      description: "Add more details to unlock additional pre-launch benefits",
      action: "Complete Profile",
      color: "orange",
    },
  ]

  useEffect(() => {
    // Generate referral code on client side to prevent hydration mismatch
    setReferralCode(`BN${Math.random().toString(36).substring(2, 8).toUpperCase()}`)
    setMounted(true)
    
    // Trigger confetti animation on page load
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }, [])

  const copyReferralCode = () => {
    if (!referralCode) return
    navigator.clipboard.writeText(referralCode)
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    })
  }

  const shareOnSocial = (platform: string) => {
    if (!referralCode) return
    const message = `I just joined the FastBookr pre-launch! 🚀 Skip the wait and book instantly when it launches. Join me with my referral code: ${referralCode}`
    const url = `https://booknow.com/register?ref=${referralCode}`

    let shareUrl = ""
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(message + " " + url)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <Badge className="bg-white/20 text-white border-white/30 mb-4">
              <Rocket className="w-4 h-4 mr-2" />
              Registration Successful!
            </Badge>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to the FastBookr Family! 🎉</h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            You're now part of an exclusive community of early adopters who will shape the future of booking. Get ready
            for an amazing journey!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold">15,847</div>
              <div className="text-blue-100">Your Position</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold">Q2 2024</div>
              <div className="text-blue-100">Expected Launch</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold">₹2,500</div>
              <div className="text-blue-100">Benefits Value</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Referral Section */}
        <Card className="mb-8 border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <Gift className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-900 mb-2">Your Referral Code is Ready!</h2>
              <p className="text-green-700">Start earning rewards by inviting friends to join the revolution</p>
            </div>

            <div className="bg-white p-6 rounded-xl border-2 border-green-300 mb-6">
              <div className="text-center">
                {referralCode ? (
                  <>
                    <div className="text-4xl font-bold text-green-600 tracking-wider mb-4">{referralCode}</div>
                    <Button onClick={copyReferralCode} className="bg-green-600 hover:bg-green-700 text-white">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Referral Code
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-green-600 tracking-wider mb-4">
                      <div className="animate-pulse bg-green-200 h-10 w-32 rounded mx-auto"></div>
                    </div>
                    <Button disabled className="bg-gray-400 text-white cursor-not-allowed">
                      <Copy className="w-4 h-4 mr-2" />
                      Generating Code...
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-3">💰 You Earn:</h3>
                <ul className="space-y-2 text-sm text-green-800">
                  <li>• ₹50 credit per successful referral</li>
                  <li>• Bonus rewards at 5, 10, 25 referrals</li>
                  <li>• Exclusive referrer badges</li>
                  <li>• VIP launch event access</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-3">🎁 Friends Get:</h3>
                <ul className="space-y-2 text-sm text-green-800">
                  <li>• ₹50 welcome bonus</li>
                  <li>• All pre-launch benefits</li>
                  <li>• Priority early access</li>
                  <li>• Exclusive member perks</li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-green-900 mb-4">Share on Social Media</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  onClick={() => shareOnSocial("whatsapp")}
                  disabled={!referralCode}
                  className="bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button 
                  onClick={() => shareOnSocial("twitter")} 
                  disabled={!referralCode}
                  className="bg-blue-400 hover:bg-blue-500 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button 
                  onClick={() => shareOnSocial("facebook")} 
                  disabled={!referralCode}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button 
                  onClick={() => shareOnSocial("linkedin")} 
                  disabled={!referralCode}
                  className="bg-blue-700 hover:bg-blue-800 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Referral Benefits - Show only for business users */}
        {profile?.user_type === "business" && (
          <BusinessReferralBenefits userType={profile.user_type} className="mb-8" />
        )}

        {/* Next Steps */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What's Next?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {nextSteps.map((step, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        step.color === "green"
                          ? "bg-green-100"
                          : step.color === "blue"
                            ? "bg-blue-100"
                            : step.color === "purple"
                              ? "bg-purple-100"
                              : "bg-orange-100"
                      }`}
                    >
                      <step.icon
                        className={`w-6 h-6 ${
                          step.color === "green"
                            ? "text-green-600"
                            : step.color === "blue"
                              ? "text-blue-600"
                              : step.color === "purple"
                                ? "text-purple-600"
                                : "text-orange-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 mb-4">{step.description}</p>
                      <Button variant="outline" size="sm" className="group-hover:bg-gray-50">
                        {step.action}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Summary */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <Trophy className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Exclusive Pre-Launch Benefits</h2>
              <p className="text-gray-600">These amazing perks are locked in for you!</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">50%</div>
                <div className="font-semibold text-gray-900 mb-2">Off First 10 Bookings</div>
                <div className="text-sm text-gray-600">Save big on your initial bookings</div>
              </div>
              <div className="bg-white p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
                <div className="font-semibold text-gray-900 mb-2">Lifetime Premium</div>
                <div className="text-sm text-gray-600">All premium features forever</div>
              </div>
              <div className="bg-white p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">VIP</div>
                <div className="font-semibold text-gray-900 mb-2">Priority Support</div>
                <div className="text-sm text-gray-600">Dedicated customer success</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/profile">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Complete Your Profile
              </Button>
            </Link>
            <Link href="/referral">
              <Button variant="outline" size="lg">
                <Share2 className="w-4 h-4 mr-2" />
                Manage Referrals
              </Button>
            </Link>
            <Link href="/updates">
              <Button variant="outline" size="lg">
                <Bell className="w-4 h-4 mr-2" />
                Launch Updates
              </Button>
            </Link>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Questions? We're here to help!</p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              <span>hello@FastBookr.com</span>
            </div>
            <div className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-2" />
              <span>+1-800-FastBookr</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
