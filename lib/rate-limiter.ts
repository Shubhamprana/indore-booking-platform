/**
 * Production Rate Limiter for High-Traffic Applications
 * Protects against abuse and ensures fair resource usage
 */

interface RateLimitRule {
  windowMs: number
  maxRequests: number
  skipIfAuthenticated?: boolean
  burstAllowance?: number
  message?: string
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  message?: string
}

interface RateLimitStats {
  totalRequests: number
  blockedRequests: number
  blockRate: number
  topOffenders: { identifier: string; requests: number }[]
}

export class RateLimiter {
  private static requests = new Map<string, { times: number[]; burstUsed: number }>()
  private static stats: RateLimitStats = {
    totalRequests: 0,
    blockedRequests: 0,
    blockRate: 0,
    topOffenders: []
  }

  // Predefined rules for different endpoints
  static readonly RULES = {
    // Authentication endpoints - strict limits
    AUTH: {
      windowMs: 60000, // 1 minute
      maxRequests: 5,
      burstAllowance: 2,
      message: 'Too many authentication attempts. Please try again later.'
    },
    
    // API endpoints - moderate limits
    API: {
      windowMs: 60000, // 1 minute
      maxRequests: 100,
      burstAllowance: 20,
      skipIfAuthenticated: true,
      message: 'API rate limit exceeded. Please slow down.'
    },
    
    // Search endpoints - higher limits
    SEARCH: {
      windowMs: 60000, // 1 minute
      maxRequests: 200,
      burstAllowance: 50,
      message: 'Search rate limit exceeded. Please wait before searching again.'
    },
    
    // Public endpoints - very high limits
    PUBLIC: {
      windowMs: 60000, // 1 minute
      maxRequests: 500,
      burstAllowance: 100,
      message: 'Rate limit exceeded. Please try again later.'
    }
  } as const

  /**
   * Check if request is allowed under rate limit
   */
  static check(identifier: string, rule: RateLimitRule): RateLimitResult {
    this.stats.totalRequests++
    
    const now = Date.now()
    const windowStart = now - rule.windowMs
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, { times: [], burstUsed: 0 })
    }
    
    const userRequests = this.requests.get(identifier)!
    
    // Clean old requests outside the window
    userRequests.times = userRequests.times.filter(time => time > windowStart)
    
    // Reset burst allowance if enough time has passed
    if (userRequests.times.length === 0) {
      userRequests.burstUsed = 0
    }
    
    const currentRequests = userRequests.times.length
    const maxAllowed = rule.maxRequests + (rule.burstAllowance || 0)
    
    // Check if within limits
    if (currentRequests >= maxAllowed) {
      this.stats.blockedRequests++
      this.updateTopOffenders(identifier, currentRequests)
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.min(...userRequests.times) + rule.windowMs,
        message: rule.message || 'Rate limit exceeded'
      }
    }
    
    // Allow request
    userRequests.times.push(now)
    
    // Track burst usage
    if (currentRequests >= rule.maxRequests) {
      userRequests.burstUsed++
    }
    
    const remaining = Math.max(0, maxAllowed - currentRequests - 1)
    const oldestRequest = userRequests.times[0] || now
    
    return {
      allowed: true,
      remaining,
      resetTime: oldestRequest + rule.windowMs
    }
  }

  /**
   * Check with predefined rule
   */
  static checkWithRule(identifier: string, ruleName: keyof typeof RateLimiter.RULES): RateLimitResult {
    return this.check(identifier, this.RULES[ruleName])
  }

  /**
   * Get rate limiting headers for HTTP responses
   */
  static getHeaders(result: RateLimitResult, rule: RateLimitRule): Record<string, string> {
    return {
      'X-RateLimit-Limit': rule.maxRequests.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
      'X-RateLimit-Window': rule.windowMs.toString()
    }
  }

  /**
   * Clear rate limit for specific identifier
   */
  static clear(identifier: string): void {
    this.requests.delete(identifier)
  }

  /**
   * Clear all rate limits
   */
  static clearAll(): void {
    this.requests.clear()
    this.resetStats()
  }

  /**
   * Get current statistics
   */
  static getStats(): RateLimitStats {
    const blockRate = this.stats.totalRequests > 0 
      ? this.stats.blockedRequests / this.stats.totalRequests 
      : 0

    return {
      ...this.stats,
      blockRate
    }
  }

  /**
   * Get current active limits
   */
  static getActiveLimits(): { identifier: string; requests: number; remaining: number }[] {
    const now = Date.now()
    const active: { identifier: string; requests: number; remaining: number }[] = []
    
    for (const [identifier, data] of this.requests.entries()) {
      if (data.times.length > 0) {
        // Calculate remaining based on API rule (most common)
        const rule = this.RULES.API
        const windowStart = now - rule.windowMs
        const validRequests = data.times.filter(time => time > windowStart).length
        const remaining = Math.max(0, rule.maxRequests - validRequests)
        
        active.push({
          identifier,
          requests: validRequests,
          remaining
        })
      }
    }
    
    return active.sort((a, b) => b.requests - a.requests)
  }

  /**
   * Update top offenders list
   */
  private static updateTopOffenders(identifier: string, requests: number) {
    const existing = this.stats.topOffenders.find(o => o.identifier === identifier)
    
    if (existing) {
      existing.requests = Math.max(existing.requests, requests)
    } else {
      this.stats.topOffenders.push({ identifier, requests })
    }
    
    // Keep only top 10 offenders
    this.stats.topOffenders.sort((a, b) => b.requests - a.requests)
    this.stats.topOffenders = this.stats.topOffenders.slice(0, 10)
  }

  /**
   * Reset statistics
   */
  private static resetStats() {
    this.stats = {
      totalRequests: 0,
      blockedRequests: 0,
      blockRate: 0,
      topOffenders: []
    }
  }

  /**
   * Cleanup old entries to prevent memory leaks
   */
  static cleanup(): void {
    const now = Date.now()
    const maxAge = 3600000 // 1 hour
    
    for (const [identifier, data] of this.requests.entries()) {
      // Remove entries with no recent activity
      const latestRequest = Math.max(...data.times, 0)
      if (now - latestRequest > maxAge) {
        this.requests.delete(identifier)
      }
    }
  }
}

/**
 * Middleware function for Next.js API routes
 */
export function withRateLimit(rule: RateLimitRule | keyof typeof RateLimiter.RULES) {
  return function(handler: (req: any, res: any) => Promise<any>) {
    return async function(req: any, res: any) {
      // Get client identifier
      const identifier = getClientIdentifier(req)
      
      // Check rate limit
      const rateRule = typeof rule === 'string' ? RateLimiter.RULES[rule] : rule
      const result = RateLimiter.check(identifier, rateRule)
      
      // Add rate limit headers
      const headers = RateLimiter.getHeaders(result, rateRule)
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value)
      })
      
      // Block if rate limited
      if (!result.allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: result.message,
          resetTime: result.resetTime
        })
      }
      
      // Continue to handler
      return handler(req, res)
    }
  }
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(req: any): string {
  // Try to get user ID if authenticated
  if (req.user?.id) {
    return `user_${req.user.id}`
  }
  
  // Fall back to IP address
  const forwarded = req.headers['x-forwarded-for']
  const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress
  return `ip_${ip || 'unknown'}`
}

// Automatic cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    RateLimiter.cleanup()
  }, 300000)
} 