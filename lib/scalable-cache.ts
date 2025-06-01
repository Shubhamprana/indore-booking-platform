// Enhanced Scalable Cache System with LRU/LFU eviction algorithm
interface CacheEntry<T> {
  value: T
  expiresAt: number
  accessCount: number
  lastAccessed: number
  size: number
  priority: 'high' | 'medium' | 'low'
}

interface CacheStats {
  hits: number
  misses: number
  sets: number
  evictions: number
  totalSize: number
  itemCount: number
  hitRate: number
  averageAccessCount: number
}

interface CacheConfig {
  key: string
  ttl: number
  priority: 'high' | 'medium' | 'low'
}

class ScalableCacheSystem {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly maxSize: number = 100 * 1024 * 1024 // 100MB
  private readonly maxItems: number = 10000
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0,
    totalSize: 0,
    itemCount: 0,
    hitRate: 0,
    averageAccessCount: 0
  }

  private estimateSize(value: any): number {
    try {
      return JSON.stringify(value).length * 2 // Rough estimate in bytes
    } catch {
      return 1000 // Default estimate for non-serializable objects
    }
  }

  private updateStats(): void {
    this.stats.itemCount = this.cache.size
    this.stats.hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
      : 0
    
    const totalAccess = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.accessCount, 0)
    this.stats.averageAccessCount = this.cache.size > 0 ? totalAccess / this.cache.size : 0
  }

  private evictLeastUsed(): void {
    if (this.cache.size === 0) return

    let leastUsedKey: string | null = null
    let leastScore = Infinity

    // Calculate scores based on priority, access count, and recency
    for (const [key, entry] of this.cache) {
      const priorityWeight = entry.priority === 'high' ? 3 : entry.priority === 'medium' ? 2 : 1
      const timeFactor = (Date.now() - entry.lastAccessed) / 1000 / 60 // Minutes ago
      const score = (entry.accessCount * priorityWeight) / (1 + timeFactor)

      if (score < leastScore) {
        leastScore = score
        leastUsedKey = key
      }
    }

    if (leastUsedKey) {
      const entry = this.cache.get(leastUsedKey)!
      this.stats.totalSize -= entry.size
      this.cache.delete(leastUsedKey)
      this.stats.evictions++
    }
  }

  private cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, entry] of this.cache) {
      if (entry.expiresAt < now) {
        expiredKeys.push(key)
      }
    }

    for (const key of expiredKeys) {
      const entry = this.cache.get(key)!
      this.stats.totalSize -= entry.size
      this.cache.delete(key)
    }
  }

  async get<T>(
    key: string,
    fetchFunction?: () => Promise<T>,
    ttl: number = 300000, // 5 minutes
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<T | null> {
    this.cleanup()

    const entry = this.cache.get(key)
    
    if (entry && entry.expiresAt > Date.now()) {
      // Cache hit
      entry.accessCount++
      entry.lastAccessed = Date.now()
      this.stats.hits++
      this.updateStats()
      return entry.value as T
    }

    // Cache miss
    this.stats.misses++
    
    if (fetchFunction) {
      try {
        const value = await fetchFunction()
        await this.set(key, value, ttl, priority)
        return value
      } catch (error) {
        console.error('Cache fetchFunction error:', error)
        return null
      }
    }

    this.updateStats()
    return null
  }

  async set<T>(
    key: string,
    value: T,
    ttl: number = 300000, // 5 minutes
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<void> {
    const size = this.estimateSize(value)
    const expiresAt = Date.now() + ttl

    // Remove existing entry if it exists
    if (this.cache.has(key)) {
      const oldEntry = this.cache.get(key)!
      this.stats.totalSize -= oldEntry.size
    }

    // Ensure we don't exceed limits
    while (
      (this.stats.totalSize + size > this.maxSize || this.cache.size >= this.maxItems) &&
      this.cache.size > 0
    ) {
      this.evictLeastUsed()
    }

    // Don't cache if item is too large
    if (size > this.maxSize * 0.1) { // Don't cache items larger than 10% of max size
      console.warn(`Item too large to cache: ${key} (${size} bytes)`)
      return
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt,
      accessCount: 1,
      lastAccessed: Date.now(),
      size,
      priority
    }

    this.cache.set(key, entry)
    this.stats.totalSize += size
    this.stats.sets++
    this.updateStats()
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (entry) {
      this.stats.totalSize -= entry.size
      this.cache.delete(key)
      this.updateStats()
      return true
    }
    return false
  }

  clear(): void {
    this.cache.clear()
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      totalSize: 0,
      itemCount: 0,
      hitRate: 0,
      averageAccessCount: 0
    }
  }

  getStats(): CacheStats {
    this.updateStats()
    return { ...this.stats }
  }

  getHealthScore(): number {
    this.updateStats()
    const hitRateScore = this.stats.hitRate
    const memoryScore = Math.max(0, 100 - (this.stats.totalSize / this.maxSize) * 100)
    const evictionScore = Math.max(0, 100 - (this.stats.evictions / Math.max(1, this.stats.sets)) * 100)
    
    return Math.round((hitRateScore * 0.5 + memoryScore * 0.3 + evictionScore * 0.2))
  }

  // Warm cache with frequently accessed data
  async warmCache(warmupData: Array<{ key: string; fetchFn: () => Promise<any>; ttl?: number; priority?: 'high' | 'medium' | 'low' }>): Promise<void> {
    const promises = warmupData.map(({ key, fetchFn, ttl = 300000, priority = 'medium' }) =>
      this.get(key, fetchFn, ttl, priority)
    )
    
    await Promise.allSettled(promises)
  }
}

// Cache strategies for different data types
export const CacheStrategies = {
  userProfile: (userId: string): CacheConfig => ({
    key: `user:profile:${userId}`,
    ttl: 5 * 60 * 1000, // 5 minutes
    priority: 'high'
  }),

  businessSearch: (query: string, location?: string): CacheConfig => ({
    key: `search:business:${query}:${location || 'all'}`,
    ttl: 1 * 60 * 1000, // 1 minute
    priority: 'medium'
  }),

  followCount: (userId: string): CacheConfig => ({
    key: `follow:count:${userId}`,
    ttl: 30 * 1000, // 30 seconds
    priority: 'low'
  }),

  userStats: (userId: string): CacheConfig => ({
    key: `user:stats:${userId}`,
    ttl: 3 * 60 * 1000, // 3 minutes
    priority: 'medium'
  }),

  dashboardData: (userId: string): CacheConfig => ({
    key: `dashboard:${userId}`,
    ttl: 2 * 60 * 1000, // 2 minutes
    priority: 'high'
  }),

  trending: (type: string, location?: string): CacheConfig => ({
    key: `trending:${type}:${location || 'all'}`,
    ttl: 5 * 60 * 1000, // 5 minutes
    priority: 'medium'
  })
}

// Export singleton instance
export const ScalableCache = new ScalableCacheSystem()

// Export types
export type { CacheConfig, CacheStats } 