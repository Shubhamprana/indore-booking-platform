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

/**
 * Search for business users with optional query filter
 */
export async function searchBusinessUsers(
  searchQuery: string = '',
  currentUserId?: string,
  limit: number = 20,
  offset: number = 0
): Promise<BusinessUser[]> {
  const cacheKey = CacheKeys.searchResults(searchQuery, currentUserId)
  
  return withErrorHandling(async () => {
    return await searchCache.get(cacheKey, async () => {
      const { data, error } = await supabase.rpc('search_business_users', {
        search_query: searchQuery,
        current_user_id: currentUserId || null,
        limit_count: limit,
        offset_count: offset
      })

      if (error) {
        throw new Error(`Failed to search business users: ${error.message}`)
      }

      return data || []
    })
  }, {
    action: 'search_business_users',
    userId: currentUserId,
    metadata: { searchQuery, limit, offset }
  }, []) || []
}

/**
 * Follow a user
 */
export async function followUser(
  followerUserId: string,
  targetUserId: string
): Promise<boolean> {
  return withRetry(async () => {
    const { data, error } = await supabase.rpc('follow_user', {
      follower_user_id: followerUserId,
      target_user_id: targetUserId
    })

    if (error) {
      // Check if it's a constraint violation (duplicate follow)
      if (error.message?.includes('duplicate') || error.code === '23505') {
        // User is already following, treat as success
        return true
      }
      throw new Error(`Failed to follow user: ${error.message}`)
    }

    const result = data || false

    // Update cache and invalidate related caches
    if (result) {
      const followCacheKey = CacheKeys.followStatus(followerUserId, targetUserId)
      userCache.set(followCacheKey, true)
      
      // Invalidate related caches
      CacheInvalidation.followAction(followerUserId, targetUserId)
    }

    return result
  }, {
    maxRetries: 2,
    context: {
      action: 'follow_user',
      userId: followerUserId,
      metadata: { targetUserId }
    }
  })
}

/**
 * Unfollow a user
 */
export async function unfollowUser(
  followerUserId: string,
  targetUserId: string
): Promise<boolean> {
  return withRetry(async () => {
    const { data, error } = await supabase.rpc('unfollow_user', {
      follower_user_id: followerUserId,
      target_user_id: targetUserId
    })

    if (error) {
      throw new Error(`Failed to unfollow user: ${error.message}`)
    }

    const result = data || false

    // Update cache and invalidate related caches
    if (result) {
      const followCacheKey = CacheKeys.followStatus(followerUserId, targetUserId)
      userCache.set(followCacheKey, false)
      
      // Invalidate related caches
      CacheInvalidation.followAction(followerUserId, targetUserId)
    }

    return result
  }, {
    maxRetries: 2,
    context: {
      action: 'unfollow_user',
      userId: followerUserId,
      metadata: { targetUserId }
    }
  })
}

/**
 * Check if a user is following another user
 */
export async function isFollowing(
  followerUserId: string,
  targetUserId: string
): Promise<boolean> {
  const cacheKey = CacheKeys.followStatus(followerUserId, targetUserId)
  
  return withErrorHandling(async () => {
    return await userCache.get(cacheKey, async () => {
      const { data, error } = await supabase.rpc('is_following', {
        follower_user_id: followerUserId,
        target_user_id: targetUserId
      })

      if (error) {
        throw new Error(`Failed to check follow status: ${error.message}`)
      }

      return data || false
    })
  }, {
    action: 'check_follow_status',
    userId: followerUserId,
    metadata: { targetUserId }
  }, false) || false
}

/**
 * Get user's followers
 */
export async function getUserFollowers(
  targetUserId: string,
  currentUserId?: string,
  limit: number = 20,
  offset: number = 0
): Promise<FollowUser[]> {
  try {
    const { data, error } = await supabase.rpc('get_user_followers', {
      target_user_id: targetUserId,
      current_user_id: currentUserId || null,
      limit_count: limit,
      offset_count: offset
    })

    if (error) {
      console.error('Error getting user followers:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getUserFollowers:', error)
    throw error
  }
}

/**
 * Get user's following
 */
export async function getUserFollowing(
  targetUserId: string,
  currentUserId?: string,
  limit: number = 20,
  offset: number = 0
): Promise<FollowUser[]> {
  try {
    const { data, error } = await supabase.rpc('get_user_following', {
      target_user_id: targetUserId,
      current_user_id: currentUserId || null,
      limit_count: limit,
      offset_count: offset
    })

    if (error) {
      console.error('Error getting user following:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getUserFollowing:', error)
    throw error
  }
}

/**
 * Get user's follow stats (followers and following count)
 */
export async function getUserFollowStats(userId: string): Promise<FollowStats> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('followers_count, following_count')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error getting user follow stats:', error)
      throw error
    }

    return {
      followers_count: data?.followers_count || 0,
      following_count: data?.following_count || 0
    }
  } catch (error) {
    console.error('Error in getUserFollowStats:', error)
    return { followers_count: 0, following_count: 0 }
  }
}

/**
 * Get trending business users (most followed)
 */
export async function getTrendingBusinessUsers(
  currentUserId?: string,
  limit: number = 10
): Promise<BusinessUser[]> {
  try {
    return await searchBusinessUsers('', currentUserId, limit, 0)
  } catch (error) {
    console.error('Error in getTrendingBusinessUsers:', error)
    throw error
  }
}

/**
 * Clear caches
 */
export function clearFollowCaches(): void {
  CacheInvalidation.clearAll()
}

/**
 * Toggle follow status for a user
 */
export async function toggleFollow(
  currentUserId: string,
  targetUserId: string
): Promise<{ isFollowing: boolean; success: boolean }> {
  try {
    const currentlyFollowing = await isFollowing(currentUserId, targetUserId)
    
    let success: boolean
    if (currentlyFollowing) {
      success = await unfollowUser(currentUserId, targetUserId)
    } else {
      success = await followUser(currentUserId, targetUserId)
    }

    return {
      isFollowing: !currentlyFollowing,
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