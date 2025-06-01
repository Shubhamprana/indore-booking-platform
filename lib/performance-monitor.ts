/**
 * Performance Monitoring System for High-Traffic Applications
 * Tracks metrics, identifies bottlenecks, and ensures optimal performance
 */

interface PerformanceMetric {
  name?: string
  value?: number
  timestamp: number
  labels?: Record<string, string>
  category?: 'page_load' | 'api_call' | 'database' | 'cache' | 'custom'
  // Additional properties for API tracking
  duration?: number
  success?: boolean
  endpoint?: string
  userId?: string
  metadata?: Record<string, any>
}

interface PerformanceStats {
  metrics: PerformanceMetric[]
  averages: Record<string, number>
  percentiles: Record<string, { p50: number; p90: number; p95: number; p99: number }>
  errors: { count: number; rate: number }
  slowQueries: PerformanceMetric[]
}

interface CacheMetric {
  hits: number
  misses: number
  evictions: number
  avgResponseTime: number
  timestamp: number
}

interface UserInteractionMetric {
  action: string
  timestamp: number
  userId?: string
  duration?: number
  metadata?: Record<string, any>
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetric[] = []
  private static readonly MAX_METRICS = 10000
  private static errors = 0
  private static totalRequests = 0

  private apiMetrics: Map<string, PerformanceMetric[]> = new Map()
  private cacheMetrics: Map<string, CacheMetric[]> = new Map()
  private userInteractions: UserInteractionMetric[] = []
  private errorLog: Array<{ timestamp: number; error: string; context: any }> = []
  
  // Configuration
  private maxMetricsPerEndpoint = 1000
  private maxErrorLogs = 500
  private maxUserInteractions = 2000
  private reportingInterval = 60000 // 1 minute
  private alertThresholds = {
    apiResponseTime: 2000, // 2 seconds
    errorRate: 0.05, // 5%
    cacheHitRate: 0.8 // 80%
  }

  private reportingTimer: NodeJS.Timeout | null = null

  constructor() {
    this.startReporting()
    
    // Cleanup on app shutdown
    if (typeof window === 'undefined') {
      process.on('SIGTERM', () => this.cleanup())
      process.on('SIGINT', () => this.cleanup())
    }
  }

  /**
   * Track page load performance
   */
  static trackPageLoad(pageName: string, customMetrics?: Record<string, number>) {
    if (typeof window === 'undefined') return

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      // Core Web Vitals and performance metrics
      const metrics = {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstByte: navigation.responseStart - navigation.requestStart,
        domInteractive: navigation.domInteractive - navigation.domContentLoadedEventStart,
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
        ...customMetrics
      }

      // Track each metric
      Object.entries(metrics).forEach(([metricName, value]) => {
        if (value > 0) { // Only track valid metrics
          this.addMetric({
            name: `page_${metricName}`,
            value,
            timestamp: Date.now(),
            labels: { page: pageName },
            category: 'page_load'
          })
        }
      })

      // Track Core Web Vitals separately
      this.trackCoreWebVitals(pageName)
      
    } catch (error) {
      console.error('Error tracking page load:', error)
    }
  }

  /**
   * Track Core Web Vitals
   */
  private static trackCoreWebVitals(pageName: string) {
    if (typeof window === 'undefined') return

    // TODO: Re-enable web-vitals integration after resolving TypeScript issues
    // For now, track basic performance metrics manually
    try {
      // Track basic performance metrics
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      // Basic Core Web Vitals approximation
      this.addMetric({
        name: 'core_web_vital_fcp',
        value: navigation.responseStart - navigation.fetchStart,
        timestamp: Date.now(),
        labels: { page: pageName, vital: 'FCP_APPROX' },
        category: 'page_load'
      })

      this.addMetric({
        name: 'core_web_vital_lcp',
        value: navigation.loadEventEnd - navigation.fetchStart,
        timestamp: Date.now(),
        labels: { page: pageName, vital: 'LCP_APPROX' },
        category: 'page_load'
      })
    } catch (error) {
      console.error('Error tracking core web vitals:', error)
    }
  }

  /**
   * Track API call performance
   */
  trackAPICall(
    endpoint: string, 
    duration: number, 
    success: boolean, 
    userId?: string,
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      timestamp: Date.now(),
      duration,
      success,
      endpoint,
      userId,
      metadata,
      name: 'api_call',
      value: duration,
      category: 'api_call',
      labels: {
        endpoint,
        success: success.toString(),
        userId: userId || 'anonymous'
      }
    }

    if (!this.apiMetrics.has(endpoint)) {
      this.apiMetrics.set(endpoint, [])
    }

    const metrics = this.apiMetrics.get(endpoint)!
    metrics.push(metric)

    // Keep only recent metrics
    if (metrics.length > this.maxMetricsPerEndpoint) {
      metrics.splice(0, metrics.length - this.maxMetricsPerEndpoint)
    }

    // Check for performance alerts
    this.checkPerformanceAlerts(endpoint, metric)
  }

  /**
   * Track database query performance
   */
  static trackDatabaseQuery(
    query: string, 
    duration: number, 
    success: boolean,
    rowCount?: number
  ) {
    const queryType = this.extractQueryType(query)
    
    this.addMetric({
      name: 'database_query_duration',
      value: duration,
      timestamp: Date.now(),
      labels: {
        query_type: queryType,
        success: success.toString(),
        rows: rowCount?.toString() || '0'
      },
      category: 'database',
      duration,
      success
    })

    // Track slow queries
    if (duration > 500) { // Slower than 500ms
      this.addMetric({
        name: 'slow_database_query',
        value: duration,
        timestamp: Date.now(),
        labels: { 
          query_type: queryType, 
          duration: `${duration}ms`,
          query: query.substring(0, 100) // First 100 chars
        },
        category: 'database',
        duration,
        success
      })
    }
  }

  /**
   * Track cache performance
   */
  trackCachePerformance(
    cacheType: string,
    hits: number,
    misses: number,
    evictions: number = 0,
    avgResponseTime: number = 0
  ): void {
    const metric: CacheMetric = {
      hits,
      misses,
      evictions,
      avgResponseTime,
      timestamp: Date.now()
    }

    if (!this.cacheMetrics.has(cacheType)) {
      this.cacheMetrics.set(cacheType, [])
    }

    const metrics = this.cacheMetrics.get(cacheType)!
    metrics.push(metric)

    // Keep only recent metrics (last 100 entries)
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100)
    }
  }

  /**
   * Track user interactions
   */
  trackUserInteraction(
    action: string,
    userId?: string,
    duration?: number,
    metadata?: Record<string, any>
  ): void {
    const interaction: UserInteractionMetric = {
      action,
      timestamp: Date.now(),
      userId,
      duration,
      metadata
    }

    this.userInteractions.push(interaction)

    // Keep only recent interactions
    if (this.userInteractions.length > this.maxUserInteractions) {
      this.userInteractions.splice(0, this.userInteractions.length - this.maxUserInteractions)
    }
  }

  /**
   * Track custom performance metric
   */
  static trackCustomMetric(
    name: string,
    value: number,
    labels: Record<string, string> = {}
  ) {
    this.addMetric({
      name,
      value,
      timestamp: Date.now(),
      labels,
      category: 'custom'
    })
  }

  /**
   * Get comprehensive performance statistics
   */
  static getStats(timeRange: number = 3600000): PerformanceStats { // Default: last hour
    const cutoff = Date.now() - timeRange
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff)
    
    return {
      metrics: recentMetrics.slice(-100), // Last 100 metrics
      averages: this.calculateAverages(recentMetrics),
      percentiles: this.calculatePercentiles(recentMetrics),
      errors: {
        count: this.errors,
        rate: this.totalRequests > 0 ? this.errors / this.totalRequests : 0
      },
      slowQueries: recentMetrics
        .filter(m => m.name === 'slow_database_query' || m.name === 'slow_api_call')
        .sort((a, b) => (b.value || 0) - (a.value || 0))
        .slice(0, 10)
    }
  }

  /**
   * Get real-time performance overview
   */
  static getRealTimeStats() {
    const last5Minutes = this.getStats(300000) // Last 5 minutes
    const currentMetrics = last5Minutes.metrics
    
    return {
      activeUsers: this.estimateActiveUsers(currentMetrics),
      avgResponseTime: last5Minutes.averages.api_call_duration || 0,
      errorRate: last5Minutes.errors.rate,
      cacheHitRate: this.calculateCacheHitRate(currentMetrics),
      slowQueriesCount: last5Minutes.slowQueries.length,
      performanceScore: this.calculatePerformanceScore(last5Minutes)
    }
  }

  /**
   * Add metric to collection
   */
  private static addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)
    
    // Limit memory usage
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS * 0.8) // Keep 80%
    }
  }

  /**
   * Calculate averages for different metric types
   */
  private static calculateAverages(metrics: PerformanceMetric[]): Record<string, number> {
    const groups = this.groupBy(metrics, 'name')
    const averages: Record<string, number> = {}
    
    Object.entries(groups).forEach(([name, metricList]) => {
      const sum = metricList.reduce((total, metric) => total + (metric.value || 0), 0)
      averages[name] = metricList.length > 0 ? sum / metricList.length : 0
    })
    
    return averages
  }

  /**
   * Calculate percentiles for performance metrics
   */
  private static calculatePercentiles(metrics: PerformanceMetric[]): Record<string, { p50: number; p90: number; p95: number; p99: number }> {
    const groups = this.groupBy(metrics, 'name')
    const percentiles: Record<string, { p50: number; p90: number; p95: number; p99: number }> = {}
    
    Object.entries(groups).forEach(([name, metricList]) => {
      const values = metricList.map(m => m.value || 0).sort((a, b) => a - b)
      
      if (values.length > 0) {
        percentiles[name] = {
          p50: this.getPercentile(values, 50),
          p90: this.getPercentile(values, 90),
          p95: this.getPercentile(values, 95),
          p99: this.getPercentile(values, 99)
        }
      }
    })
    
    return percentiles
  }

  /**
   * Calculate specific percentile
   */
  private static getPercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0
    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1
    return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))]
  }

  /**
   * Group metrics by specified property
   */
  private static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key])
      groups[groupKey] = groups[groupKey] || []
      groups[groupKey].push(item)
      return groups
    }, {} as Record<string, T[]>)
  }

  /**
   * Extract query type from SQL query
   */
  private static extractQueryType(query: string): string {
    const firstWord = query.trim().split(' ')[0].toUpperCase()
    return ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER'].includes(firstWord) 
      ? firstWord 
      : 'OTHER'
  }

  /**
   * Extract key type from cache key
   */
  private static extractKeyType(key: string): string {
    const parts = key.split('_')
    return parts[0] || 'unknown'
  }

  /**
   * Estimate active users from recent metrics
   */
  private static estimateActiveUsers(metrics: PerformanceMetric[]): number {
    const userMetrics = metrics.filter(m => m.labels?.user_id || m.labels?.session_id)
    const uniqueUsers = new Set(userMetrics.map(m => m.labels?.user_id || m.labels?.session_id))
    return uniqueUsers.size
  }

  /**
   * Calculate cache hit rate
   */
  private static calculateCacheHitRate(metrics: PerformanceMetric[]): number {
    const cacheMetrics = metrics.filter(m => m.category === 'cache')
    const hits = cacheMetrics.filter(m => m.name === 'cache_hit').length
    const total = cacheMetrics.filter(m => m.name === 'cache_hit' || m.name === 'cache_miss').length
    
    return total > 0 ? hits / total : 0
  }

  /**
   * Calculate overall performance score (0-100)
   */
  private static calculatePerformanceScore(stats: PerformanceStats): number {
    let score = 100
    
    // Penalize high response times
    const avgApiTime = stats.averages.api_call_duration || 0
    if (avgApiTime > 200) score -= Math.min(30, (avgApiTime - 200) / 20)
    
    // Penalize high error rates
    if (stats.errors.rate > 0.01) score -= stats.errors.rate * 100
    
    // Penalize slow queries
    if (stats.slowQueries.length > 5) score -= Math.min(20, (stats.slowQueries.length - 5) * 2)
    
    return Math.max(0, Math.min(100, score))
  }

  /**
   * Get performance alerts
   */
  static getAlerts(): { level: 'warning' | 'critical'; message: string; metric?: string }[] {
    const stats = this.getRealTimeStats()
    const alerts: { level: 'warning' | 'critical'; message: string; metric?: string }[] = []
    
    if (stats.avgResponseTime > 1000) {
      alerts.push({
        level: 'critical',
        message: `High response time: ${stats.avgResponseTime.toFixed(0)}ms`,
        metric: 'response_time'
      })
    } else if (stats.avgResponseTime > 500) {
      alerts.push({
        level: 'warning',
        message: `Elevated response time: ${stats.avgResponseTime.toFixed(0)}ms`,
        metric: 'response_time'
      })
    }
    
    if (stats.errorRate > 0.05) {
      alerts.push({
        level: 'critical',
        message: `High error rate: ${(stats.errorRate * 100).toFixed(1)}%`,
        metric: 'error_rate'
      })
    } else if (stats.errorRate > 0.01) {
      alerts.push({
        level: 'warning',
        message: `Elevated error rate: ${(stats.errorRate * 100).toFixed(1)}%`,
        metric: 'error_rate'
      })
    }
    
    if (stats.slowQueriesCount > 10) {
      alerts.push({
        level: 'warning',
        message: `High number of slow queries: ${stats.slowQueriesCount}`,
        metric: 'slow_queries'
      })
    }
    
    return alerts
  }

  /**
   * Clear old metrics to prevent memory leaks
   */
  static cleanup(maxAge: number = 7200000): void { // Default: 2 hours
    const cutoff = Date.now() - maxAge
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff)
  }

  /**
   * Reset all metrics and statistics
   */
  static reset(): void {
    this.metrics = []
    this.errors = 0
    this.totalRequests = 0
  }

  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(endpoint: string, metric: PerformanceMetric): void {
    // Check response time
    if (metric.duration && metric.duration > this.alertThresholds.apiResponseTime) {
      this.logError(`Slow API response: ${endpoint} took ${metric.duration}ms`, {
        endpoint,
        duration: metric.duration,
        threshold: this.alertThresholds.apiResponseTime
      })
    }

    // Check error rate
    const recentMetrics = this.apiMetrics.get(endpoint)?.slice(-100) || []
    const failureRate = recentMetrics.filter(m => !m.success).length / recentMetrics.length
    
    if (failureRate > this.alertThresholds.errorRate && recentMetrics.length >= 20) {
      this.logError(`High error rate: ${endpoint} has ${Math.round(failureRate * 100)}% error rate`, {
        endpoint,
        errorRate: failureRate,
        threshold: this.alertThresholds.errorRate,
        sampleSize: recentMetrics.length
      })
    }
  }

  /**
   * Log error with context
   */
  private logError(error: string, context: any): void {
    this.errorLog.push({
      timestamp: Date.now(),
      error,
      context
    })

    // Keep only recent errors
    if (this.errorLog.length > this.maxErrorLogs) {
      this.errorLog.splice(0, this.errorLog.length - this.maxErrorLogs)
    }

    // In production, you might want to send this to an external service
    if (process.env.NODE_ENV === 'production') {
      console.error('[Performance Alert]', error, context)
    }
  }

  /**
   * Start automated reporting
   */
  private startReporting(): void {
    if (typeof window === 'undefined') { // Only on server
      this.reportingTimer = setInterval(() => {
        this.generateReport()
      }, this.reportingInterval)
    }
  }

  /**
   * Generate performance report
   */
  private generateReport(): void {
    const stats = PerformanceMonitor.getRealTimeStats()
    const alerts = PerformanceMonitor.getAlerts()

    const report = {
      timestamp: new Date().toISOString(),
      performance: stats,
      alerts: alerts,
      system: this.getSystemMetrics()
    }

    // Log the report (in production, send to monitoring service)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Performance Report]', report)
    }

    // You can extend this to send to external monitoring services
    this.sendToExternalService(report)
  }

  /**
   * Get system metrics
   */
  private getSystemMetrics(): any {
    if (typeof window === 'undefined' && typeof process !== 'undefined') {
      const memUsage = process.memoryUsage()
      return {
        memory: {
          rss: memUsage.rss,
          heapTotal: memUsage.heapTotal,
          heapUsed: memUsage.heapUsed,
          external: memUsage.external
        },
        uptime: process.uptime(),
        nodeVersion: process.version
      }
    }
    return {}
  }

  /**
   * Send report to external monitoring service
   */
  private sendToExternalService(report: any): void {
    // Placeholder for external service integration
    // You can integrate with services like DataDog, New Relic, etc.
    
    // Example implementation:
    // if (process.env.MONITORING_WEBHOOK_URL) {
    //   fetch(process.env.MONITORING_WEBHOOK_URL, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(report)
    //   }).catch(err => console.error('Failed to send monitoring report:', err))
    // }
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.reportingTimer) {
      clearInterval(this.reportingTimer)
      this.reportingTimer = null
    }

    // Generate final report
    this.generateReport()
    
    // Clear metrics to free memory
    this.apiMetrics.clear()
    this.cacheMetrics.clear()
    this.userInteractions.length = 0
    this.errorLog.length = 0
  }

  /**
   * Get API performance summary
   */
  getAPIPerformanceSummary(): Record<string, any> {
    const summary: Record<string, any> = {}

    this.apiMetrics.forEach((metrics, endpoint) => {
      const recentMetrics = metrics.slice(-100) // Last 100 calls
      const durations = recentMetrics.map(m => m.duration || 0)
      const successCount = recentMetrics.filter(m => m.success).length

      summary[endpoint] = {
        callCount: metrics.length,
        recentCallCount: recentMetrics.length,
        successRate: recentMetrics.length > 0 ? successCount / recentMetrics.length : 0,
        avgDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
        minDuration: Math.min(...durations) || 0,
        maxDuration: Math.max(...durations) || 0,
        p95Duration: this.getPercentileFromArray(durations, 95)
      }
    })

    return summary
  }

  /**
   * Get cache performance summary
   */
  getCachePerformanceSummary(): Record<string, any> {
    const summary: Record<string, any> = {}

    this.cacheMetrics.forEach((metrics, cacheType) => {
      const recentMetrics = metrics.slice(-50) // Last 50 entries
      const totalHits = recentMetrics.reduce((sum, m) => sum + m.hits, 0)
      const totalMisses = recentMetrics.reduce((sum, m) => sum + m.misses, 0)
      const totalEvictions = recentMetrics.reduce((sum, m) => sum + m.evictions, 0)

      summary[cacheType] = {
        hitRate: totalHits + totalMisses > 0 ? totalHits / (totalHits + totalMisses) : 0,
        totalHits,
        totalMisses,
        totalEvictions,
        avgResponseTime: recentMetrics.length > 0 
          ? recentMetrics.reduce((sum, m) => sum + m.avgResponseTime, 0) / recentMetrics.length 
          : 0
      }
    })

    return summary
  }

  /**
   * Get user interaction summary
   */
  getUserInteractionSummary(): Record<string, any> {
    const recentInteractions = this.userInteractions.slice(-1000) // Last 1000 interactions
    const actionCounts: Record<string, number> = {}
    const userCounts: Record<string, number> = {}

    recentInteractions.forEach(interaction => {
      actionCounts[interaction.action] = (actionCounts[interaction.action] || 0) + 1
      if (interaction.userId) {
        userCounts[interaction.userId] = (userCounts[interaction.userId] || 0) + 1
      }
    })

    return {
      totalInteractions: recentInteractions.length,
      uniqueActions: Object.keys(actionCounts).length,
      uniqueUsers: Object.keys(userCounts).length,
      topActions: Object.entries(actionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10),
      avgInteractionsPerUser: Object.keys(userCounts).length > 0 
        ? Object.values(userCounts).reduce((a, b) => a + b, 0) / Object.keys(userCounts).length 
        : 0
    }
  }

  /**
   * Helper method to calculate percentile from array
   */
  private getPercentileFromArray(values: number[], percentile: number): number {
    const sorted = values.sort((a, b) => a - b)
    if (sorted.length === 0) return 0
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))]
  }
}

// Export singleton instance for global usage
export const performanceMonitor = new PerformanceMonitor()

// Export utility functions for easy access
export const trackPageLoad = PerformanceMonitor.trackPageLoad
export const trackDatabaseQuery = PerformanceMonitor.trackDatabaseQuery
export const trackCustomMetric = PerformanceMonitor.trackCustomMetric
export const getPerformanceStats = PerformanceMonitor.getStats
export const getRealTimeStats = PerformanceMonitor.getRealTimeStats
export const getAlerts = PerformanceMonitor.getAlerts
export const cleanup = PerformanceMonitor.cleanup
export const reset = PerformanceMonitor.reset

// Auto-cleanup on page unload (client-side)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    PerformanceMonitor.cleanup()
  })
} 