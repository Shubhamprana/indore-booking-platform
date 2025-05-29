// Performance monitoring utilities for production optimization

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  type: 'timing' | 'counter' | 'gauge'
}

class PerformanceTracker {
  private static metrics: PerformanceMetric[] = []
  private static isEnabled = typeof window !== 'undefined' && process.env.NODE_ENV === 'production'

  // Track Core Web Vitals
  static initWebVitals() {
    if (!this.isEnabled) return

    try {
      // Track Largest Contentful Paint (LCP)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.recordMetric('LCP', lastEntry.startTime, 'timing')
      }).observe({ entryTypes: ['largest-contentful-paint'] })

      // Track First Input Delay (FID)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach((entry: any) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime, 'timing')
        })
      }).observe({ entryTypes: ['first-input'] })

      // Track Cumulative Layout Shift (CLS)
      let clsValue = 0
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        this.recordMetric('CLS', clsValue, 'gauge')
      }).observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('Performance tracking not supported')
    }
  }

  // Track API call performance
  static trackAPICall(name: string, duration: number, success: boolean) {
    if (!this.isEnabled) return
    
    this.recordMetric(`api_${name}_duration`, duration, 'timing')
    this.recordMetric(`api_${name}_${success ? 'success' : 'error'}`, 1, 'counter')
  }

  // Track component render performance
  static trackComponentRender(componentName: string, renderTime: number) {
    if (!this.isEnabled) return
    
    this.recordMetric(`component_${componentName}_render`, renderTime, 'timing')
  }

  // Track bundle loading performance
  static trackBundleLoad(bundleName: string, loadTime: number) {
    if (!this.isEnabled) return
    
    this.recordMetric(`bundle_${bundleName}_load`, loadTime, 'timing')
  }

  private static recordMetric(name: string, value: number, type: PerformanceMetric['type']) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      type
    }

    this.metrics.push(metric)

    // Keep only last 100 metrics to avoid memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }

    // Log critical performance issues in development
    if (process.env.NODE_ENV === 'development' && this.shouldAlert(metric)) {
      console.warn(`Performance Alert: ${name} = ${value}ms`)
    }
  }

  private static shouldAlert(metric: PerformanceMetric): boolean {
    const { name, value } = metric
    
    // Alert thresholds
    if (name === 'LCP' && value > 4000) return true // LCP > 4s
    if (name === 'FID' && value > 300) return true // FID > 300ms
    if (name === 'CLS' && value > 0.25) return true // CLS > 0.25
    if (name.includes('api_') && name.includes('_duration') && value > 5000) return true // API > 5s
    
    return false
  }

  // Get performance summary
  static getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  // Clear metrics
  static clearMetrics() {
    this.metrics = []
  }
}

// Hook for React components to track render performance
export function usePerformanceTracking(componentName: string) {
  if (typeof window === 'undefined') return () => {}

  const startTime = performance.now()
  
  return () => {
    const endTime = performance.now()
    PerformanceTracker.trackComponentRender(componentName, endTime - startTime)
  }
}

// Utility to measure function execution time
export function measureExecutionTime<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: Parameters<T>) => {
    const start = performance.now()
    const result = fn(...args)
    const end = performance.now()
    
    PerformanceTracker.trackAPICall(name, end - start, true)
    
    return result
  }) as T
}

// Initialize web vitals tracking
if (typeof window !== 'undefined') {
  PerformanceTracker.initWebVitals()
}

export { PerformanceTracker } 