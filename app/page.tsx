"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  TrendingUp,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Globe,
  Calendar,
  Gift,
  Menu,
  X,
  Phone,
  Mail,
  Utensils,
  Scissors,
  Stethoscope,
  Building,
  Car,
  Dumbbell,
  GraduationCap,
  Home,
  Rocket,
  Clock,
  Share2,
  UserPlus,
  LogOut,
  User,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { FloatingElements } from "@/components/floating-elements"
import { AnimatedCounter } from "@/components/animated-counter"
import { LocationSelector } from "@/components/location-selector"
import { LaunchCountdown } from "@/components/launch-countdown"
import { BusinessSearch } from "@/components/business-search"
import { HeroImage } from "@/components/hero-image"
import { StatsSection } from "@/components/stats-section"
import { ServicesSection } from "@/components/services-section"
import { ReferralSection } from "@/components/referral-section"
import { useAuth } from "@/hooks/use-auth"

export default function HomePage() {
  const [language, setLanguage] = useState<"en" | "hi">("en")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState("Select your city")
  const [email, setEmail] = useState("")
  const [showFloatingCTA, setShowFloatingCTA] = useState(false)
  
  // Get authentication state
  const { profile, loading: authLoading, signOut } = useAuth()

  // Show floating CTA when user scrolls down on mobile
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 400
      setShowFloatingCTA(scrolled)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const services = [
    { icon: Utensils, name: "Restaurants", count: "500+", image: "/placeholder.svg?height=200&width=300" },
    { icon: Scissors, name: "Salons & Spas", count: "300+", image: "/placeholder.svg?height=200&width=300" },
    { icon: Stethoscope, name: "Clinics", count: "200+", image: "/placeholder.svg?height=200&width=300" },
    { icon: Building, name: "Hotels", count: "150+", image: "/placeholder.svg?height=200&width=300" },
    { icon: Car, name: "Car Services", count: "100+", image: "/placeholder.svg?height=200&width=300" },
    { icon: Dumbbell, name: "Fitness", count: "80+", image: "/placeholder.svg?height=200&width=300" },
    { icon: GraduationCap, name: "Education", count: "120+", image: "/placeholder.svg?height=200&width=300" },
    { icon: Home, name: "Home Services", count: "250+", image: "/placeholder.svg?height=200&width=300" },
  ]

  const content = {
    en: {
      nav: {
        home: "Home",
        about: "About",
        contact: "Contact",
        login: "Login",
        signup: "Join Waitlist",
      },
      hero: {
        badge: "🚀 Launching Soon",
        headline: "Skip the Wait, Book Instantly",
        subheading: "Coming Soon to Your City",
        description:
          "Be the first to experience the future of booking. Join thousands waiting for our revolutionary platform.",
        cta: "Join the Revolution",
        earlyAccess: "Get Early Access",
        searchPlaceholder: "Enter your email for updates...",
        launchDate: "Expected Launch: Q2 2024",
      },
      stats: {
        preRegistered: "Pre-registered Users",
        cities: "Cities Interested",
        businesses: "Businesses Waiting",
        referrals: "Successful Referrals",
      },
      services: {
        title: "All Services Coming Soon",
        subtitle: "Get ready for seamless booking across all these categories",
      },
      valueProps: {
        customers: {
          title: "For Early Adopters",
          subtitle: "Exclusive benefits for joining before launch",
          benefits: [
            "50% off first 10 bookings",
            "Lifetime premium features",
            "Priority customer support",
            "Exclusive launch events",
          ],
        },
        businesses: {
          title: "For Business Partners",
          subtitle: "Special launch offers for early business partners",
          benefits: [
            "3 months free subscription",
            "Free premium setup",
            "Featured listing placement",
            "Dedicated success manager",
          ],
        },
      },
      howItWorks: {
        title: "How It Will Work",
        subtitle: "Simple, fast, and reliable booking in 3 easy steps",
        steps: [
          {
            title: "Choose Service",
            description: "Browse and select from thousands of verified service providers",
          },
          {
            title: "Book Instantly",
            description: "Select your preferred time slot and confirm with one click",
          },
          {
            title: "Skip the Wait",
            description: "Arrive at your scheduled time and enjoy priority service",
          },
        ],
      },
      referral: {
        title: "Invite Friends & Earn Rewards",
        subtitle: "Share the excitement and get amazing benefits",
        benefits: [
          "₹500 credit for every friend who joins",
          "Unlock premium features early",
          "Exclusive referrer badges",
          "Special launch party invites",
        ],
        cta: "Start Referring Now",
      },
    },
    hi: {
      nav: {
        home: "होम",
        about: "हमारे बारे में",
        contact: "संपर्क",
        login: "लॉगिन",
        signup: "वेटलिस्ट में शामिल हों",
      },
      hero: {
        badge: "🚀 जल्द लॉन्च हो रहा है",
        headline: "इंतज़ार छोड़ें, तुरंत बुक करें",
        subheading: "आपके शहर में जल्द आ रहा है",
        description:
          "बुकिंग के भविष्य का अनुभव करने वाले पहले व्यक्ति बनें। हमारे क्रांतिकारी प्लेटफॉर्म का इंतज़ार कर रहे हजारों लोगों में शामिल हों।",
        cta: "क्रांति में शामिल हों",
        earlyAccess: "प्रारंभिक पहुंच प्राप्त करें",
        searchPlaceholder: "अपडेट के लिए अपना ईमेल दर्ज करें...",
        launchDate: "अपेक्षित लॉन्च: Q2 2024",
      },
      stats: {
        preRegistered: "पूर्व-पंजीकृत उपयोगकर्ता",
        cities: "रुचि रखने वाले शहर",
        businesses: "प्रतीक्षारत व्यवसाय",
        referrals: "सफल रेफरल",
      },
      services: {
        title: "सभी सेवाएं जल्द आ रही हैं",
        subtitle: "इन सभी श्रेणियों में निर्बाध बुकिंग के लिए तैयार हो जाइए",
      },
      valueProps: {
        customers: {
          title: "प्रारंभिक अपनाने वालों के लिए",
          subtitle: "लॉन्च से पहले शामिल होने के लिए विशेष लाभ",
          benefits: ["पहली 10 बुकिंग पर 50% छूट", "जीवनभर प्रीमियम फीचर्स", "प्राथमिकता ग्राहक सहायता", "विशेष लॉन्च इवेंट्स"],
        },
        businesses: {
          title: "व्यावसायिक भागीदारों के लिए",
          subtitle: "प्रारंभिक व्यावसायिक भागीदारों के लिए विशेष लॉन्च ऑफर",
          benefits: ["3 महीने मुफ्त सब्सक्रिप्शन", "मुफ्त प्रीमियम सेटअप", "फीचर्ड लिस्टिंग प्लेसमेंट", "समर्पित सफलता प्रबंधक"],
        },
      },
      howItWorks: {
        title: "यह कैसे काम करेगा",
        subtitle: "3 आसान चरणों में सरल, तेज़ और विश्वसनीय बुकिंग",
        steps: [
          {
            title: "सेवा चुनें",
            description: "हजारों सत्यापित सेवा प्रदाताओं से ब्राउज़ करें और चुनें",
          },
          {
            title: "तुरंत बुक करें",
            description: "अपना पसंदीदा समय स्लॉट चुनें और एक क्लिक से पुष्टि करें",
          },
          {
            title: "इंतज़ार छोड़ें",
            description: "अपने निर्धारित समय पर पहुंचें और प्राथमिकता सेवा का आनंद लें",
          },
        ],
      },
      referral: {
        title: "दोस्तों को आमंत्रित करें और पुरस्कार कमाएं",
        subtitle: "उत्साह साझा करें और अद्भुत लाभ प्राप्त करें",
        benefits: [
          "हर दोस्त के शामिल होने पर ₹500 क्रेडिट",
          "प्रीमियम फीचर्स जल्दी अनलॉक करें",
          "विशेष रेफरर बैज",
          "विशेष लॉन्च पार्टी के निमंत्रण",
        ],
        cta: "अभी रेफर करना शुरू करें",
      },
    },
  }

  const t = content[language]

  const handleQuickSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // Redirect to full registration with email pre-filled
      window.location.href = `/register?email=${encodeURIComponent(email)}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <FloatingElements />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* Logo - Smaller on mobile */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <span className="text-lg md:text-xl font-bold text-gray-900">FastBookr</span>
              <Badge variant="secondary" className="ml-1 md:ml-2 bg-orange-100 text-orange-800 text-xs px-1.5 py-0.5">
                Beta
              </Badge>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                {t.nav.home}
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                {t.nav.about}
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
                {t.nav.contact}
              </Link>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Location selector - Hidden on mobile to save space */}
              <div className="hidden sm:block">
              <LocationSelector selectedLocation={selectedLocation} onLocationChange={setSelectedLocation} />
              </div>

              {/* Language Toggle - Smaller on mobile */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                className="flex items-center space-x-1 h-8 px-2 md:h-9 md:px-3"
              >
                <Globe className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm">{language === "en" ? "हिं" : "EN"}</span>
              </Button>

              {/* Mobile-first Auth Buttons */}
              <div className="flex items-center space-x-2">
                {!authLoading && profile ? (
                  // Logged in user - Show on both mobile and desktop
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full">
                        <Avatar className="h-8 w-8 md:h-10 md:w-10">
                          <AvatarImage 
                            src={profile.profile_image_url || "/placeholder.svg?height=40&width=40"} 
                            alt={profile.full_name || "User"} 
                          />
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm">
                            {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium">{profile.full_name || "User"}</p>
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {profile.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      {profile.user_type === 'business' && (
                        <DropdownMenuItem asChild>
                          <Link href="/business/dashboard" className="flex items-center">
                            <Building className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={async () => {
                          await signOut()
                          window.location.href = "/"
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : !authLoading ? (
                  // Not logged in - Show directly on mobile AND desktop for better UX
                  <>
                <Link href="/login">
                      <Button variant="outline" size="sm" className="h-8 px-3 md:h-9 md:px-4 text-xs md:text-sm">
                        {t.nav.login}
                      </Button>
                </Link>
                <Link href="/register">
                      <Button size="sm" className="h-8 px-3 md:h-9 md:px-4 text-xs md:text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    {t.nav.signup}
                  </Button>
                </Link>
                  </>
                ) : (
                  // Loading state
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-12 md:h-10 md:w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-16 md:h-10 md:w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                )}
              </div>

              {/* Mobile menu button - Only show if not logged in to save space */}
              {(!profile || authLoading) && (
              <Button
                variant="outline"
                size="sm"
                  className="md:hidden h-8 w-8 p-0"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                  {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
              )}
            </div>
          </div>

          {/* Mobile Navigation - Simplified */}
          {mobileMenuOpen && (!profile || authLoading) && (
            <div className="md:hidden border-t border-gray-200 py-3 bg-white">
              <div className="flex flex-col space-y-3">
                <Link 
                  href="/" 
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t.nav.home}
                </Link>
                <Link 
                  href="/about" 
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t.nav.about}
                </Link>
                <Link 
                  href="/contact" 
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t.nav.contact}
                </Link>
                
                {/* Mobile Location Selector */}
                <div className="pt-2 border-t border-gray-100">
                  <LocationSelector selectedLocation={selectedLocation} onLocationChange={setSelectedLocation} />
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-12 md:pb-16">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-6 md:space-y-8 animate-fade-in-up text-center lg:text-left">
              <div className="space-y-3 md:space-y-4">
                <Badge className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200 text-sm">
                  {t.hero.badge}
                </Badge>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  {t.hero.headline}
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    {t.hero.subheading}
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">{t.hero.description}</p>
                <div className="flex items-center justify-center lg:justify-start space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{t.hero.launchDate}</span>
                </div>
              </div>

              {/* Quick Email Signup - Mobile Optimized */}
              <form onSubmit={handleQuickSignup} className="relative w-full">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-0">
                <Input
                  type="email"
                  placeholder={t.hero.searchPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-4 md:py-6 text-base md:text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl sm:rounded-r-none sm:pr-2"
                  required
                />
                <Button
                  type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-4 md:py-6 px-6 rounded-xl sm:rounded-l-none text-base md:text-lg font-medium"
                >
                  {t.hero.earlyAccess}
                </Button>
                </div>
              </form>

              {/* Mobile-First CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full">
                <Link href="/register" className="flex-1 sm:flex-initial">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-base md:text-lg px-6 md:px-8 py-4 md:py-6 w-full"
                  >
                    {t.hero.cta}
                    <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </Link>
                <Link href="/referral" className="flex-1 sm:flex-initial">
                  <Button variant="outline" size="lg" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 w-full">
                    <Share2 className="mr-2 w-4 h-4 md:w-5 md:h-5" />
                    Refer & Earn
                  </Button>
                </Link>
              </div>

              {/* Mobile Quick Actions - Show login/signup prominently if not logged in */}
              {!profile && !authLoading && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100 sm:hidden">
                  <p className="text-sm text-gray-600 mb-3 text-center">Already have an account?</p>
                  <div className="flex gap-2">
                    <Link href="/login" className="flex-1">
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                        Sign Up Free
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Launch Countdown */}
              {/* <LaunchCountdown />  #commented out for now */}
            </div>

            <HeroImage />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection stats={t.stats} />

      {/* Business Search & Follow Section - Only for logged in users */}
      {profile && !authLoading && (
        <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Discover & Connect with Businesses
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Find and follow local businesses
              </p>
            </div>
            <BusinessSearch 
              showTrending={true} 
              maxResults={10} 
              className="max-w-4xl mx-auto" 
            />
          </div>
        </section>
      )}

      {/* Services Preview */}
      <ServicesSection 
        services={services} 
        title={t.services.title} 
        subtitle={t.services.subtitle} 
      />

      {/* Referral Program */}
      <ReferralSection 
        title={t.referral.title}
        subtitle={t.referral.subtitle}
        benefits={t.referral.benefits}
        cta={t.referral.cta}
      />

      {/* Value Propositions */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Exclusive Pre-Launch Benefits</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join now and get amazing perks that won't be available after launch
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* For Customers */}
            <Card className="p-8 border-2 border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{t.valueProps.customers.title}</h3>
                    <p className="text-gray-600">{t.valueProps.customers.subtitle}</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {t.valueProps.customers.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* For Businesses */}
            <Card className="p-8 border-2 border-purple-100 hover:border-purple-200 transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-0">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{t.valueProps.businesses.title}</h3>
                    <p className="text-gray-600">{t.valueProps.businesses.subtitle}</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {t.valueProps.businesses.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Will Work */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.howItWorks.title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t.howItWorks.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {t.howItWorks.steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold text-white">{index + 1}</span>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 transform -translate-x-8"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">Ready to Be Part of the Revolution?</h2>
          <p className="text-lg md:text-xl text-blue-100 mb-6 md:mb-8 max-w-2xl mx-auto">
            Join thousands of early adopters waiting for the future of booking. Limited spots available!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link href="/register?type=customer" className="flex-1 sm:flex-initial">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-base md:text-lg px-6 md:px-8 py-4 md:py-6 w-full">
                Join as Customer
                <Users className="ml-2 w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </Link>
            <Link href="/register?type=business" className="flex-1 sm:flex-initial">
              <Button
                variant="outline"
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 text-base md:text-lg px-6 md:px-8 py-4 md:py-6 w-full border-white hover:border-gray-100"
              >
                Partner with Us
                <TrendingUp className="ml-2 w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-blue-100">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-300 mr-2" />
              Free to join
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-300 mr-2" />
              Exclusive benefits
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-300 mr-2" />
              Early access guaranteed
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">FastBookr</span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Pre-Launch
                </Badge>
              </Link>
              <p className="text-gray-400 mb-4 max-w-md">
                Revolutionizing the booking experience worldwide. Join the waitlist and be the first to experience the
                future of booking.
              </p>
              <div className="flex items-center text-gray-400">
                <Globe className="w-4 h-4 mr-2" />
                <span>Launching Worldwide Soon</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/referral" className="hover:text-white transition-colors">
                    Referral Program
                  </Link>
                </li>
                <li>
                  <Link href="/register?type=business" className="hover:text-white transition-colors">
                    For Businesses
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/updates" className="hover:text-white transition-colors">
                    Launch Updates
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-center md:text-left">
              &copy; 2024 FastBookr. All rights reserved. Coming soon to revolutionize booking.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <div className="flex items-center text-gray-400">
                <Phone className="w-4 h-4 mr-2" />
                <span>+1-800-FASTBOOKR</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Mail className="w-4 h-4 mr-2" />
                <span>hello@fastbookr.com</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Mobile CTA - Only show when not logged in and scrolled */}
      {!profile && !authLoading && showFloatingCTA && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 backdrop-blur-md bg-white/95">
            <div className="flex gap-2">
              <Link href="/login" className="flex-1">
                <Button variant="outline" className="w-full text-sm">
                  Login
                </Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-sm">
                  Join Free
                </Button>
              </Link>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Join thousands waiting for launch! 🚀
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
