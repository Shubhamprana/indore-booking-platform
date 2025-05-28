"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { BusinessSearch } from '@/components/business-search'
import { 
  searchBusinessUsers, 
  followUser, 
  unfollowUser, 
  isFollowing,
  getUserFollowStats,
  getUserFollowers,
  getUserFollowing,
  clearFollowCaches,
  type BusinessUser,
  type FollowUser,
  type FollowStats
} from '@/lib/follow-system'
import { 
  Users, 
  Search, 
  RefreshCw, 
  TestTube, 
  CheckCircle, 
  XCircle,
  User,
  Building2
} from 'lucide-react'
import Link from 'next/link'

export default function FollowSystemTestPage() {
  const [mounted, setMounted] = useState(false)
  const [testResults, setTestResults] = useState<Array<{test: string, status: 'success' | 'error', message: string}>>([])
  const [isRunning, setIsRunning] = useState(false)
  const [followStats, setFollowStats] = useState<FollowStats>({ followers_count: 0, following_count: 0 })
  const [businessUsers, setBusinessUsers] = useState<BusinessUser[]>([])
  const [followers, setFollowers] = useState<FollowUser[]>([])
  const [following, setFollowing] = useState<FollowUser[]>([])
  
  const { profile } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    if (profile) {
      loadUserData()
    }
  }, [profile])

  const loadUserData = async () => {
    if (!profile) return

    try {
      const [stats, businesses, followersData, followingData] = await Promise.allSettled([
        getUserFollowStats(profile.id),
        searchBusinessUsers('', profile.id, 5),
        getUserFollowers(profile.id, profile.id, 5),
        getUserFollowing(profile.id, profile.id, 5)
      ])

      if (stats.status === 'fulfilled') {
        setFollowStats(stats.value)
      }
      if (businesses.status === 'fulfilled') {
        setBusinessUsers(businesses.value)
      }
      if (followersData.status === 'fulfilled') {
        setFollowers(followersData.value)
      }
      if (followingData.status === 'fulfilled') {
        setFollowing(followingData.value)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const addTestResult = (test: string, status: 'success' | 'error', message: string) => {
    setTestResults(prev => [...prev, { test, status, message }])
  }

  const runTests = async () => {
    if (!profile) {
      toast({
        title: "Login Required",
        description: "Please log in to run tests.",
        variant: "destructive"
      })
      return
    }

    setIsRunning(true)
    setTestResults([])

    try {
      // Test 1: Search Business Users
      addTestResult("Search Business Users", "success", "Starting search test...")
      const searchResults = await searchBusinessUsers('', profile.id, 3)
      addTestResult("Search Business Users", "success", `Found ${searchResults.length} business users`)

      // Test 2: Get Follow Stats
      addTestResult("Get Follow Stats", "success", "Getting follow statistics...")
      const stats = await getUserFollowStats(profile.id)
      addTestResult("Get Follow Stats", "success", `Followers: ${stats.followers_count}, Following: ${stats.following_count}`)

      // Test 3: Follow Status Check (if there are business users)
      if (searchResults.length > 0) {
        const testUser = searchResults.find(user => user.id !== profile.id)
        if (testUser) {
          addTestResult("Follow Status Check", "success", "Checking follow status...")
          const isFollowingUser = await isFollowing(profile.id, testUser.id)
          addTestResult("Follow Status Check", "success", `Following ${testUser.full_name}: ${isFollowingUser}`)

          // Test 4: Follow/Unfollow (only if not already following)
          if (!isFollowingUser) {
            addTestResult("Follow Action", "success", "Testing follow action...")
            const followResult = await followUser(profile.id, testUser.id)
            addTestResult("Follow Action", followResult ? "success" : "error", 
              followResult ? `Successfully followed ${testUser.full_name}` : "Follow action failed")

            if (followResult) {
              // Test 5: Unfollow
              addTestResult("Unfollow Action", "success", "Testing unfollow action...")
              const unfollowResult = await unfollowUser(profile.id, testUser.id)
              addTestResult("Unfollow Action", unfollowResult ? "success" : "error",
                unfollowResult ? `Successfully unfollowed ${testUser.full_name}` : "Unfollow action failed")
            }
          }
        }
      }

      // Test 6: Get Followers
      addTestResult("Get Followers", "success", "Getting followers list...")
      const followersData = await getUserFollowers(profile.id, profile.id, 5)
      addTestResult("Get Followers", "success", `Found ${followersData.length} followers`)

      // Test 7: Get Following
      addTestResult("Get Following", "success", "Getting following list...")
      const followingData = await getUserFollowing(profile.id, profile.id, 5)
      addTestResult("Get Following", "success", `Found ${followingData.length} users you're following`)

      // Test 8: Cache Clearing
      addTestResult("Cache Management", "success", "Testing cache clearing...")
      clearFollowCaches()
      addTestResult("Cache Management", "success", "Caches cleared successfully")

      toast({
        title: "Tests Completed",
        description: "All follow system tests have been executed. Check results below.",
      })

      // Reload data to reflect any changes
      await loadUserData()

    } catch (error: any) {
      addTestResult("Test Execution", "error", `Error during testing: ${error.message}`)
      toast({
        title: "Test Error",
        description: "An error occurred during testing. Check results for details.",
        variant: "destructive"
      })
    } finally {
      setIsRunning(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test page...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h2>
            <p className="text-gray-600 mb-6">Please log in to test the follow system functionality.</p>
            <Link href="/login">
              <Button className="w-full">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Follow System Test Page</h1>
              <p className="text-blue-100 mt-2">Test and demonstrate follow system functionality</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {profile.user_type === 'business' ? 'Business User' : 'Customer'}
              </Badge>
              <Link href="/" className="text-blue-100 hover:text-white">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Test Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Test Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={runTests} 
                  disabled={isRunning}
                  className="w-full"
                  size="lg"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4 mr-2" />
                      Run All Tests
                    </>
                  )}
                </Button>
                
                <div className="text-sm text-gray-600">
                  <p>This will test:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Business user search</li>
                    <li>Follow status checking</li>
                    <li>Follow/unfollow actions</li>
                    <li>Follow statistics</li>
                    <li>Followers/following lists</li>
                    <li>Cache management</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Current Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Your Follow Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{followStats.followers_count}</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{followStats.following_count}</div>
                    <div className="text-sm text-gray-600">Following</div>
                  </div>
                </div>
                <Button 
                  onClick={loadUserData} 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Stats
                </Button>
              </CardContent>
            </Card>

            {/* Test Results */}
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No tests run yet. Click "Run All Tests" to start.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {testResults.map((result, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        {result.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-medium">{result.test}</div>
                          <div className="text-gray-600">{result.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Search Demo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Business Search Demo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BusinessSearch 
                  showTrending={true} 
                  maxResults={5} 
                  className="" 
                />
              </CardContent>
            </Card>

            {/* Current Data */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Your Followers */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Followers ({followers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {followers.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No followers yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {followers.slice(0, 3).map(follower => (
                        <div key={follower.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            {follower.user_type === 'business' ? (
                              <Building2 className="h-4 w-4 text-blue-600" />
                            ) : (
                              <User className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{follower.full_name}</div>
                            {follower.business_name && (
                              <div className="text-sm text-gray-600 truncate">{follower.business_name}</div>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {follower.user_type}
                          </Badge>
                        </div>
                      ))}
                      {followers.length > 3 && (
                        <p className="text-sm text-gray-500 text-center">
                          +{followers.length - 3} more
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Users You Follow */}
              <Card>
                <CardHeader>
                  <CardTitle>Following ({following.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {following.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Not following anyone yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {following.slice(0, 3).map(user => (
                        <div key={user.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            {user.user_type === 'business' ? (
                              <Building2 className="h-4 w-4 text-purple-600" />
                            ) : (
                              <User className="h-4 w-4 text-purple-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{user.full_name}</div>
                            {user.business_name && (
                              <div className="text-sm text-gray-600 truncate">{user.business_name}</div>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {user.user_type}
                          </Badge>
                        </div>
                      ))}
                      {following.length > 3 && (
                        <p className="text-sm text-gray-500 text-center">
                          +{following.length - 3} more
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 