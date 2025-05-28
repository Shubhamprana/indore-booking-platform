"use client"

import type React from "react"

import { useState } from "react"
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
import { useAuth } from "@/hooks/use-auth"

export default function HomePage() {
  const [language, setLanguage] = useState<"en" | "hi">("en")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState("Select your city")
  const [email, setEmail] = useState("")
  
  // Get authentication state
  const { profile, loading: authLoading, signOut } = useAuth()

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
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">BookNow</span>
              <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800">
                Pre-Launch
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

            <div className="flex items-center space-x-4">
              <LocationSelector selectedLocation={selectedLocation} onLocationChange={setSelectedLocation} />

              {/* Language Toggle - Always visible */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                className="flex items-center space-x-1"
              >
                <Globe className="w-4 h-4" />
                <span>{language === "en" ? "हिं" : "EN"}</span>
              </Button>

              <div className="hidden md:flex items-center space-x-2">
                {!authLoading && profile ? (
                  // Logged in user
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={profile.profile_image_url || "/placeholder.svg?height=40&width=40"} 
                            alt={profile.full_name || "User"} 
                          />
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
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
                  // Not logged in
                  <>
                    <Link href="/login">
                      <Button variant="outline">{t.nav.login}</Button>
                    </Link>
                    <Link href="/register">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        {t.nav.signup}
                      </Button>
                    </Link>
                  </>
                ) : (
                  // Loading state
                  <div className="flex items-center space-x-2">
                    <div className="h-10 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                  {t.nav.home}
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                  {t.nav.about}
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
                  {t.nav.contact}
                </Link>
                
                {!authLoading && profile ? (
                  // Logged in user - mobile
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={profile.profile_image_url || "/placeholder.svg?height=40&width=40"} 
                          alt={profile.full_name || "User"} 
                        />
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{profile.full_name || "User"}</p>
                        <p className="text-sm text-gray-600">{profile.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Link href="/profile" className="flex-1">
                        <Button variant="outline" className="w-full justify-start">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Button>
                      </Link>
                      {profile.user_type === 'business' && (
                        <Link href="/business/dashboard" className="flex-1">
                          <Button variant="outline" className="w-full justify-start">
                            <Building className="mr-2 h-4 w-4" />
                            Dashboard
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="outline"
                        className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                        onClick={async () => {
                          await signOut()
                          window.location.href = "/"
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  </div>
                ) : !authLoading ? (
                  // Not logged in - mobile
                  <div className="flex space-x-2 pt-4 border-t border-gray-200">
                    <Link href="/login" className="flex-1">
                      <Button variant="outline" className="w-full">
                        {t.nav.login}
                      </Button>
                    </Link>
                    <Link href="/register" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">{t.nav.signup}</Button>
                    </Link>
                  </div>
                ) : (
                  // Loading state - mobile
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200">
                  {t.hero.badge}
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  {t.hero.headline}
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    {t.hero.subheading}
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">{t.hero.description}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{t.hero.launchDate}</span>
                </div>
              </div>

              {/* Quick Email Signup */}
              <form onSubmit={handleQuickSignup} className="relative">
                <Input
                  type="email"
                  placeholder={t.hero.searchPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-4 pr-32 py-6 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  required
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {t.hero.earlyAccess}
                </Button>
              </form>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 w-full sm:w-auto"
                  >
                    {t.hero.cta}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/referral">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                    <Share2 className="mr-2 w-5 h-5" />
                    Refer & Earn
                  </Button>
                </Link>
              </div>

              {/* Launch Countdown */}
              <LaunchCountdown />
            </div>

            <div className="relative animate-float">
              <div className="relative z-10">
                <Image
                  src="/placeholder.svg?height=600&width=500"
                  alt="BookNow App Preview"
                  width={500}
                  height={600}
                  className="rounded-2xl shadow-2xl"
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
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                <AnimatedCounter end={15000} suffix="+" />
              </div>
              <div className="text-blue-100">{t.stats.preRegistered}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                <AnimatedCounter end={50} suffix="+" />
              </div>
              <div className="text-blue-100">{t.stats.cities}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                <AnimatedCounter end={2000} suffix="+" />
              </div>
              <div className="text-blue-100">{t.stats.businesses}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                <AnimatedCounter end={5000} suffix="+" />
              </div>
              <div className="text-blue-100">{t.stats.referrals}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Search & Follow Section - Only for logged in users */}
      {profile && !authLoading && (
        <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Discover & Connect with Businesses
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Find and follow local businesses, connect with entrepreneurs, and build your network
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.services.title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t.services.subtitle}</p>
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
                    <Image
                      src={service.image || "/placeholder.svg"}
                      alt={service.name}
                      width={300}
                      height={200}
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

      {/* Referral Program */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-green-100 text-green-800 border-green-200 mb-4">
              <Gift className="w-4 h-4 mr-2" />
              Referral Program
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t.referral.title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t.referral.subtitle}</p>
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
                    {t.referral.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <Star className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Link href="/referral">
                      <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                        {t.referral.cta}
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative">
              <Image
                src="/placeholder.svg?height=400&width=500"
                alt="Referral Program"
                width={500}
                height={400}
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-600/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

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
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Be Part of the Revolution?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of early adopters waiting for the future of booking. Limited spots available!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?type=customer">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 w-full sm:w-auto">
                Join as Customer
                <Users className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/register?type=business">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white hover:text-blue-600 w-full sm:w-auto"
              >
                Partner with Us
                <TrendingUp className="ml-2 w-5 h-5" />
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
                <span className="text-xl font-bold">BookNow</span>
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
              &copy; 2024 BookNow. All rights reserved. Coming soon to revolutionize booking.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <div className="flex items-center text-gray-400">
                <Phone className="w-4 h-4 mr-2" />
                <span>+1-800-BOOKNOW</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Mail className="w-4 h-4 mr-2" />
                <span>hello@booknow.com</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
