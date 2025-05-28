/**
 * Advanced Multi-Level Cache Manager for Production
 * Provides intelligent caching with TTL, invalidation, and fallback handling
 */

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
  version?: string
}

interface CacheConfig {
  defaultTTL: number
  maxSize: number
  enablePersistence: boolean
  enableCompression: boolean
}

class CacheManager {
  private memoryCache = new Map<string, CacheItem<any>>()
  private config: CacheConfig
  private metrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0
  }

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 300000, // 5 minutes
      maxSize: 1000,
      enablePersistence: true,
      enableCompression: false,
      ...config
    }

    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 300000)
    
    // Load from persistence on startup
    if (this.config.enablePersistence && typeof window !== 'undefined') {
      this.loadFromStorage()
    }
  }

  /**
   * Get data from cache with fallback to provided function
   */
  async get<T>(
    key: string,
    fallback?: () => Promise<T>,
    ttl: number = this.config.defaultTTL
  ): Promise<T | null> {
    // Check memory cache first
    const cached = this.memoryCache.get(key)
    
    if (cached && this.isValid(cached)) {
      this.metrics.hits++
      return cached.data as T
    }

    // Check browser storage for persistence
    if (this.config.enablePersistence && typeof window !== 'undefined') {
      const persistent = this.getFromStorage(key)
      if (persistent && this.isValid(persistent)) {
        // Restore to memory cache
        this.memoryCache.set(key, persistent)
        this.metrics.hits++
        return persistent.data as T
      }
    }

    this.metrics.misses++

    // Use fallback if provided
    if (fallback) {
      try {
        const data = await fallback()
        this.set(key, data, ttl)
        return data
      } catch (error) {
        console.error(`Cache fallback failed for key ${key}:`, error)
        return null
      }
    }

    return null
  }

  /**
   * Set data in cache with automatic cleanup
   */
  set<T>(key: string, data: T, ttl: number = this.config.defaultTTL, version?: string): void {
    // Enforce cache size limit
    if (this.memoryCache.size >= this.config.maxSize) {
      this.evictOldest()
    }

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version
    }

    this.memoryCache.set(key, item)
    this.metrics.sets++

    // Persist to browser storage if enabled
    if (this.config.enablePersistence && typeof window !== 'undefined') {
      this.saveToStorage(key, item)
    }
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): boolean {
    const deleted = this.memoryCache.delete(key)
    
    if (deleted) {
      this.metrics.deletes++
    }

    // Remove from browser storage
    if (this.config.enablePersistence && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`cache_${key}`)
      } catch (error) {
        // Silent fail for storage errors
      }
    }

    return deleted
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.memoryCache.clear()
    
    if (this.config.enablePersistence && typeof window !== 'undefined') {
      try {
        Object.keys(localStorage)
          .filter(key => key.startsWith('cache_'))
          .forEach(key => localStorage.removeItem(key))
      } catch (error) {
        // Silent fail for storage errors
      }
    }
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern)
    let count = 0

    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.delete(key)
        count++
      }
    }

    return count
  }

  /**
   * Invalidate cache entries by version
   */
  invalidateByVersion(version: string): number {
    let count = 0

    for (const [key, item] of this.memoryCache.entries()) {
      if (item.version && item.version !== version) {
        this.delete(key)
        count++
      }
    }

    return count
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.metrics.hits / (this.metrics.hits + this.metrics.misses) || 0
    
    return {
      ...this.metrics,
      hitRate: Math.round(hitRate * 100),
      size: this.memoryCache.size,
      maxSize: this.config.maxSize
    }
  }

  /**
   * Preload cache with data
   */
  async preload<T>(entries: Array<{ key: string; loader: () => Promise<T>; ttl?: number }>): Promise<void> {
    const promises = entries.map(async ({ key, loader, ttl }) => {
      try {
        const data = await loader()
        this.set(key, data, ttl)
      } catch (error) {
        console.error(`Failed to preload cache key ${key}:`, error)
      }
    })

    await Promise.allSettled(promises)
  }

  /**
   * Background refresh for cache entries
   */
  async backgroundRefresh<T>(
    key: string,
    loader: () => Promise<T>,
    refreshThreshold: number = 0.8
  ): Promise<T | null> {
    const cached = this.memoryCache.get(key)
    
    if (!cached) {
      return this.get(key, loader)
    }

    const age = Date.now() - cached.timestamp
    const shouldRefresh = age > (cached.ttl * refreshThreshold)

    if (shouldRefresh) {
      // Refresh in background, return cached data immediately
      loader().then(data => {
        this.set(key, data, cached.ttl)
      }).catch(error => {
        console.error(`Background refresh failed for key ${key}:`, error)
      })
    }

    return this.isValid(cached) ? cached.data : null
  }

  private isValid(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp < item.ttl
  }

  private evictOldest(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, item] of this.memoryCache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey)
      this.metrics.evictions++
    }
  }

  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, item] of this.memoryCache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.delete(key))
  }

  private saveToStorage<T>(key: string, item: CacheItem<T>): void {
    try {
      const data = this.config.enableCompression 
        ? this.compress(JSON.stringify(item))
        : JSON.stringify(item)
      
      localStorage.setItem(`cache_${key}`, data)
    } catch (error) {
      // Silent fail for storage errors (quota exceeded, etc.)
    }
  }

  private getFromStorage(key: string): CacheItem<any> | null {
    try {
      const data = localStorage.getItem(`cache_${key}`)
      if (!data) return null

      const item = JSON.parse(
        this.config.enableCompression ? this.decompress(data) : data
      )

      return item
    } catch (error) {
      return null
    }
  }

  private loadFromStorage(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith('cache_'))
        .forEach(storageKey => {
          const cacheKey = storageKey.replace('cache_', '')
          const item = this.getFromStorage(cacheKey)
          
          if (item && this.isValid(item)) {
            this.memoryCache.set(cacheKey, item)
          } else if (item) {
            // Remove expired items from storage
            localStorage.removeItem(storageKey)
          }
        })
    } catch (error) {
      // Silent fail for storage errors
    }
  }

  private compress(data: string): string {
    // Simple compression placeholder
    // In production, use a proper compression library
    return data
  }

  private decompress(data: string): string {
    // Simple decompression placeholder
    // In production, use a proper compression library
    return data
  }
}

// Global cache instances for different data types
export const userCache = new CacheManager({
  defaultTTL: 300000, // 5 minutes
  maxSize: 500,
  enablePersistence: true
})

export const businessCache = new CacheManager({
  defaultTTL: 600000, // 10 minutes
  maxSize: 300,
  enablePersistence: true
})

export const searchCache = new CacheManager({
  defaultTTL: 180000, // 3 minutes
  maxSize: 200,
  enablePersistence: false // Search results don't need persistence
})

export const statsCache = new CacheManager({
  defaultTTL: 900000, // 15 minutes
  maxSize: 100,
  enablePersistence: true
})

// Cache key generators
export const CacheKeys = {
  user: (id: string) => `user:${id}`,
  userProfile: (id: string) => `user:profile:${id}`,
  userStats: (id: string) => `user:stats:${id}`,
  userFollowing: (id: string) => `user:following:${id}`,
  userFollowers: (id: string) => `user:followers:${id}`,
  businessDashboard: (id: string) => `business:dashboard:${id}`,
  businessSubscription: (id: string) => `business:subscription:${id}`,
  searchResults: (query: string, userId?: string) => `search:${query}:${userId || 'anon'}`,
  followStatus: (followerId: string, targetId: string) => `follow:${followerId}:${targetId}`,
  trendingBusinesses: () => 'trending:businesses'
}

// Cache invalidation helpers
export const CacheInvalidation = {
  userUpdated: (userId: string) => {
    userCache.invalidatePattern(`user:${userId}.*`)
    statsCache.delete(CacheKeys.userStats(userId))
  },
  
  followAction: (followerId: string, targetId: string) => {
    searchCache.clear() // Clear all search results
    userCache.delete(CacheKeys.userFollowing(followerId))
    userCache.delete(CacheKeys.userFollowers(targetId))
    userCache.delete(CacheKeys.followStatus(followerId, targetId))
    statsCache.delete(CacheKeys.userStats(followerId))
    statsCache.delete(CacheKeys.userStats(targetId))
  },
  
  businessUpdated: (userId: string) => {
    businessCache.invalidatePattern(`business:${userId}.*`)
    searchCache.clear() // Business changes affect search results
  },
  
  clearAll: () => {
    userCache.clear()
    businessCache.clear()
    searchCache.clear()
    statsCache.clear()
  }
}

export { CacheManager } 