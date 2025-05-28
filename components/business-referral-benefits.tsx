"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Crown, 
  Gift, 
  Users, 
  Calendar,
  Zap,
  TrendingUp,
  CheckCircle
} from "lucide-react"

interface BusinessReferralBenefitsProps {
  userType?: "customer" | "business"
  className?: string
}

export default function BusinessReferralBenefits({ 
  userType = "business",
  className = ""
}: BusinessReferralBenefitsProps) {
  if (userType !== "business") return null

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Benefits Card */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-purple-600" />
            <CardTitle className="text-xl text-purple-900">
              Business Referral Rewards
            </CardTitle>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              Pro Benefits
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* For You */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Your Rewards</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-900">
                      3 Months FREE Pro Subscription
                    </p>
                    <p className="text-sm text-green-700">
                      Just for registering as a business! No referral needed.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-200">
                  <Calendar className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-purple-900">
                      +1 Month Pro per Business Referral
                    </p>
                    <p className="text-sm text-purple-700">
                      Earn 1 additional month of pro subscription for each business you refer.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Referred Businesses */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Businesses You Refer Get</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-900">
                      3 Months FREE Pro Subscription
                    </p>
                    <p className="text-sm text-blue-700">
                      Same welcome bonus as you received!
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-900">
                      All Pro Features
                    </p>
                    <p className="text-sm text-blue-700">
                      Unlimited bookings, advanced analytics, priority support & more.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pro Features Preview */}
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-yellow-600" />
              <h4 className="font-semibold text-gray-900">Pro Features Include:</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Unlimited bookings per month</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Advanced analytics & insights</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>24/7 priority support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Custom branding & themes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Staff management tools</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Automated marketing campaigns</span>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-800 text-center">
              <strong>🚀 Start referring businesses now</strong> and build your pro subscription time!
              Share your referral code with other business owners.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 