/**
 * Advanced Multi-Level Cache Manager for Production
 * Provides intelligent caching with TTL, invalidation, and fallback handling
 */

// Advanced Cache Manager for High Concurrency (1000+ users)
interface CacheEntry<T> {
  value: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
}

class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private maxSize: number
  private cleanupInterval: NodeJS.Timeout
  private hitCount = 0
  private missCount = 0

  constructor(maxSize: number = 1000, cleanupIntervalMs: number = 60000) {
    this.maxSize = maxSize
    
    // Auto-cleanup expired entries
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, cleanupIntervalMs)
  }

  get<K>(key: string, factory?: () => Promise<T>, ttl: number = 5 * 60 * 1000): T | Promise<T> | undefined {
    const entry = this.cache.get(key)
    const now = Date.now()

    // Check if entry exists and is not expired
    if (entry && (now - entry.timestamp) < entry.ttl) {
      entry.lastAccessed = now
      entry.accessCount++
      this.hitCount++
      
      // Move to end (most recently used)
      this.cache.delete(key)
      this.cache.set(key, entry)
      
      return entry.value
    }

    this.missCount++

    // Remove expired entry
    if (entry) {
      this.cache.delete(key)
    }

    // Use factory if provided
    if (factory) {
      const promise = factory().then(value => {
        this.set(key, value, ttl)
        return value
      }).catch(error => {
        // Don't cache errors
        throw error
      })
      
      return promise
    }

    return undefined
  }

  set(key: string, value: T, ttl: number = 5 * 60 * 1000): void {
    const now = Date.now()
    
    // Enforce max size with LRU eviction
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: now,
      ttl,
      accessCount: 1,
      lastAccessed: now
    }

    this.cache.set(key, entry)
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.hitCount = 0
    this.missCount = 0
  }

  private cleanup(): void {
    const now = Date.now()
    let deletedCount = 0

    for (const [key, entry] of this.cache.entries()) {
      if ((now - entry.timestamp) >= entry.ttl) {
        this.cache.delete(key)
        deletedCount++
      }
    }

    // Log cleanup stats in development
    if (process.env.NODE_ENV === 'development' && deletedCount > 0) {
      console.log(`Cache cleanup: ${deletedCount} expired entries removed`)
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0,
      hits: this.hitCount,
      misses: this.missCount
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.clear()
  }
}

// Cache instances for different data types
export const searchCache = new LRUCache<any[]>(500, 30000) // Search results
export const userCache = new LRUCache<any>(2000, 60000) // User data and follow status
export const businessCache = new LRUCache<any>(1000, 120000) // Business data

// Cache key generators
export const CacheKeys = {
  searchResults: (query: string, userId?: string) => 
    `search:${query.toLowerCase().trim()}:${userId || 'anon'}`,
  
  followStatus: (followerId: string, targetId: string) => 
    `follow:${followerId}:${targetId}`,
  
  userStats: (userId: string) => 
    `stats:${userId}`,
  
  userFollowers: (userId: string, limit: number, offset: number) => 
    `followers:${userId}:${limit}:${offset}`,
  
  userFollowing: (userId: string, limit: number, offset: number) => 
    `following:${userId}:${limit}:${offset}`,
  
  trending: (userId?: string, limit: number = 10) => 
    `trending:${userId || 'anon'}:${limit}`,
  
  businessProfile: (businessId: string) => 
    `business:${businessId}`
}

// Cache invalidation strategies
export const CacheInvalidation = {
  followAction: (followerId: string, targetId: string) => {
    // Invalidate specific follow status
    userCache.delete(CacheKeys.followStatus(followerId, targetId))
    
    // Invalidate user stats
    userCache.delete(CacheKeys.userStats(followerId))
    userCache.delete(CacheKeys.userStats(targetId))
    
    // Invalidate follower/following lists (all pages)
    for (let offset = 0; offset < 1000; offset += 20) {
      userCache.delete(CacheKeys.userFollowers(targetId, 20, offset))
      userCache.delete(CacheKeys.userFollowing(followerId, 20, offset))
    }
    
    // Invalidate search results that might include these users
    searchCache.clear()
    
    // Invalidate trending
    for (let limit = 5; limit <= 50; limit += 5) {
      userCache.delete(CacheKeys.trending(followerId, limit))
      userCache.delete(CacheKeys.trending(undefined, limit))
    }
  },
  
  userUpdate: (userId: string) => {
    // Invalidate user-specific data
    userCache.delete(CacheKeys.userStats(userId))
    userCache.delete(CacheKeys.businessProfile(userId))
    
    // Clear search cache as user data changed
    searchCache.clear()
  },
  
  searchUpdate: () => {
    searchCache.clear()
  },
  
  clearAll: () => {
    searchCache.clear()
    userCache.clear()
    businessCache.clear()
  }
}

// Performance monitoring
export const CacheMetrics = {
  getOverallStats: () => ({
    search: searchCache.getStats(),
    user: userCache.getStats(),
    business: businessCache.getStats()
  }),
  
  logStats: () => {
    const stats = CacheMetrics.getOverallStats()
    console.log('Cache Performance:', {
      search: `${Math.round(stats.search.hitRate * 100)}% hit rate (${stats.search.size} entries)`,
      user: `${Math.round(stats.user.hitRate * 100)}% hit rate (${stats.user.size} entries)`,
      business: `${Math.round(stats.business.hitRate * 100)}% hit rate (${stats.business.size} entries)`
    })
  }
}

// Cleanup on app shutdown
if (typeof window === 'undefined') {
  process.on('SIGTERM', () => {
    searchCache.destroy()
    userCache.destroy()
    businessCache.destroy()
  })
} 