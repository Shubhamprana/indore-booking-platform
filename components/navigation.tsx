"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Globe,
  Calendar,
  Menu,
  X,
  LogOut,
  User,
  Building,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { refreshAuthenticationState, UI_REFRESH_EVENTS, uiRefreshManager } from "@/lib/ui-refresh"

interface NavigationProps {
  language?: "en" | "hi"
  onLanguageChange?: (lang: "en" | "hi") => void
  selectedLocation?: string
  onLocationChange?: (location: string) => void
  showLocationSelector?: boolean
}

export function Navigation({ 
  language = "en", 
  onLanguageChange,
  selectedLocation = "Select your city",
  onLocationChange,
  showLocationSelector = true
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { profile, loading: authLoading, signOut, forceRefresh } = useAuth()

  const content = {
    en: {
      nav: {
        home: "Home",
        about: "About",
        contact: "Contact",
        login: "Login",
        signup: "Join Waitlist",
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
    },
  }

  const t = content[language]

  // Subscribe to authentication changes
  useEffect(() => {
    const unsubscribe = uiRefreshManager.on(UI_REFRESH_EVENTS.AUTHENTICATION_CHANGED, () => {
      setRefreshKey(prev => prev + 1)
      forceRefresh()
    })

    return unsubscribe
  }, [forceRefresh])

  const handleSignOut = async () => {
    await signOut()
    refreshAuthenticationState()
    window.location.href = "/"
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200" key={refreshKey}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">FastBookr 00</span>
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
            {/* Location Selector */}
            {showLocationSelector && onLocationChange && (
              <div className="hidden sm:block">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Implement location selector logic here
                    // For now, just a placeholder
                  }}
                  className="text-sm"
                >
                  📍 {selectedLocation}
                </Button>
              </div>
            )}

            {/* Language Toggle */}
            {onLanguageChange && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onLanguageChange(language === "en" ? "hi" : "en")}
                className="flex items-center space-x-1"
              >
                <Globe className="w-4 h-4" />
                <span>{language === "en" ? "हिं" : "EN"}</span>
              </Button>
            )}

            {/* Desktop Auth Section */}
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
                        {profile.user_type === 'business' && (
                          <Badge variant="secondary" className="text-xs w-fit">
                            Business Account
                          </Badge>
                        )}
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
                      onClick={handleSignOut}
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
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 transition-colors px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.home}
              </Link>
              <Link 
                href="/about" 
                className="text-gray-700 hover:text-blue-600 transition-colors px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.about}
              </Link>
              <Link 
                href="/contact" 
                className="text-gray-700 hover:text-blue-600 transition-colors px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.contact}
              </Link>
              
              <div className="border-t border-gray-200 pt-3 mt-3">
                {!authLoading && profile ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={profile.profile_image_url || "/placeholder.svg?height=32&width=32"} 
                          alt={profile.full_name || "User"} 
                        />
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm">
                          {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{profile.full_name || "User"}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{profile.email}</p>
                      </div>
                    </div>
                    
                    <Link 
                      href="/profile" 
                      className="flex items-center text-gray-700 hover:text-blue-600 transition-colors px-2 py-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    
                    {profile.user_type === 'business' && (
                      <Link 
                        href="/business/dashboard" 
                        className="flex items-center text-gray-700 hover:text-blue-600 transition-colors px-2 py-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Building className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false)
                        handleSignOut()
                      }}
                      className="flex items-center text-red-600 hover:text-red-700 transition-colors px-2 py-1 w-full text-left"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </button>
                  </div>
                ) : !authLoading ? (
                  <div className="space-y-3">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">{t.nav.login}</Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        {t.nav.signup}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation 