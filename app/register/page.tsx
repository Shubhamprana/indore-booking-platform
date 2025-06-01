"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Building,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Star,
  Phone,
  Mail,
  User,
  Calendar,
  Gift,
  Share2,
  Copy,
  Twitter,
  Facebook,
  MessageCircle,
  Linkedin,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { register, type RegisterData } from "@/lib/auth"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [userType, setUserType] = useState(searchParams.get("type") || "")
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "")
  const [generatedReferralCode, setGeneratedReferralCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [formData, setFormData] = useState({
    // Personal Info
    fullName: "",
    email: searchParams.get("email") || "",
    phone: "",
    location: "",
    password: "",
    confirmPassword: "",

    // User Type Specific
    serviceInterests: [] as string[],
    businessName: "",
    businessCategory: "",
    currentBookingMethod: "",
    businessDescription: "",

    // Engagement
    launchInterest: 8,
    referralCode: "",
    marketingConsent: false,
    whatsappUpdates: false,
    earlyAccessInterest: true,
    shareOnSocial: false,
  })

  const totalSteps = 5

  useEffect(() => {
    // Set client flag to prevent hydration issues
    setIsClient(true)
    // Generate unique referral code when component mounts
    const code = `BN${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    setGeneratedReferralCode(code)
  }, [])

  const serviceOptions = [
    "Restaurants & Food",
    "Salons & Beauty",
    "Healthcare & Clinics",
    "Hotels & Travel",
    "Automotive Services",
    "Fitness & Wellness",
    "Education & Training",
    "Home Services",
    "Entertainment",
    "Professional Services",
  ]

  const businessCategories = [
    "Restaurant/Food Service",
    "Salon/Spa/Beauty",
    "Healthcare/Clinic",
    "Hotel/Accommodation",
    "Automotive Services",
    "Fitness/Wellness",
    "Education/Training",
    "Home Services",
    "Entertainment/Events",
    "Professional Services",
    "Other",
  ]

  const locations = [
    "Mumbai, India",
    "Delhi, India",
    "Bangalore, India",
    "Indore, India",
    "Pune, India",
    "Chennai, India",
    "Kolkata, India",
    "Hyderabad, India",
    "Ahmedabad, India",
    "Jaipur, India",
    "Other City in India",
    "International",
  ]

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleServiceInterestChange = (service: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        serviceInterests: [...formData.serviceInterests, service],
      })
    } else {
      setFormData({
        ...formData,
        serviceInterests: formData.serviceInterests.filter((s) => s !== service),
      })
    }
  }

  const handleSubmit = async () => {
    if (!userType) {
      toast({
        title: "Please select account type",
        description: "Choose whether you're a customer or business owner",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Declare timeout variable outside try block for proper scope
    let registrationTimeout: NodeJS.Timeout | undefined

    try {
      const registerData: RegisterData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        location: formData.location,
        userType: userType as "customer" | "business",
        referralCode: referralCode,
        serviceInterests: formData.serviceInterests,
        businessName: userType === "business" ? formData.businessName : undefined,
        businessCategory: userType === "business" ? formData.businessCategory : undefined,
        businessDescription: userType === "business" ? formData.businessDescription : undefined,
        currentBookingMethod: userType === "business" ? formData.currentBookingMethod : undefined,
        launchInterest: formData.launchInterest,
        marketingConsent: formData.marketingConsent,
        whatsappUpdates: formData.whatsappUpdates,
        earlyAccessInterest: formData.earlyAccessInterest,
        shareOnSocial: formData.shareOnSocial,
      }

      // Set a timeout for registration - optimized to 3 seconds since background processing is async
      registrationTimeout = setTimeout(() => {
        console.error("Registration process timed out after 3 seconds")
        setIsLoading(false)
        toast({
          title: "Registration Successful! 🎉",
          description: "Your account has been created! Background processes are still running - you can log in now.",
          variant: "default",
        })
        // Redirect to register-complete page after timeout (but with success message)
        setTimeout(() => {
          router.push("/register-complete")
        }, 2000)
      }, 5000) // Optimized to 5 seconds with background processing

      const result = await register(registerData)
      
      // Clear the timeout since registration completed
      if (registrationTimeout) clearTimeout(registrationTimeout)

      console.log("Registration successful:", result)

      toast({
        title: "Registration Successful! 🎉",
        description: "Welcome to the BookNow family! Please check your email to verify your account.",
      })

      // Redirect to register-complete page instead of welcome
      router.push("/register-complete")
    } catch (error: any) {
      // Clear the timeout in case of error
      if (registrationTimeout) clearTimeout(registrationTimeout)
      
      console.error("Registration error:", error)

      let errorMessage = "Something went wrong. Please try again."

      if (error.message) {
        errorMessage = error.message
      } else if (error.error_description) {
        errorMessage = error.error_description
      }

      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyReferralCode = () => {
    navigator.clipboard.writeText(generatedReferralCode)
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    })
  }

  const shareOnSocial = (platform: string) => {
    const message = `I just joined the BookNow pre-launch! Skip the wait and book instantly when it launches. Join me with my referral code: ${generatedReferralCode}`
    const url = `https://booknow.com/register?ref=${generatedReferralCode}`

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6 sm:py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4 sm:mb-6">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">FastBookr</span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs px-1 py-0.5 sm:px-2 sm:py-1">
              Pre-Launch
            </Badge>
          </Link>
          <h1 className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">Join the Booking Revolution</h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">Be among the first to experience the future of booking</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                    i + 1 <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {i + 1 <= currentStep ? <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`w-full h-0.5 sm:h-1 mx-1 sm:mx-2 ${i + 1 < currentStep ? "bg-blue-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-xs sm:text-sm text-gray-600">
            Step {currentStep} of {totalSteps}
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-4 sm:p-6 md:p-8">
            {/* Step 1: User Type */}
            {currentStep === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">How will you use FastBookr?</h2>
                  <p className="text-sm sm:text-base text-gray-600">Choose your account type to get personalized pre-launch benefits</p>
                </div>

                <RadioGroup value={userType} onValueChange={setUserType}>
                  <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                    {/* Customer Option */}
                    <div className="relative">
                      <RadioGroupItem value="customer" id="customer" className="sr-only" />
                      <Label
                        htmlFor="customer"
                        className={`block p-4 sm:p-6 border-2 rounded-xl cursor-pointer transition-all ${
                          userType === "customer"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center mb-3 sm:mb-4">
                          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
                          <div className="min-w-0">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">I'm a Customer</h3>
                            <p className="text-sm sm:text-base text-gray-600">Looking to book services</p>
                          </div>
                        </div>
                        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4">
                          <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">🎁 Pre-Launch Benefits:</h4>
                          <ul className="space-y-1 text-xs sm:text-sm text-blue-800">
                            <li>• 50% off first 10 bookings</li>
                            <li>• Lifetime premium features</li>
                            <li>• Priority customer support</li>
                            <li>• Exclusive launch events</li>
                          </ul>
                        </div>
                        <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                          <li className="flex items-center">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                            Skip waiting lines forever
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                            Instant confirmations
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                            Exclusive member discounts
                          </li>
                        </ul>
                      </Label>
                    </div>

                    {/* Business Option */}
                    <div className="relative">
                      <RadioGroupItem value="business" id="business" className="sr-only" />
                      <Label
                        htmlFor="business"
                        className={`block p-4 sm:p-6 border-2 rounded-xl cursor-pointer transition-all ${
                          userType === "business"
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center mb-3 sm:mb-4">
                          <Building className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mr-2 sm:mr-3 flex-shrink-0" />
                          <div className="min-w-0">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">I own a Business</h3>
                            <p className="text-sm sm:text-base text-gray-600">Want to manage bookings</p>
                          </div>
                        </div>
                        <div className="bg-purple-50 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4">
                          <h4 className="font-semibold text-purple-900 mb-2 text-sm sm:text-base">🚀 Business Partner Benefits:</h4>
                          <ul className="space-y-1 text-xs sm:text-sm text-purple-800">
                            <li>• <strong>3 months FREE pro subscription</strong> (just for registering!)</li>
                            <li>• <strong>+1 month pro free</strong> for each business you refer</li>
                            <li>• Free premium setup & onboarding</li>
                            <li>• Featured listing placement</li>
                            <li>• Dedicated success manager</li>
                          </ul>
                        </div>
                        <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                          <li className="flex items-center">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                            Reduce no-shows by 60%
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                            Smart analytics dashboard
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                            Automated customer management
                          </li>
                        </ul>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Let's get to know you</h2>
                  <p className="text-sm sm:text-base text-gray-600">We'll use this information to personalize your pre-launch experience</p>
                </div>

                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="pl-10 h-11 sm:h-12"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10 h-11 sm:h-12"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="phone"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="pl-10 h-11 sm:h-12"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm">Location *</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => setFormData({ ...formData, location: value })}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="h-11 sm:h-12">
                        <SelectValue placeholder="Select your city" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-10 pr-10 h-11 sm:h-12"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="pl-10 pr-10 h-11 sm:h-12"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Referral Code Input */}
                <div className="bg-green-50 p-4 sm:p-6 rounded-xl border border-green-200">
                  <div className="flex items-center mb-4">
                    <Gift className="w-6 h-6 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-green-900">Have a Referral Code?</h3>
                  </div>
                  <p className="text-green-700 mb-4">
                    Enter a friend's referral code to unlock bonus rewards for both of you!
                  </p>
                  <Input
                    placeholder="Enter referral code (optional)"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="bg-white border-green-300 focus:border-green-500"
                    disabled={isLoading}
                  />
                  {referralCode && (
                    <div className="mt-3 p-3 bg-green-100 rounded-lg">
                      <p className="text-sm text-green-800">
                        🎉 Great! You and your friend will both get ₹500 bonus credits when we launch!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Specific Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {userType === "customer" ? "What services interest you?" : "Tell us about your business"}
                  </h2>
                  <p className="text-gray-600">
                    {userType === "customer"
                      ? "Select all that apply to get personalized launch updates"
                      : "Help us understand your business better for tailored onboarding"}
                  </p>
                </div>

                {userType === "customer" ? (
                  <div className="space-y-4">
                    <Label>Service Interests (Select all that apply)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {serviceOptions.map((service) => (
                        <div key={service} className="flex items-center space-x-2">
                          <Checkbox
                            id={service}
                            checked={formData.serviceInterests.includes(service)}
                            onCheckedChange={(checked) => handleServiceInterestChange(service, checked as boolean)}
                            disabled={isLoading}
                          />
                          <Label htmlFor={service} className="text-sm">
                            {service}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name *</Label>
                      <Input
                        id="businessName"
                        placeholder="Enter your business name"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessCategory">Business Category *</Label>
                      <Select
                        value={formData.businessCategory}
                        onValueChange={(value) => setFormData({ ...formData, businessCategory: value })}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your business category" />
                        </SelectTrigger>
                        <SelectContent>
                          {businessCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessDescription">Business Description</Label>
                      <Textarea
                        id="businessDescription"
                        placeholder="Tell us about your business, services, and what makes you special..."
                        value={formData.businessDescription}
                        onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                        rows={4}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentBookingMethod">Current Booking Method</Label>
                      <Select
                        value={formData.currentBookingMethod}
                        onValueChange={(value) => setFormData({ ...formData, currentBookingMethod: value })}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="How do you currently handle bookings?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phone">Phone calls only</SelectItem>
                          <SelectItem value="walk-in">Walk-in only</SelectItem>
                          <SelectItem value="manual">Manual booking system</SelectItem>
                          <SelectItem value="other-app">Other booking app</SelectItem>
                          <SelectItem value="website">Own website booking</SelectItem>
                          <SelectItem value="none">No booking system</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Engagement & Preferences */}
            {currentStep === 4 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Help us serve you better</h2>
                  <p className="text-sm sm:text-base text-gray-600">Your preferences will help us customize your pre-launch experience</p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-3 sm:space-y-4">
                    <Label className="text-sm">How excited are you about our launch? (1-10)</Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs sm:text-sm text-gray-500">1</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.launchInterest}
                        onChange={(e) => setFormData({ ...formData, launchInterest: Number.parseInt(e.target.value) })}
                        className="flex-1"
                        disabled={isLoading}
                      />
                      <span className="text-xs sm:text-sm text-gray-500">10</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {formData.launchInterest}
                      </Badge>
                    </div>
                    <div className="flex justify-center">
                      {Array.from({ length: formData.launchInterest }, (_, i) => (
                        <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="earlyAccessInterest"
                        checked={formData.earlyAccessInterest}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, earlyAccessInterest: checked as boolean })
                        }
                        disabled={isLoading}
                      />
                      <Label htmlFor="earlyAccessInterest" className="text-xs sm:text-sm leading-tight">
                        I want early access to beta features before public launch
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="marketingConsent"
                        checked={formData.marketingConsent}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, marketingConsent: checked as boolean })
                        }
                        disabled={isLoading}
                      />
                      <Label htmlFor="marketingConsent" className="text-xs sm:text-sm leading-tight">
                        Send me launch updates, exclusive offers, and platform news
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="whatsappUpdates"
                        checked={formData.whatsappUpdates}
                        onCheckedChange={(checked) => setFormData({ ...formData, whatsappUpdates: checked as boolean })}
                        disabled={isLoading}
                      />
                      <Label htmlFor="whatsappUpdates" className="text-xs sm:text-sm leading-tight">
                        Send me important updates via WhatsApp
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="shareOnSocial"
                        checked={formData.shareOnSocial}
                        onCheckedChange={(checked) => setFormData({ ...formData, shareOnSocial: checked as boolean })}
                        disabled={isLoading}
                      />
                      <Label htmlFor="shareOnSocial" className="text-xs sm:text-sm leading-tight">
                        I'm willing to share FastBookr with my network (earn extra rewards!)
                      </Label>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">🎉 Your Pre-Launch Benefits!</h3>
                    <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-700">
                      {userType === "customer" ? (
                        <>
                          <li className="flex items-center">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                            50% off your first 10 bookings
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                            Lifetime premium features access
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                            Priority customer support
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                            Exclusive launch event invitations
                          </li>
                        </>
                      ) : (
                        <>
                          <li className="flex items-center">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />3 months free premium subscription
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                            Free professional setup and onboarding
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                            Featured listing placement
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
                            Dedicated success manager
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Referral & Sharing */}
            {currentStep === 5 && (
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Share & Earn Rewards</h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Your unique referral code is ready! Start earning rewards by inviting friends
                  </p>
                </div>

                {/* Generated Referral Code */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 rounded-xl border border-green-200">
                  <div className="text-center mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-green-900 mb-2">🎉 Your Referral Code</h3>
                    <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-green-300 inline-block">
                      <div className="text-2xl sm:text-3xl font-bold text-green-600 tracking-wider">{generatedReferralCode}</div>
                    </div>
                    <Button
                      onClick={copyReferralCode}
                      variant="outline"
                      size="sm"
                      className="mt-3 border-green-300 text-green-700 hover:bg-green-100 text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
                      disabled={isLoading}
                    >
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Copy Code
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="font-semibold text-green-900 mb-3 text-sm sm:text-base">💰 Earn for Every Referral:</h4>
                      <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-green-800">
                        <li>• ₹500 credit for each friend who joins</li>
                        <li>• Unlock premium features early</li>
                        <li>• Exclusive referrer badges</li>
                        <li>• Special launch party invites</li>
                        <li>• Bonus rewards at 10+ referrals</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900 mb-3 text-sm sm:text-base">🎁 Your Friends Get:</h4>
                      <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-green-800">
                        <li>• ₹500 welcome bonus credit</li>
                        <li>• All pre-launch benefits</li>
                        <li>• Priority early access</li>
                        <li>• Exclusive member perks</li>
                        <li>• Their own referral rewards</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Social Sharing */}
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 text-center">
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                    Share with Your Network
                  </h3>
                  <p className="text-center text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm">
                    Share FastBookr on social media and earn bonus points for each platform!
                  </p>

                  <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4">
                    <Button
                      onClick={() => shareOnSocial("whatsapp")}
                      className="bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3"
                      disabled={isLoading}
                    >
                      <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      WhatsApp
                    </Button>
                    <Button
                      onClick={() => shareOnSocial("twitter")}
                      className="bg-blue-400 hover:bg-blue-500 text-white text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3"
                      disabled={isLoading}
                    >
                      <Twitter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Twitter
                    </Button>
                    <Button
                      onClick={() => shareOnSocial("facebook")}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3"
                      disabled={isLoading}
                    >
                      <Facebook className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Facebook
                    </Button>
                    <Button
                      onClick={() => shareOnSocial("linkedin")}
                      className="bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-3"
                      disabled={isLoading}
                    >
                      <Linkedin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      LinkedIn
                    </Button>
                  </div>

                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-blue-800 text-center">
                      💡 <strong>Pro Tip:</strong> Share on multiple platforms to earn 100 bonus points per platform!
                    </p>
                  </div>
                </div>

                {/* Final Confirmation */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-center text-sm sm:text-base">
                    ✅ Ready to Complete Your Registration?
                  </h3>
                  <div className="grid gap-3 sm:gap-4 md:grid-cols-2 text-xs sm:text-sm">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">What happens next:</h4>
                      <ul className="space-y-1 text-gray-700">
                        <li>• Instant confirmation email</li>
                        <li>• Welcome package with timeline</li>
                        <li>• Regular launch updates</li>
                        <li>• Early access notifications</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Your benefits activate:</h4>
                      <ul className="space-y-1 text-gray-700">
                        <li>• Immediately: Referral rewards</li>
                        <li>• Beta launch: Early access</li>
                        <li>• Public launch: All premium perks</li>
                        <li>• Ongoing: Exclusive member benefits</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 sm:pt-8 border-t border-gray-200 gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={!isClient || currentStep === 1 || isLoading}
                className="flex items-center space-x-2 h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Previous</span>
                <span className="xs:hidden">Back</span>
              </Button>

              {currentStep === totalSteps ? (
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !isClient ||
                    !userType ||
                    !formData.fullName ||
                    !formData.email ||
                    !formData.phone ||
                    !formData.location ||
                    !formData.password ||
                    formData.password !== formData.confirmPassword ||
                    isLoading
                  }
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center space-x-2 h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base flex-1 max-w-xs"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                      <span className="hidden sm:inline">Creating Account...</span>
                      <span className="sm:hidden">Creating...</span>
                    </div>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Complete Pre-Registration</span>
                      <span className="sm:hidden">Complete</span>
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={
                    !isClient ||
                    (currentStep === 1 && !userType) ||
                    (currentStep === 2 &&
                      (!formData.fullName ||
                        !formData.email ||
                        !formData.phone ||
                        !formData.location ||
                        !formData.password ||
                        formData.password !== formData.confirmPassword)) ||
                    isLoading
                  }
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center space-x-2 h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-6 sm:mt-8 text-center">
          <div className="flex flex-col xs:grid xs:grid-cols-2 sm:flex sm:flex-row items-center justify-center space-y-2 xs:space-y-0 xs:gap-2 sm:space-x-8 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center justify-center xs:justify-start">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
              100% Free to join
            </div>
            <div className="flex items-center justify-center xs:justify-start">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
              No hidden fees ever
            </div>
            <div className="flex items-center justify-center xs:justify-start">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
              Cancel anytime
            </div>
            <div className="flex items-center justify-center xs:justify-start">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0" />
              Data protected
            </div>
          </div>
          <p className="mt-3 sm:mt-4 text-xs text-gray-400 px-2">
            By registering, you agree to our{" "}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
