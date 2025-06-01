"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { ScalableCache, CacheStrategies } from '@/lib/scalable-cache'
import { PerformanceMonitor } from '@/lib/performance-monitor'
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
  Eye,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface BusinessSearchProps {
  showTrending?: boolean
  maxResults?: number
  className?: string
}

// Performance constants for high concurrency
const SEARCH_DEBOUNCE_MS = 300
const VIRTUAL_SCROLL_BUFFER = 10
const INITIAL_LOAD_SIZE = 20
const LOAD_MORE_SIZE = 10
const MAX_RETRIES = 3
const TIMEOUT_MS = 10000

interface OptimizedBusinessUser extends BusinessUser {
  isProcessing?: boolean
  optimisticFollowing?: boolean
}

interface SearchState {
  results: OptimizedBusinessUser[]
  loading: boolean
  error: string | null
  hasMore: boolean
  page: number
  searchQuery: string
}

export function BusinessSearch({ 
  showTrending = true, 
  maxResults = 20, 
  className = "" 
}: BusinessSearchProps) {
  const [state, setState] = useState<SearchState>({
    results: [],
    loading: false,
    error: null,
    hasMore: true,
    page: 0,
    searchQuery: ''
  })

  // Refs for performance optimization
  const abortControllerRef = useRef<AbortController | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const loadingRef = useRef(false)
  const retryCountRef = useRef(0)

  const { profile } = useAuth()
  const { toast } = useToast()

  // Debounced search function
  const debouncedSearch = useCallback(
    (query: string) => {
      // Clear existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      // Cancel ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query, true)
      }, SEARCH_DEBOUNCE_MS)
    },
    [profile?.id]
  )

  // Optimized search function with error handling
  const performSearch = useCallback(
    async (query: string, isNewSearch: boolean = false) => {
      if (loadingRef.current && !isNewSearch) return

      try {
        loadingRef.current = true
        abortControllerRef.current = new AbortController()

        const currentPage = isNewSearch ? 0 : state.page
        const limit = isNewSearch ? INITIAL_LOAD_SIZE : LOAD_MORE_SIZE
        const offset = currentPage * (isNewSearch ? INITIAL_LOAD_SIZE : LOAD_MORE_SIZE)

        setState(prev => ({
          ...prev,
          loading: true,
          error: null,
          ...(isNewSearch && { results: [], page: 0 })
        }))

        // Use scalable cache for search results
        const cacheConfig = CacheStrategies.businessSearch(query.trim(), 'all')
        
        const results = await ScalableCache.get(
          cacheConfig.key,
          async () => {
            return await searchBusinessUsers(
              query.trim(), 
              profile?.id, 
              limit,
              offset
            )
          },
          cacheConfig.ttl,
          cacheConfig.priority
        )
        
        setState(prev => {
          if (isNewSearch) {
            return {
              ...prev,
              results: results,
              loading: false,
              hasMore: results.length === limit,
              page: currentPage + 1,
              searchQuery: query
            }
          } else {
            // Deduplicate results to prevent duplicate keys
            const existingIds = new Set(prev.results.map(user => user.id))
            const newResults = results.filter(user => !existingIds.has(user.id))
            
            return {
              ...prev,
              results: [...prev.results, ...newResults],
              loading: false,
              hasMore: results.length === limit,
              page: currentPage + 1,
              searchQuery: query
            }
          }
        })

        retryCountRef.current = 0
      } catch (error) {
        if (abortControllerRef.current?.signal.aborted) return

        const errorMessage = error instanceof Error ? error.message : 'Search failed'
        
        // Retry logic for failed searches
        if (retryCountRef.current < MAX_RETRIES && errorMessage !== 'Search timeout') {
          retryCountRef.current++
          setTimeout(() => performSearch(query, isNewSearch), 1000 * retryCountRef.current)
          return
        }

        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage
        }))
        
        console.error('Search error:', error)
      } finally {
        loadingRef.current = false
      }
    },
    [profile?.id, state.page]
  )

  // Optimized follow handler with optimistic updates
  const handleFollow = useCallback(
    async (targetUser: OptimizedBusinessUser) => {
      if (!profile || targetUser.isProcessing) return

      const isCurrentlyFollowing = targetUser.optimisticFollowing ?? targetUser.is_following
      const optimisticState = !isCurrentlyFollowing

      // Optimistic update
      setState(prev => ({
        ...prev,
        results: prev.results.map(user =>
          user.id === targetUser.id
            ? {
                ...user,
                isProcessing: true,
                optimisticFollowing: optimisticState,
                followers_count: optimisticState 
                  ? user.followers_count + 1 
                  : Math.max(0, user.followers_count - 1)
              }
            : user
        )
      }))

      try {
        const success = isCurrentlyFollowing
          ? await unfollowUser(profile.id, targetUser.id)
          : await followUser(profile.id, targetUser.id)

        if (!success) {
          throw new Error('Follow operation failed')
        }

        // Update with actual result
        setState(prev => ({
          ...prev,
          results: prev.results.map(user =>
            user.id === targetUser.id
              ? {
                  ...user,
                  isProcessing: false,
                  is_following: optimisticState,
                  optimisticFollowing: undefined
                }
              : user
          )
        }))
      } catch (error) {
        // Rollback optimistic update
        setState(prev => ({
          ...prev,
          results: prev.results.map(user =>
            user.id === targetUser.id
              ? {
                  ...user,
                  isProcessing: false,
                  optimisticFollowing: undefined,
                  followers_count: targetUser.followers_count
                }
              : user
          )
        }))

        console.error('Follow error:', error)
      }
    },
    [profile]
  )

  // Load more results for infinite scroll
  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore && state.results.length > 0) {
      performSearch(state.searchQuery, false)
    }
  }, [state.loading, state.hasMore, state.results.length, state.searchQuery, performSearch])

  // Search input handler
  const handleSearchInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setState(prev => ({ ...prev, searchQuery: query }))
    debouncedSearch(query)
  }, [debouncedSearch])

  // Initial load
  useEffect(() => {
    performSearch('')
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Memoized user cards for performance
  const UserCard = useMemo(() => {
    return ({ user }: { user: OptimizedBusinessUser }) => {
      const isFollowing = user.optimisticFollowing ?? user.is_following
      const showProcessing = user.isProcessing

      return (
        <Card key={user.id} className="hover:shadow-md transition-shadow">
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
                      onClick={() => handleFollow(user)}
                      disabled={showProcessing || !profile}
                      className={`min-w-[90px] ${
                        isFollowing 
                          ? "hover:bg-red-50 hover:text-red-600 hover:border-red-300" 
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {showProcessing ? (
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
  }, [profile, handleFollow])

  if (!profile) {
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
          value={state.searchQuery}
          onChange={handleSearchInput}
          className="pl-10 pr-4 py-3 text-base"
        />
        {state.loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
        )}
      </div>

      {/* Search Results */}
      {state.searchQuery.trim() && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({state.results.length})
            </h3>
          </div>
          
          {state.results.length === 0 && !state.loading ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No business users found for "{state.searchQuery}"</p>
              <p className="text-sm">Try searching with different keywords</p>
            </div>
          ) : (
            <div className="space-y-4">
              {state.results.map(user => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Load More Button */}
      {state.hasMore && state.results.length > 0 && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={state.loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {state.loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}

      {/* Error Message */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Search Error</p>
            <p className="text-red-600 text-sm">{state.error}</p>
          </div>
          <button
            onClick={() => performSearch(state.searchQuery, true)}
            className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}

export default BusinessSearch 