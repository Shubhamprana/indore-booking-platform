"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  Share2,
  Gift,
  Trophy,
  Star,
  Users,
  Target,
  TrendingUp,
  Camera,
  CheckCircle,
  Clock,
  Award,
  Copy,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { updateUserProfile } from "@/lib/auth"
import { 
  type UserStats,
  type Achievement,
  type UserActivity,
  type Referral
} from "@/lib/user-stats"
import { useToast } from "@/hooks/use-toast"
import { type FollowStats } from "@/lib/follow-system"

interface ProfileData {
  fullName: string
  email: string
  phone: string
  location: string
  bio: string
  interests: string[]
  joinDate: string
  referralCode: string
  profileImage: string
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([])
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [totalUsers, setTotalUsers] = useState(15847)
  const [followStats, setFollowStats] = useState<FollowStats>({ followers_count: 0, following_count: 0 })
  
  // Always call useAuth hook (Rules of Hooks)
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    if (profile) {
      setProfileData({
        fullName: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        location: profile.location || "",
        bio: profile.bio || "",
        interests: profile.service_interests || [],
        joinDate: profile.created_at || "",
        referralCode: profile.referral_code || "",
        profileImage: profile.profile_image_url || "/placeholder.svg?height=100&width=100",
      })
      setLoading(false)
    } else if (!authLoading && user && !profile) {
      // If user exists but no profile, create default profile data
      setProfileData({
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        location: user.user_metadata?.location || "Not specified",
        bio: "",
        interests: [],
        joinDate: user.created_at || new Date().toISOString(),
        referralCode: user.user_metadata?.referral_code || `BN${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        profileImage: "/placeholder.svg?height=100&width=100",
      })
      setLoading(false)
    } else if (!authLoading && !user) {
      // No user logged in, redirect to login
      window.location.href = "/login"
    }
  }, [mounted, profile, user, authLoading])

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading && !authLoading) {
        setProfileData({
          fullName: "User",
          email: "user@example.com",
          phone: "",
          location: "Not specified",
          bio: "",
          interests: [],
          joinDate: new Date().toISOString(),
          referralCode: `BN${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          profileImage: "/placeholder.svg?height=100&width=100",
        })
        setLoading(false)
      }
    }, 5000) // 5 second timeout

    return () => clearTimeout(timeout)
  }, [loading, authLoading])

  // Load real user data
  useEffect(() => {
    if (!mounted || !user) return

    const loadUserData = async () => {
      // Create a default stats object for fallback
      const defaultStats = {
        total_referrals: 0,
        successful_referrals: 0,
        credits_earned: 0,
        total_points: 0,
        achievements_count: 0,
        position_rank: 0,
        last_calculated_at: new Date().toISOString()
      };

      try {
        // Load all user data via API instead of direct function calls
        console.log("Loading user data via API for profile page...")
        const response = await fetch(`/api/user-stats?userId=${user.id}&action=all`)
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (result.success && result.data) {
          // Set all data from API response
          setUserStats(result.data.stats || defaultStats)
          setAchievements(result.data.achievements || [])
          setRecentActivity(result.data.activities || [])
          setReferrals(result.data.referrals || [])
          setFollowStats(result.data.followStats || { followers_count: 0, following_count: 0 })
          setTotalUsers(result.data.totalUsers || 15847)
          
          console.log("User data loaded successfully via API")
        } else {
          throw new Error(result.error || 'Failed to load user data')
        }
      } catch (error) {
        console.error("Error loading user data via API:", error);
        // Set fallback data
        setUserStats(defaultStats);
        setAchievements([]);
        setRecentActivity([]);
        setReferrals([]);
        setFollowStats({ followers_count: 0, following_count: 0 });
        setTotalUsers(15847);
      }
    };

    loadUserData();
  }, [mounted, user])

  // Add interval to refresh data periodically
  useEffect(() => {
    if (!mounted || !user) return

    const interval = setInterval(async () => {
      try {
        // Refresh follow stats via API
        const followStatsResponse = await fetch(`/api/user-stats?userId=${user.id}&action=follow-stats`)
        if (followStatsResponse.ok) {
          const followStatsResult = await followStatsResponse.json()
          if (followStatsResult.success) {
            setFollowStats(followStatsResult.data)
          }
        }
        
        // Refresh user stats via API
        const statsResponse = await fetch(`/api/user-stats?userId=${user.id}&action=stats`)
        if (statsResponse.ok) {
          const statsResult = await statsResponse.json()
          if (statsResult.success && statsResult.data) {
            setUserStats(statsResult.data)
          }
        }
      } catch (error) {
        console.error("Error refreshing profile data via API:", error)
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [mounted, user])

  const refreshStats = async () => {
    if (!user) return
    
    try {
      // Clear cache via API
      await fetch('/api/user-stats?action=clear-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })
      
      // Force recalculation via API
      const response = await fetch(`/api/user-stats?userId=${user.id}&action=stats-recalculate`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setUserStats(result.data)
        }
      }
      
      // Also refresh follow stats via API
      const followStatsResponse = await fetch(`/api/user-stats?userId=${user.id}&action=follow-stats`)
      if (followStatsResponse.ok) {
        const followStatsResult = await followStatsResponse.json()
        if (followStatsResult.success) {
          setFollowStats(followStatsResult.data)
        }
      }
      
      toast({
        title: "Stats Refreshed! 📊",
        description: "Your profile statistics have been updated.",
      })
    } catch (error) {
      console.error("Error refreshing stats via API:", error)
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh statistics. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    if (!user || !profileData) return
    
    try {
      setLoading(true)
      await updateUserProfile(user.id, {
        full_name: profileData.fullName,
        phone: profileData.phone,
        location: profileData.location,
        bio: profileData.bio,
        service_interests: profileData.interests,
      })
      setIsEditing(false)
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been saved."
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error updating profile",
        description: "There was an error saving your profile information.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const copyReferralCode = () => {
    if (!profileData?.referralCode) return
    navigator.clipboard.writeText(profileData.referralCode)
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    })
  }

  const copyReferralLink = () => {
    if (!profileData?.referralCode) return
    const link = `${window.location.origin}/register?ref=${profileData.referralCode}`
    navigator.clipboard.writeText(link)
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    })
  }

  const shareOnSocial = (platform: string) => {
    if (!profileData?.referralCode) return
    
    const message = `Join BookNow! Every 2 friends I refer, we all earn rewards! Use my referral code: ${profileData.referralCode}`
    const url = `${window.location.origin}/register?ref=${profileData.referralCode}`
    
    let shareUrl = ""
    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(message + " " + url)}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank")
    }
  }

  if (!mounted || authLoading || loading || !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-base sm:text-xl font-bold">FastBookr</span>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-[10px] sm:text-xs px-1 py-0.5 sm:px-2 sm:py-1">
                Pre-Launch
              </Badge>
            </Link>
            <div className="flex flex-wrap items-center gap-1 sm:gap-3 md:gap-4 w-full xs:w-auto">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-[10px] sm:text-sm h-7 sm:h-9 px-2 sm:px-3"
                onClick={refreshStats}
              >
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Refresh Stats</span>
                <span className="xs:hidden">Refresh</span>
              </Button>
              <Link href="/">
                <Button variant="outline" size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-[10px] sm:text-sm h-7 sm:h-9 px-2 sm:px-3">
                  Home
                </Button>
              </Link>
              {profile?.user_type === 'business' && (
                <Link href="/business/dashboard">
                  <Button variant="outline" size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-[10px] sm:text-sm h-7 sm:h-9 px-2 sm:px-3">
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden">Dash</span>
                  </Button>
                </Link>
              )}
              <Button 
                variant="outline" 
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-[10px] sm:text-sm h-7 sm:h-9 px-2 sm:px-3"
                onClick={async () => {
                  await signOut()
                  window.location.href = "/login"
                }}
              >
                <span className="hidden xs:inline">Sign Out</span>
                <span className="xs:hidden">Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-6 md:py-8">
        <div className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-3">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-3 sm:p-6">
                <div className="text-center mb-3 sm:mb-6">
                  <div className="relative inline-block">
                    <Avatar className="w-16 h-16 sm:w-24 sm:h-24 mx-auto">
                      <AvatarImage src={profileData.profileImage || "/placeholder.svg"} alt={profileData.fullName} />
                      <AvatarFallback className="text-sm sm:text-2xl">
                        {profileData.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <Button size="sm" className="absolute bottom-0 right-0 rounded-full w-6 h-6 sm:w-8 sm:h-8 p-0" variant="outline">
                      <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                  <h2 className="text-base sm:text-xl font-bold text-gray-900 mt-2 sm:mt-4">{profileData.fullName}</h2>
                  <p className="text-xs sm:text-base text-gray-600">{profileData.email}</p>
                  <Badge className="mt-1 sm:mt-2 bg-green-100 text-green-800 text-[10px] sm:text-xs">Early Adopter #{userStats?.position_rank || 0}</Badge>
                </div>

                <div className="space-y-2 sm:space-y-4">
                  <div className="flex items-center text-gray-600 text-xs sm:text-base">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="truncate">{profileData.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-xs sm:text-base">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="truncate">{profileData.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-xs sm:text-base">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 flex-shrink-0" />
                    <span>Joined {new Date(profileData.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-3 sm:mt-6 pt-3 sm:pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-xs sm:text-base">Quick Stats</h3>
                  <div className="grid grid-cols-3 gap-1 sm:gap-4 text-center">
                    <div>
                      <div className="text-sm sm:text-2xl font-bold text-blue-600">{userStats?.successful_referrals || 0}</div>
                      <div className="text-[10px] sm:text-sm text-gray-600">Referrals</div>
                    </div>
                    <div>
                      <div className="text-sm sm:text-2xl font-bold text-green-600">₹{userStats?.credits_earned?.toLocaleString() || 0}</div>
                      <div className="text-[10px] sm:text-sm text-gray-600">Credits</div>
                    </div>
                    <div>
                      <div className="text-sm sm:text-2xl font-bold text-purple-600">{userStats?.total_points?.toLocaleString() || 0}</div>
                      <div className="text-[10px] sm:text-sm text-gray-600">Points</div>
                    </div>
                    <div>
                      <div className="text-sm sm:text-2xl font-bold text-yellow-600">{achievements.length}</div>
                      <div className="text-[10px] sm:text-sm text-gray-600">Achievements</div>
                    </div>
                    <div>
                      <div className="text-sm sm:text-2xl font-bold text-indigo-600">{followStats.followers_count || 0}</div>
                      <div className="text-[10px] sm:text-sm text-gray-600">Followers</div>
                    </div>
                    <div>
                      <div className="text-sm sm:text-2xl font-bold text-pink-600">{followStats.following_count || 0}</div>
                      <div className="text-[10px] sm:text-sm text-gray-600">Following</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 sm:mt-6 space-y-2 sm:space-y-3">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="w-full h-8 sm:h-11 text-xs sm:text-base">
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700 h-8 sm:h-11 text-xs sm:text-base">
                      <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Save Changes
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Referral Card */}
            <Card className="mt-3 sm:mt-6">
              <CardContent className="p-3 sm:p-6">
                <div className="text-center mb-3 sm:mb-4">
                  <Gift className="w-6 h-6 sm:w-10 sm:h-10 text-purple-600 mx-auto mb-1 sm:mb-2" />
                  <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Your Referral Code</h3>
                  <p className="text-[10px] sm:text-sm text-gray-600 mb-2 sm:mb-4">Earn ₹50 credits every 2 friends you refer</p>
                  <div className="bg-purple-50 p-2 sm:p-3 rounded-lg border border-purple-200 flex items-center justify-between">
                    <div className="text-sm sm:text-xl font-bold text-purple-700">{profileData.referralCode}</div>
                    <Button variant="ghost" size="sm" onClick={copyReferralCode} className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-center mt-3 sm:mt-6">
                  <div>
                    <div className="text-sm sm:text-2xl font-bold text-blue-600">{userStats?.successful_referrals || 0}</div>
                    <div className="text-[10px] sm:text-sm text-gray-600">Friends Joined</div>
                  </div>
                  <div>
                    <div className="text-sm sm:text-2xl font-bold text-green-600">₹{userStats?.credits_earned?.toLocaleString() || 0}</div>
                    <div className="text-[10px] sm:text-sm text-gray-600">Credits Earned</div>
                  </div>
                </div>

                {/* Progress towards milestone */}
                <div className="mt-2 sm:mt-4 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                  {(() => {
                    const totalReferrals = userStats?.successful_referrals || 0
                    const currentMilestone = Math.ceil(totalReferrals / 2) || 1
                    const progressInMilestone = totalReferrals % 2 === 0 && totalReferrals > 0 ? 2 : totalReferrals % 2
                    const completedMilestones = Math.floor(totalReferrals / 2)
                    
                    return (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs sm:text-sm font-medium text-blue-900">
                            Milestone {currentMilestone} Progress
                          </span>
                          <span className="text-xs sm:text-sm text-blue-700">{progressInMilestone}/2</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${(progressInMilestone / 2) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-blue-700 mt-1">
                          {completedMilestones > 0 && (
                            <span className="text-green-700">✅ {completedMilestones} milestone{completedMilestones > 1 ? 's' : ''} completed! </span>
                          )}
                          {progressInMilestone === 2 
                            ? "🎉 Milestone reached! Rewards unlocked!" 
                            : `${2 - progressInMilestone} more friend${2 - progressInMilestone === 1 ? '' : 's'} needed for next milestone`
                          }
                        </p>
                      </>
                    )
                  })()}
                </div>

                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Share Your Code</h4>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-xs sm:text-sm h-9 sm:h-10"
                      onClick={() => shareOnSocial("whatsapp")}
                    >
                      WhatsApp
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-blue-500 hover:bg-blue-600 text-xs sm:text-sm h-9 sm:h-10" 
                      onClick={() => shareOnSocial("twitter")}
                    >
                      Twitter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10">
                <TabsTrigger value="profile" className="text-xs sm:text-sm">Profile</TabsTrigger>
                <TabsTrigger value="referrals" className="text-xs sm:text-sm">Referrals</TabsTrigger>
                <TabsTrigger value="achievements" className="text-xs sm:text-sm">Achievements</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-4 sm:space-y-6">
                  <Card>
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-4 sm:space-y-6">
                        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-sm">Full Name</Label>
                            <Input
                              id="fullName"
                              value={profileData.fullName}
                              onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                              className="h-10 sm:h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm">Email Address</Label>
                            <Input id="email" value={profileData.email} disabled className="h-10 sm:h-11" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                            <Input
                              id="phone"
                              value={profileData.phone}
                              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                              className="h-10 sm:h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="location" className="text-sm">Location</Label>
                            <Input
                              id="location"
                              value={profileData.location}
                              onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                              className="h-10 sm:h-11"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio" className="text-sm">Bio</Label>
                          <Textarea
                            id="bio"
                            value={profileData.bio}
                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                            placeholder="Tell us about yourself..."
                            rows={4}
                            className="resize-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 sm:space-y-6">
                        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                          <div className="space-y-1">
                            <h4 className="text-xs sm:text-sm font-medium text-gray-500">Full Name</h4>
                            <p className="text-sm sm:text-base text-gray-900">{profileData.fullName}</p>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs sm:text-sm font-medium text-gray-500">Email Address</h4>
                            <p className="text-sm sm:text-base text-gray-900 truncate">{profileData.email}</p>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs sm:text-sm font-medium text-gray-500">Phone Number</h4>
                            <p className="text-sm sm:text-base text-gray-900">{profileData.phone || "Not provided"}</p>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs sm:text-sm font-medium text-gray-500">Location</h4>
                            <p className="text-sm sm:text-base text-gray-900">{profileData.location}</p>
                          </div>
                        </div>
                        {profileData.bio && (
                          <div className="space-y-1">
                            <h4 className="text-xs sm:text-sm font-medium text-gray-500">Bio</h4>
                            <p className="text-sm sm:text-base text-gray-900 whitespace-pre-line">{profileData.bio}</p>
                          </div>
                        )}
                      </div>
                    )}
                    </CardContent>
                  </Card>

                <Card>
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex items-center text-lg sm:text-xl">
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-500" />
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {achievements.slice(0, 3).map((achievement) => (
                        <div key={achievement.id} className="flex items-start p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <div className="bg-yellow-100 p-1 sm:p-2 rounded-lg mr-3 sm:mr-4 text-base sm:text-xl flex-shrink-0">{achievement.icon}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{achievement.name}</h4>
                            <p className="text-xs sm:text-sm text-gray-600">{achievement.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {achievement.unlocked
                                ? `Unlocked ${achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : ''}`
                                : `In progress: ${achievement.progress || 0}/${achievement.target || 0}`}
                            </p>
                          </div>
                          <div className="bg-yellow-100 text-yellow-800 text-xs font-medium px-1 py-0.5 sm:px-2 sm:py-1 rounded flex-shrink-0">
                            +{achievement.points} pts
                          </div>
                        </div>
                      ))}
                      {achievements.length === 0 && (
                        <div className="text-center py-4 sm:py-6">
                          <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-base sm:text-lg font-medium text-gray-600">No achievements yet</h3>
                          <p className="text-sm sm:text-base text-gray-500 mt-1">Complete actions to earn achievements</p>
                        </div>
                      )}
                      {achievements.length > 3 && (
                        <div className="text-center mt-2">
                          <Button variant="link" size="sm" className="text-xs sm:text-sm" onClick={() => {
                            const tabElement = document.querySelector('[data-value="achievements"]');
                            if (tabElement instanceof HTMLElement) {
                              tabElement.click();
                            }
                          }}>
                            View All Achievements
                          </Button>
                      </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex items-center text-lg sm:text-xl">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <div className="bg-blue-50 p-1 sm:p-2 rounded-full mr-3 sm:mr-4 flex-shrink-0">{getActivityIcon(activity.activity_type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.created_at)}</p>
                            </div>
                          {activity.reward_points > 0 && (
                            <div className="bg-green-100 text-green-800 text-xs font-medium px-1 py-0.5 sm:px-2 sm:py-1 rounded flex-shrink-0">
                              +{activity.reward_points} pts
                            </div>
                          )}
                          </div>
                      ))}
                      {recentActivity.length === 0 && (
                        <div className="text-center py-4 sm:py-6">
                          <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-base sm:text-lg font-medium text-gray-600">No recent activity</h3>
                          <p className="text-sm sm:text-base text-gray-500 mt-1">Your actions will appear here</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Referrals Tab */}
              <TabsContent value="referrals" className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="text-lg sm:text-xl">Referral Program</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 sm:p-6 rounded-xl mb-4 sm:mb-6 border border-purple-100">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">How it works</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <div className="bg-purple-100 text-purple-800 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center mr-2 sm:mr-3 mt-0.5 flex-shrink-0 text-xs sm:text-sm">
                            1
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm sm:text-base text-gray-800">Share your unique referral code with friends</p>
                            <p className="text-xs sm:text-sm text-gray-600">Use the social buttons below or copy your code</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-purple-100 text-purple-800 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center mr-2 sm:mr-3 mt-0.5 flex-shrink-0 text-xs sm:text-sm">
                            2
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm sm:text-base text-gray-800">Friends sign up using your code</p>
                            <p className="text-xs sm:text-sm text-gray-600">They enter your code during registration</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-purple-100 text-purple-800 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center mr-2 sm:mr-3 mt-0.5 flex-shrink-0 text-xs sm:text-sm">
                            3
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm sm:text-base text-gray-800">You both get rewarded!</p>
                            <p className="text-xs sm:text-sm text-gray-600">Earn ₹50 credits every 2 friends you refer (they get ₹25 each)</p>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Your Referral Link</h3>
                        <div className="flex flex-col xs:flex-row gap-2">
                        <Input
                            value={`${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${
                              profileData.referralCode
                            }`}
                            readOnly
                            className="text-xs sm:text-sm h-9 sm:h-10 flex-1"
                          />
                          <Button variant="outline" size="sm" className="h-9 sm:h-10 px-3" onClick={copyReferralLink}>
                            <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 xs:mr-2" />
                            <span className="hidden xs:inline">Copy</span>
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Share on Social Media</h3>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-xs sm:text-sm h-9 sm:h-10"
                            onClick={() => shareOnSocial("whatsapp")}
                          >
                            WhatsApp
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-blue-400 hover:bg-blue-500 text-xs sm:text-sm h-9 sm:h-10" 
                            onClick={() => shareOnSocial("twitter")}
                          >
                            Twitter
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm h-9 sm:h-10" 
                            onClick={() => shareOnSocial("facebook")}
                          >
                            Facebook
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-blue-700 hover:bg-blue-800 text-xs sm:text-sm h-9 sm:h-10" 
                            onClick={() => shareOnSocial("linkedin")}
                          >
                            LinkedIn
                          </Button>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Your Referrals</h3>
                          <Badge variant="outline" className="font-normal text-xs">
                            {referrals.length} Total
                          </Badge>
                        </div>
                        {referrals.length > 0 ? (
                          <div className="space-y-2 sm:space-y-3">
                            {referrals.map((referral) => (
                              <div
                                key={referral.id}
                                className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center min-w-0 flex-1">
                                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3 flex-shrink-0">
                                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs sm:text-sm">
                                      {referral.referred_user_id.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="font-medium text-gray-900 text-sm sm:text-base truncate">User {referral.referred_user_id.substring(0, 8)}</p>
                                    <p className="text-xs text-gray-500">
                                      Joined {new Date(referral.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  className={`text-xs flex-shrink-0 ml-2 ${
                                    referral.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {referral.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg">
                            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-base sm:text-lg font-medium text-gray-600">No referrals yet</h3>
                            <p className="text-sm sm:text-base text-gray-500 mt-1 mb-4">Share your code to start earning rewards</p>
                            <Button size="sm" className="h-9 sm:h-10 text-sm" onClick={() => shareOnSocial("whatsapp")}>Share Now</Button>
                      </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                      <div className="flex items-center">
                        <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-500" />
                        <span className="text-lg sm:text-xl">Your Achievements</span>
                      </div>
                      <div className="text-xs sm:text-sm font-normal text-gray-500">
                        {achievements.filter(a => a.unlocked).length}/{achievements.length} Unlocked
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 sm:space-y-6">
                      {/* Unlocked Achievements */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Unlocked</h3>
                        <div className="grid gap-3 sm:gap-4">
                          {achievements.filter(a => a.unlocked).map((achievement) => (
                            <div key={achievement.id} className="flex items-start p-3 sm:p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                              <div className="text-2xl sm:text-3xl mr-3 sm:mr-4 flex-shrink-0">{achievement.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-0">
                                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{achievement.name}</h4>
                                  <Badge className="xs:ml-2 bg-yellow-100 text-yellow-800 text-xs w-fit">+{achievement.points} pts</Badge>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">{achievement.description}</p>
                                <p className="text-xs text-gray-500 mt-1">Unlocked {achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : ""}</p>
                              </div>
                              <div className="flex-shrink-0">
                                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                              </div>
                            </div>
                          ))}

                          {achievements.filter(a => a.unlocked).length === 0 && (
                            <div className="text-center py-4 sm:py-6">
                              <p className="text-sm sm:text-base text-gray-500">Complete challenges to unlock achievements</p>
                          </div>
                          )}
                      </div>
                      </div>

                      {/* In Progress Achievements */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">In Progress</h3>
                        <div className="grid gap-3 sm:gap-4">
                          {achievements.filter(a => !a.unlocked).map((achievement) => (
                            <div key={achievement.id} className="flex items-start p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg">
                              <div className="text-2xl sm:text-3xl mr-3 sm:mr-4 flex-shrink-0">{achievement.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-0">
                                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{achievement.name}</h4>
                                  <Badge className="xs:ml-2 bg-gray-200 text-gray-700 text-xs w-fit">+{achievement.points} pts</Badge>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">{achievement.description}</p>
                                <div className="mt-2">
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{
                                        width: `${Math.min(
                                          100,
                                          Math.round(((achievement.progress || 0) / (achievement.target || 1)) * 100)
                                        )}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Progress: {achievement.progress || 0}/{achievement.target || 0}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}

                          {achievements.filter(a => !a.unlocked).length === 0 && (
                            <div className="text-center py-4 sm:py-6">
                              <p className="text-sm sm:text-base text-gray-500">You've unlocked all available achievements!</p>
                            </div>
                            )}
                          </div>
                      </div>
                      </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

// Activity icon helper
const getActivityIcon = (activity_type: string) => {
  switch (activity_type) {
    case "referral":
      return <Users className="w-5 h-5 text-green-600" />
    case "achievement":
      return <Trophy className="w-5 h-5 text-yellow-600" />
    case "share":
      return <Share2 className="w-5 h-5 text-blue-600" />
    case "profile":
    case "profile_update":
      return <User className="w-5 h-5 text-purple-600" />
    default:
      return <Star className="w-5 h-5 text-gray-600" />
  }
}

// Format time helper
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours} hours ago`
  if (diffInHours < 48) return "1 day ago"
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`
  return `${Math.floor(diffInHours / 168)} weeks ago`
} 