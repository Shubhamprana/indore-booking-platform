"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { 
  searchBusinessUsers, 
  followUser,
  unfollowUser,
  getTrendingBusinessUsers,
  clearFollowCaches,
  type BusinessUser 
} from '@/lib/follow-system'
import { 
  Search, 
  UserPlus, 
  UserMinus, 
  Users, 
  MapPin, 
  Building2, 
  Star,
  TrendingUp,
  Loader2,
  Heart,
  Eye
} from 'lucide-react'
import Link from 'next/link'

interface BusinessSearchProps {
  showTrending?: boolean
  maxResults?: number
  className?: string
}

export function BusinessSearch({ 
  showTrending = true, 
  maxResults = 20, 
  className = "" 
}: BusinessSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<BusinessUser[]>([])
  const [trendingUsers, setTrendingUsers] = useState<BusinessUser[]>([])
  const [loading, setLoading] = useState(false)
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set())
  const [processingFollows, setProcessingFollows] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now())

  const { profile } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load trending business users on mount
  useEffect(() => {
    if (mounted && showTrending) {
      loadTrendingUsers()
    }
  }, [mounted, showTrending])

  const loadTrendingUsers = async () => {
    try {
      setLoading(true)
      const trending = await getTrendingBusinessUsers(profile?.id, 10)
      setTrendingUsers(trending)
      
      // Update following state
      const following = new Set(
        trending.filter(user => user.is_following).map(user => user.id)
      )
      setFollowingUsers(following)
      setLastUpdateTime(Date.now())
    } catch (error) {
      console.error('Error loading trending users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = useCallback(async (query: string) => {
    if (!mounted) return
    
    try {
      setLoading(true)
      const results = await searchBusinessUsers(
        query.trim(), 
        profile?.id, 
        maxResults
      )
      setSearchResults(results)
      
      // Update following state
      const following = new Set(
        results.filter(user => user.is_following).map(user => user.id)
      )
      setFollowingUsers(following)
      setLastUpdateTime(Date.now())
    } catch (error) {
      console.error('Error searching users:', error)
      toast({
        title: "Search Error",
        description: "Failed to search business users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [mounted, profile?.id, maxResults, toast])

  // Debounced search
  useEffect(() => {
    if (!mounted) return

    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, handleSearch, mounted])

  const handleFollow = async (targetUserId: string, businessName?: string) => {
    if (!profile) {
      toast({
        title: "Login Required",
        description: "Please log in to follow business users.",
        variant: "destructive",
      })
      return
    }

    // Prevent multiple simultaneous follow requests for the same user
    if (processingFollows.has(targetUserId)) {
      toast({
        title: "Please wait",
        description: "Processing your previous request...",
        variant: "default",
      })
      return
    }

    try {
      // Mark this user as being processed
      setProcessingFollows(prev => new Set(prev).add(targetUserId))
      
      // Get current follow status directly from our local state first
      const currentlyFollowing = followingUsers.has(targetUserId)
      
      // Optimistically update the UI
      setFollowingUsers(prev => {
        const newSet = new Set(prev)
        if (currentlyFollowing) {
          newSet.delete(targetUserId)
        } else {
          newSet.add(targetUserId)
        }
        return newSet
      })

      // Update UI immediately for better UX
      const updateUserFollowState = (users: BusinessUser[]) => 
        users.map(user => 
          user.id === targetUserId 
            ? { 
                ...user, 
                is_following: !currentlyFollowing,
                followers_count: !currentlyFollowing 
                  ? user.followers_count + 1 
                  : Math.max(0, user.followers_count - 1)
              }
            : user
        )

      setSearchResults(updateUserFollowState)
      setTrendingUsers(updateUserFollowState)
      setLastUpdateTime(Date.now())

      // Perform the actual follow/unfollow operation
      let success: boolean
      if (currentlyFollowing) {
        success = await unfollowUser(profile.id, targetUserId)
      } else {
        success = await followUser(profile.id, targetUserId)
      }
      
      if (success) {
        toast({
          title: !currentlyFollowing ? "Following!" : "Unfollowed",
          description: !currentlyFollowing 
            ? `You are now following ${businessName || 'this business'}! 🎉`
            : `You unfollowed ${businessName || 'this business'}`,
        })
        
        // Force refresh the data to ensure consistency
        setTimeout(() => {
          if (searchQuery.trim()) {
            handleSearch(searchQuery)
          } else {
            loadTrendingUsers()
          }
        }, 500)
      } else {
        // Revert the optimistic update if the operation failed
        const revertUserFollowState = (users: BusinessUser[]) => 
          users.map(user => 
            user.id === targetUserId 
              ? { 
                  ...user, 
                  is_following: currentlyFollowing,
                  followers_count: currentlyFollowing 
                    ? user.followers_count + 1 
                    : Math.max(0, user.followers_count - 1)
                }
              : user
          )

        setSearchResults(revertUserFollowState)
        setTrendingUsers(revertUserFollowState)
        
        setFollowingUsers(prev => {
          const newSet = new Set(prev)
          if (currentlyFollowing) {
            newSet.add(targetUserId)
          } else {
            newSet.delete(targetUserId)
          }
          return newSet
        })

        toast({
          title: "Follow action failed",
          description: "Unable to update follow status. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error in follow action:', error)
      
      // Revert optimistic updates on error
      const currentlyFollowing = !followingUsers.has(targetUserId)
      setFollowingUsers(prev => {
        const newSet = new Set(prev)
        if (currentlyFollowing) {
          newSet.add(targetUserId)
        } else {
          newSet.delete(targetUserId)
        }
        return newSet
      })
      
      toast({
        title: "Follow action failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      // Remove from processing set
      setProcessingFollows(prev => {
        const newSet = new Set(prev)
        newSet.delete(targetUserId)
        return newSet
      })
    }
  }

  const UserCard = ({ user }: { user: BusinessUser }) => {
    const isProcessing = processingFollows.has(user.id)
    const isFollowing = followingUsers.has(user.id)

    return (
      <Card key={`${user.id}-${lastUpdateTime}`} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage 
                src={user.profile_image_url || "/placeholder.svg?height=64&width=64"} 
                alt={user.full_name} 
              />
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg">
                {user.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {user.business_name || user.full_name}
                  </h3>
                  {user.business_name && (
                    <p className="text-sm text-gray-600 truncate">{user.full_name}</p>
                  )}
                  
                  {user.business_category && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {user.business_category}
                    </Badge>
                  )}
                  
                  {user.location && (
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">{user.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      <span>{user.followers_count} followers</span>
                    </div>
                    <div className="flex items-center">
                      <Heart className="w-3 h-3 mr-1" />
                      <span>{user.following_count} following</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4 flex flex-col space-y-2">
                  <Button
                    size="sm"
                    variant={isFollowing ? "outline" : "default"}
                    onClick={() => handleFollow(user.id, user.business_name || user.full_name)}
                    disabled={isProcessing || !profile}
                    className={`min-w-[90px] ${
                      isFollowing 
                        ? "hover:bg-red-50 hover:text-red-600 hover:border-red-300" 
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : isFollowing ? (
                      <>
                        <UserMinus className="w-3 h-3 mr-1" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3 h-3 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    asChild
                  >
                    <Link href={`/business/${user.id}`}>
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Link>
                  </Button>
                </div>
              </div>
              
              {user.business_description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {user.business_description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!mounted) {
    return (
      <div className={`${className} space-y-4`}>
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} space-y-6`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search business users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-3 text-base"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
        )}
      </div>

      {/* Search Results */}
      {searchQuery.trim() && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({searchResults.length})
            </h3>
          </div>
          
          {searchResults.length === 0 && !loading ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No business users found for "{searchQuery}"</p>
              <p className="text-sm">Try searching with different keywords</p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map(user => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trending Users */}
      {showTrending && !searchQuery.trim() && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Trending Business Users
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadTrendingUsers}
              disabled={loading}
              className="ml-auto"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
          
          {trendingUsers.length === 0 && !loading ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No trending business users available</p>
              <p className="text-sm">Check back later for popular businesses</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trendingUsers.map(user => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BusinessSearch 