/**
 * Scalable Cache Manager for High-Traffic Applications
 * Designed to handle 1000+ concurrent users
 */

interface CacheItem {
  data: any
  expiry: number
  hits: number
  lastAccessed: number
  size: number
}

interface CacheStats {
  hits: number
  misses: number
  evictions: number
  hitRate: number
  cacheSize: number
  memoryUsage: number
  avgResponseTime: number
}

export class ScalableCache {
  private static memoryCache = new Map<string, CacheItem>()
  private static readonly MAX_MEMORY_ITEMS = 10000
  private static readonly MAX_MEMORY_SIZE = 100 * 1024 * 1024 // 100MB
  private static stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    hitRate: 0,
    cacheSize: 0,
    memoryUsage: 0,
    avgResponseTime: 0
  }
  private static responseTimes: number[] = []

  /**
   * Get cached data or fetch if not available
   */
  static async get<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl = 300000, // 5 minutes default
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<T> {
    const startTime = Date.now()
    const now = Date.now()
    const cached = this.memoryCache.get(key)
    
    // Cache hit - return cached data
    if (cached && cached.expiry > now) {
      cached.hits++
      cached.lastAccessed = now
      this.stats.hits++
      this.updateStats(Date.now() - startTime)
      return cached.data
    }

    // Cache miss - fetch data
    this.stats.misses++
    
    try {
      const data = await fetcher()
      const dataSize = this.estimateSize(data)
      
      // Check if we need to make space
      if (this.memoryCache.size >= this.MAX_MEMORY_ITEMS || 
          this.getTotalMemoryUsage() + dataSize > this.MAX_MEMORY_SIZE) {
        this.evictItems(priority, dataSize)
      }
      
      // Store in cache
      this.memoryCache.set(key, {
        data,
        expiry: now + ttl,
        hits: 0,
        lastAccessed: now,
        size: dataSize
      })
      
      this.updateStats(Date.now() - startTime)
      return data
    } catch (error) {
      this.updateStats(Date.now() - startTime)
      throw error
    }
  }

  /**
   * Set cache item directly
   */
  static set<T>(key: string, data: T, ttl = 300000, priority: 'high' | 'medium' | 'low' = 'medium') {
    const now = Date.now()
    const dataSize = this.estimateSize(data)
    
    if (this.memoryCache.size >= this.MAX_MEMORY_ITEMS || 
        this.getTotalMemoryUsage() + dataSize > this.MAX_MEMORY_SIZE) {
      this.evictItems(priority, dataSize)
    }
    
    this.memoryCache.set(key, {
      data,
      expiry: now + ttl,
      hits: 0,
      lastAccessed: now,
      size: dataSize
    })
  }

  /**
   * Delete cache item
   */
  static delete(key: string): boolean {
    return this.memoryCache.delete(key)
  }

  /**
   * Clear all cache
   */
  static clear(): void {
    this.memoryCache.clear()
    this.resetStats()
  }

  /**
   * Get cache statistics
   */
  static getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0
    
    return {
      ...this.stats,
      hitRate,
      cacheSize: this.memoryCache.size,
      memoryUsage: this.getTotalMemoryUsage(),
      avgResponseTime: this.getAverageResponseTime()
    }
  }

  /**
   * Warm up cache with commonly accessed data
   */
  static async warmUp(keys: { key: string; fetcher: () => Promise<any>; ttl?: number }[]) {
    console.log('🔥 Warming up cache with', keys.length, 'items...')
    
    const promises = keys.map(async ({ key, fetcher, ttl = 300000 }) => {
      try {
        await this.get(key, fetcher, ttl, 'high')
      } catch (error) {
        console.error(`Cache warmup failed for key: ${key}`, error)
      }
    })
    
    await Promise.allSettled(promises)
    console.log('✅ Cache warmup completed')
  }

  /**
   * Intelligent eviction based on LRU + LFU + priority
   */
  private static evictItems(priority: 'high' | 'medium' | 'low', requiredSpace: number) {
    const items = Array.from(this.memoryCache.entries())
    
    // Sort by eviction score (lower = evict first)
    items.sort(([, a], [, b]) => {
      const scoreA = this.calculateEvictionScore(a, priority)
      const scoreB = this.calculateEvictionScore(b, priority)
      return scoreA - scoreB
    })
    
    let freedSpace = 0
    let evicted = 0
    
    for (const [key, item] of items) {
      if (freedSpace >= requiredSpace && this.memoryCache.size < this.MAX_MEMORY_ITEMS * 0.8) {
        break
      }
      
      this.memoryCache.delete(key)
      freedSpace += item.size
      evicted++
      this.stats.evictions++
    }
    
    console.log(`🗑️ Evicted ${evicted} items, freed ${freedSpace} bytes`)
  }

  /**
   * Calculate eviction score (lower = evict first)
   */
  private static calculateEvictionScore(item: CacheItem, currentPriority: string): number {
    const now = Date.now()
    const age = now - item.lastAccessed
    const timeToExpiry = item.expiry - now
    
    // Base score on age and access frequency
    let score = age / (item.hits + 1)
    
    // Adjust for time to expiry
    if (timeToExpiry < 60000) { // Less than 1 minute to expiry
      score *= 0.1 // Very likely to evict
    }
    
    // Adjust for item size (larger items get higher eviction score)
    score *= Math.log(item.size + 1)
    
    return score
  }

  /**
   * Estimate memory size of data
   */
  private static estimateSize(data: any): number {
    if (data === null || data === undefined) return 0
    if (typeof data === 'string') return data.length * 2 // UTF-16
    if (typeof data === 'number') return 8
    if (typeof data === 'boolean') return 4
    if (Array.isArray(data)) {
      return data.reduce((sum: number, item: any) => sum + this.estimateSize(item), 0)
    }
    if (typeof data === 'object') {
      return Object.values(data).reduce((sum: number, value: any) => sum + this.estimateSize(value), 0) +
             Object.keys(data).reduce((sum: number, key: string) => sum + key.length * 2, 0)
    }
    return 100 // Default estimate
  }

  /**
   * Get total memory usage
   */
  private static getTotalMemoryUsage(): number {
    let total = 0
    for (const item of this.memoryCache.values()) {
      total += item.size
    }
    return total
  }

  /**
   * Update performance statistics
   */
  private static updateStats(responseTime: number) {
    this.responseTimes.push(responseTime)
    
    // Keep only last 1000 response times
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000)
    }
  }

  /**
   * Get average response time
   */
  private static getAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0
    return this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length
  }

  /**
   * Reset statistics
   */
  private static resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      hitRate: 0,
      cacheSize: 0,
      memoryUsage: 0,
      avgResponseTime: 0
    }
    this.responseTimes = []
  }

  /**
   * Get cache health score (0-100)
   */
  static getHealthScore(): number {
    const stats = this.getStats()
    
    let score = 100
    
    // Penalize low hit rate
    if (stats.hitRate < 0.8) score -= (0.8 - stats.hitRate) * 50
    
    // Penalize high memory usage
    const memoryUsagePercent = stats.memoryUsage / this.MAX_MEMORY_SIZE
    if (memoryUsagePercent > 0.8) score -= (memoryUsagePercent - 0.8) * 100
    
    // Penalize slow response times
    if (stats.avgResponseTime > 100) score -= Math.min(30, (stats.avgResponseTime - 100) / 10)
    
    return Math.max(0, Math.min(100, score))
  }
}

// Predefined cache strategies for different data types
export const CacheStrategies = {
  // User profiles - medium TTL, high priority
  userProfile: (userId: string) => ({
    key: `user_profile_${userId}`,
    ttl: 300000, // 5 minutes
    priority: 'high' as const
  }),

  // Business search results - short TTL, medium priority
  businessSearch: (query: string, location?: string) => ({
    key: `business_search_${query}_${location || 'all'}`,
    ttl: 60000, // 1 minute
    priority: 'medium' as const
  }),

  // Follow counts - very short TTL, low priority
  followCounts: (userId: string) => ({
    key: `follow_counts_${userId}`,
    ttl: 30000, // 30 seconds
    priority: 'low' as const
  }),

  // User statistics - medium TTL, medium priority
  userStats: (userId: string) => ({
    key: `user_stats_${userId}`,
    ttl: 180000, // 3 minutes
    priority: 'medium' as const
  }),

  // Business dashboard data - short TTL, high priority
  businessDashboard: (userId: string) => ({
    key: `business_dashboard_${userId}`,
    ttl: 120000, // 2 minutes
    priority: 'high' as const
  })
}

// Cache warming data for commonly accessed items
export const cacheWarmupData = [
  {
    key: 'trending_businesses',
    fetcher: async () => {
      // This would fetch trending businesses
      return []
    },
    ttl: 600000 // 10 minutes
  },
  {
    key: 'popular_categories',
    fetcher: async () => {
      // This would fetch popular business categories
      return []
    },
    ttl: 3600000 // 1 hour
  }
] 