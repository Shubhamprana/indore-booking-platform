import { supabase } from './supabase'
import { 
  searchCache, 
  userCache, 
  CacheKeys, 
  CacheInvalidation
} from './cache-manager'
import { 
  withErrorHandling,
  withRetry,
  ErrorCategory 
} from './error-handler'

// Performance optimizations for high concurrency
const BATCH_SIZE = 50
const MAX_SEARCH_RESULTS = 100
const CACHE_TTL_SHORT = 30 * 1000 // 30 seconds
const CACHE_TTL_MEDIUM = 5 * 60 * 1000 // 5 minutes
const CACHE_TTL_LONG = 30 * 60 * 1000 // 30 minutes

export interface BusinessUser {
  id: string
  full_name: string
  business_name?: string
  business_category?: string
  business_description?: string
  location?: string
  profile_image_url?: string
  followers_count: number
  following_count: number
  is_following: boolean
  created_at: string
}

export interface FollowUser {
  id: string
  full_name: string
  business_name?: string
  user_type: 'customer' | 'business'
  profile_image_url?: string
  followers_count: number
  following_count: number
  is_following: boolean
  followed_at: string
}

export interface FollowStats {
  followers_count: number
  following_count: number
}

// Batch follow operations for better performance
interface FollowOperation {
  followerUserId: string
  targetUserId: string
  action: 'follow' | 'unfollow'
}

let followQueue: FollowOperation[] = []
let processingQueue = false

/**
 * Optimized search for business users - designed for high concurrency
 */
export async function searchBusinessUsers(
  searchQuery: string = '',
  currentUserId?: string,
  limit: number = 20,
  offset: number = 0
): Promise<BusinessUser[]> {
  // Limit to prevent abuse
  limit = Math.min(limit, MAX_SEARCH_RESULTS)
  
  const cacheKey = CacheKeys.searchResults(searchQuery, currentUserId)
  const cacheTimeout = searchQuery.trim() ? CACHE_TTL_SHORT : CACHE_TTL_MEDIUM
  
  return withErrorHandling(async () => {
    return await searchCache.get(cacheKey, async () => {
      try {
        // Optimized query with proper indexing hints
        let query = supabase
          .from('users')
          .select(`
            id,
            full_name,
            business_name,
            business_category,
            business_description,
            location,
            profile_image_url,
            followers_count,
            following_count,
            created_at
          `, { count: 'exact' })
          .eq('user_type', 'business')
          .order('followers_count', { ascending: false }) // Most popular first
          .range(offset, offset + limit - 1)

        // Optimized search with proper text search
        if (searchQuery.trim()) {
          const cleanQuery = searchQuery.trim().toLowerCase()
          query = query.or(
            `full_name.ilike.%${cleanQuery}%,business_name.ilike.%${cleanQuery}%,business_category.ilike.%${cleanQuery}%,location.ilike.%${cleanQuery}%`
          )
        }

        const { data, error, count } = await query

        if (error) {
          throw new Error(`Search failed: ${error.message}`)
        }

        const users = data || []
        
        // Batch follow status check for performance
        if (currentUserId && users.length > 0) {
          const followStatuses = await batchCheckFollowStatus(
            currentUserId, 
            users.map(u => u.id)
          )

          return users.map(user => ({
            ...user,
            is_following: followStatuses.has(user.id),
            followers_count: user.followers_count || 0,
            following_count: user.following_count || 0
          })) as BusinessUser[]
        }

        return users.map(user => ({
          ...user,
          is_following: false,
          followers_count: user.followers_count || 0,
          following_count: user.following_count || 0
        })) as BusinessUser[]
      } catch (error) {
        console.error('Search error:', error)
        throw error
      }
    }, cacheTimeout)
  }, {
    action: 'search_business_users',
    userId: currentUserId,
    metadata: { searchQuery, limit, offset }
  }, []) || []
}

/**
 * Batch check follow status for multiple users - much more efficient
 */
async function batchCheckFollowStatus(
  followerUserId: string, 
  targetUserIds: string[]
): Promise<Set<string>> {
  try {
    if (targetUserIds.length === 0) return new Set()

    // Use single query to check all follow statuses
    const { data, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', followerUserId)
      .in('following_id', targetUserIds)

    if (error) {
      console.error('Batch follow check error:', error)
      return new Set()
    }

    return new Set(data?.map(f => f.following_id) || [])
  } catch (error) {
    console.error('Batch follow status error:', error)
    return new Set()
  }
}

/**
 * High-performance follow user with queuing
 */
export async function followUser(
  followerUserId: string,
  targetUserId: string
): Promise<boolean> {
  // Add to queue for batch processing
  await queueFollowOperation({
    followerUserId,
    targetUserId,
    action: 'follow'
  })

  return withRetry(async () => {
    // Validate inputs
    if (!followerUserId || !targetUserId) {
      throw new Error('Invalid user IDs provided')
    }
    
    if (followerUserId === targetUserId) {
      throw new Error('Cannot follow yourself')
    }

    try {
      // Use upsert for better performance and conflict handling
      const { error: upsertError } = await supabase
        .from('follows')
        .upsert({
          follower_id: followerUserId,
          following_id: targetUserId,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'follower_id,following_id',
          ignoreDuplicates: true
        })

      if (upsertError) {
        throw new Error(`Follow operation failed: ${upsertError.message}`)
      }

      // Async count updates (non-blocking)
      updateFollowCounts(targetUserId, followerUserId, 'follow').catch(console.warn)

      // Update cache optimistically
      const followCacheKey = CacheKeys.followStatus(followerUserId, targetUserId)
      userCache.set(followCacheKey, true, CACHE_TTL_SHORT)
      
      // Async cache invalidation
      setTimeout(() => {
        CacheInvalidation.followAction(followerUserId, targetUserId)
      }, 100)

      return true
    } catch (error) {
      console.error('Follow operation error:', error)
      throw error
    }
  }, {
    maxRetries: 2,
    baseDelay: 500, // Faster retries for better UX
    context: {
      action: 'follow_user',
      userId: followerUserId,
      metadata: { targetUserId }
    }
  })
}

/**
 * High-performance unfollow user with queuing
 */
export async function unfollowUser(
  followerUserId: string,
  targetUserId: string
): Promise<boolean> {
  // Add to queue for batch processing
  await queueFollowOperation({
    followerUserId,
    targetUserId,
    action: 'unfollow'
  })

  return withRetry(async () => {
    // Validate inputs
    if (!followerUserId || !targetUserId) {
      throw new Error('Invalid user IDs provided')
    }
    
    if (followerUserId === targetUserId) {
      throw new Error('Cannot unfollow yourself')
    }

    try {
      // Optimized delete operation
      const { error: deleteError } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerUserId)
        .eq('following_id', targetUserId)

      if (deleteError) {
        throw new Error(`Unfollow operation failed: ${deleteError.message}`)
      }

      // Async count updates (non-blocking)
      updateFollowCounts(targetUserId, followerUserId, 'unfollow').catch(console.warn)

      // Update cache optimistically
      const followCacheKey = CacheKeys.followStatus(followerUserId, targetUserId)
      userCache.set(followCacheKey, false, CACHE_TTL_SHORT)
      
      // Async cache invalidation
      setTimeout(() => {
        CacheInvalidation.followAction(followerUserId, targetUserId)
      }, 100)

      return true
    } catch (error) {
      console.error('Unfollow operation error:', error)
      throw error
    }
  }, {
    maxRetries: 2,
    baseDelay: 500,
    context: {
      action: 'unfollow_user',
      userId: followerUserId,
      metadata: { targetUserId }
    }
  })
}

/**
 * Queue follow operations for batch processing
 */
async function queueFollowOperation(operation: FollowOperation): Promise<void> {
  followQueue.push(operation)
  
  // Process queue when it reaches batch size or after a timeout
  if (followQueue.length >= BATCH_SIZE || !processingQueue) {
    processFollowQueue()
  }
}

/**
 * Process follow operations in batches for better performance
 */
async function processFollowQueue(): Promise<void> {
  if (processingQueue || followQueue.length === 0) return
  
  processingQueue = true
  const batch = followQueue.splice(0, BATCH_SIZE)
  
  try {
    // Group operations by type
    const follows = batch.filter(op => op.action === 'follow')
    const unfollows = batch.filter(op => op.action === 'unfollow')
    
    // Batch process follows
    if (follows.length > 0) {
      const followInserts = follows.map(op => ({
        follower_id: op.followerUserId,
        following_id: op.targetUserId,
        created_at: new Date().toISOString()
      }))
      
      await supabase
        .from('follows')
        .upsert(followInserts, {
          onConflict: 'follower_id,following_id',
          ignoreDuplicates: true
        })
    }
    
    // Batch process unfollows
    if (unfollows.length > 0) {
      for (const op of unfollows) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', op.followerUserId)
          .eq('following_id', op.targetUserId)
      }
    }
    
  } catch (error) {
    console.error('Batch follow processing error:', error)
  } finally {
    processingQueue = false
    
    // Process remaining queue if any
    if (followQueue.length > 0) {
      setTimeout(processFollowQueue, 100)
    }
  }
}

/**
 * Async follow count updates for better performance
 */
async function updateFollowCounts(
  targetUserId: string, 
  followerUserId: string, 
  action: 'follow' | 'unfollow'
): Promise<void> {
  try {
    const increment = action === 'follow' ? 1 : -1
    
    // Update both counts in parallel using RPC for atomic operations
    await Promise.allSettled([
      supabase.rpc('update_followers_count', { 
        user_id: targetUserId, 
        increment: increment 
      }),
      supabase.rpc('update_following_count', { 
        user_id: followerUserId, 
        increment: increment 
      })
    ])
  } catch (error) {
    console.warn('Count update failed (non-critical):', error)
  }
}

/**
 * Optimized follow status check with caching
 */
export async function isFollowing(
  followerUserId: string,
  targetUserId: string
): Promise<boolean> {
  const cacheKey = CacheKeys.followStatus(followerUserId, targetUserId)
  
  return withErrorHandling(async () => {
    return await userCache.get(cacheKey, async () => {
      try {
        const { data, error } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', followerUserId)
          .eq('following_id', targetUserId)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw new Error(`Follow check failed: ${error.message}`)
        }

        return !!data
      } catch (error) {
        console.error('Follow status check error:', error)
        return false
      }
    }, CACHE_TTL_SHORT)
  }, {
    action: 'check_follow_status',
    userId: followerUserId,
    metadata: { targetUserId }
  }, false) || false
}

/**
 * Optimized get user's followers with pagination and caching
 */
export async function getFollowers(
  targetUserId: string,
  currentUserId?: string,
  limit: number = 20,
  offset: number = 0
): Promise<FollowUser[]> {
  const cacheKey = `followers_${targetUserId}_${currentUserId}_${limit}_${offset}`
  
  return withErrorHandling(async () => {
    return await userCache.get(cacheKey, async () => {
      try {
        // Optimized query with joins for better performance
        const { data, error } = await supabase
          .from('follows')
          .select(`
            follower_id,
            created_at,
            follower:users!follower_id (
              id,
              full_name,
              business_name,
              user_type,
              profile_image_url,
              followers_count,
              following_count
            )
          `)
          .eq('following_id', targetUserId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) {
          throw new Error(`Failed to get followers: ${error.message}`)
        }

        const followers = data || []
        
        // Get follow status for current user if provided
        let followStatuses = new Set<string>()
        if (currentUserId && followers.length > 0) {
          const followerIds = followers.map(f => f.follower_id)
          followStatuses = await batchCheckFollowStatus(currentUserId, followerIds)
        }

        return followers.map(follow => ({
          id: follow.follower_id,
          full_name: (follow.follower as any)?.full_name || '',
          business_name: (follow.follower as any)?.business_name,
          user_type: (follow.follower as any)?.user_type || 'customer',
          profile_image_url: (follow.follower as any)?.profile_image_url,
          followers_count: (follow.follower as any)?.followers_count || 0,
          following_count: (follow.follower as any)?.following_count || 0,
          is_following: followStatuses.has(follow.follower_id),
          followed_at: follow.created_at
        })) as FollowUser[]
      } catch (error) {
        console.error('Error getting followers:', error)
        throw error
      }
    }, CACHE_TTL_MEDIUM)
  }, {
    action: 'get_user_followers',
    userId: currentUserId,
    metadata: { targetUserId, limit, offset }
  }, []) || []
}

/**
 * Optimized get user's following with pagination and caching
 */
export async function getUserFollowing(
  targetUserId: string,
  currentUserId?: string,
  limit: number = 20,
  offset: number = 0
): Promise<FollowUser[]> {
  const cacheKey = `following_${targetUserId}_${currentUserId}_${limit}_${offset}`
  
  return withErrorHandling(async () => {
    return await userCache.get(cacheKey, async () => {
      try {
        // Optimized query with joins for better performance
        const { data, error } = await supabase
          .from('follows')
          .select(`
            following_id,
            created_at,
            following:users!following_id (
              id,
              full_name,
              business_name,
              user_type,
              profile_image_url,
              followers_count,
              following_count
            )
          `)
          .eq('follower_id', targetUserId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) {
          throw new Error(`Failed to get following: ${error.message}`)
        }

        const following = data || []
        
        // Get follow status for current user if provided
        let followStatuses = new Set<string>()
        if (currentUserId && following.length > 0) {
          const followingIds = following.map(f => f.following_id)
          followStatuses = await batchCheckFollowStatus(currentUserId, followingIds)
        }

        return following.map(follow => ({
          id: follow.following_id,
          full_name: (follow.following as any)?.full_name || '',
          business_name: (follow.following as any)?.business_name,
          user_type: (follow.following as any)?.user_type || 'customer',
          profile_image_url: (follow.following as any)?.profile_image_url,
          followers_count: (follow.following as any)?.followers_count || 0,
          following_count: (follow.following as any)?.following_count || 0,
          is_following: followStatuses.has(follow.following_id),
          followed_at: follow.created_at
        })) as FollowUser[]
      } catch (error) {
        console.error('Error getting following:', error)
        throw error
      }
    }, CACHE_TTL_MEDIUM)
  }, {
    action: 'get_user_following',
    userId: currentUserId,
    metadata: { targetUserId, limit, offset }
  }, []) || []
}

/**
 * High-performance follow stats with caching
 */
export async function getUserFollowStats(userId: string): Promise<FollowStats> {
  const cacheKey = `stats_${userId}`
  
  return withErrorHandling(async () => {
    return await userCache.get(cacheKey, async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('followers_count, following_count')
          .eq('id', userId)
          .single()

        if (error) {
          throw new Error(`Failed to get user stats: ${error.message}`)
        }

        return {
          followers_count: data?.followers_count || 0,
          following_count: data?.following_count || 0
        }
      } catch (error) {
        console.error('Error getting follow stats:', error)
        return { followers_count: 0, following_count: 0 }
      }
    }, CACHE_TTL_MEDIUM)
  }, {
    action: 'get_user_follow_stats',
    userId: userId
  }, { followers_count: 0, following_count: 0 }) || { followers_count: 0, following_count: 0 }
}

/**
 * Get trending business users with aggressive caching
 */
export async function getTrendingBusinessUsers(
  currentUserId?: string,
  limit: number = 10
): Promise<BusinessUser[]> {
  const cacheKey = `trending_${currentUserId}_${limit}`
  
  return withErrorHandling(async () => {
    return await userCache.get(cacheKey, async () => {
      return await searchBusinessUsers('', currentUserId, limit, 0)
    }, CACHE_TTL_LONG) // Cache trending for 30 minutes
  }, {
    action: 'get_trending_business_users',
    userId: currentUserId,
    metadata: { limit }
  }, []) || []
}

/**
 * Clear caches
 */
export function clearFollowCaches(): void {
  CacheInvalidation.clearAll()
}

/**
 * High-performance toggle follow with optimistic updates
 */
export async function toggleFollow(
  currentUserId: string,
  targetUserId: string
): Promise<{ isFollowing: boolean; success: boolean }> {
  try {
    // Get current status from cache first for instant feedback
    let currentlyFollowing = false
    const cacheKey = CacheKeys.followStatus(currentUserId, targetUserId)
    const cachedStatus = userCache.get(cacheKey)
    
    if (cachedStatus !== undefined) {
      currentlyFollowing = cachedStatus
    } else {
      currentlyFollowing = await isFollowing(currentUserId, targetUserId)
    }
    
    // Optimistic update
    const newStatus = !currentlyFollowing
    userCache.set(cacheKey, newStatus, CACHE_TTL_SHORT)
    
    let success: boolean
    if (currentlyFollowing) {
      success = await unfollowUser(currentUserId, targetUserId)
    } else {
      success = await followUser(currentUserId, targetUserId)
    }

    // Rollback optimistic update if failed
    if (!success) {
      userCache.set(cacheKey, currentlyFollowing, CACHE_TTL_SHORT)
    }

    return {
      isFollowing: success ? newStatus : currentlyFollowing,
      success
    }
  } catch (error) {
    console.error('Error in toggleFollow:', error)
    return {
      isFollowing: false,
      success: false
    }
  }
} 