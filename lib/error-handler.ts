/**
 * Production Error Handling & Logging System
 * Provides structured logging, error tracking, and recovery mechanisms
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  DATABASE = 'database',
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHORIZATION = 'authorization',
  BUSINESS_LOGIC = 'business_logic',
  EXTERNAL_SERVICE = 'external_service',
  SYSTEM = 'system'
}

export interface ErrorContext {
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
  timestamp?: string
  requestId?: string
  component?: string
  action?: string
  metadata?: Record<string, any>
  // Circuit breaker specific fields
  circuitBreakerFailures?: number
  circuitBreakerState?: string
  threshold?: number
  failures?: number
  // Retry specific fields
  attempt?: number
  maxRetries?: number
  delay?: number
  error?: string
  finalError?: string
}

export interface LogEntry {
  level: LogLevel
  message: string
  category?: ErrorCategory
  error?: Error
  context?: ErrorContext
  timestamp: string
  id: string
}

class ErrorHandler {
  private logs: LogEntry[] = []
  private maxLogs = 1000
  private logLevel: LogLevel
  private enableConsoleOutput: boolean
  private enableRemoteLogging: boolean

  constructor(config: {
    logLevel?: LogLevel
    enableConsoleOutput?: boolean
    enableRemoteLogging?: boolean
    maxLogs?: number
  } = {}) {
    this.logLevel = config.logLevel ?? LogLevel.INFO
    this.enableConsoleOutput = config.enableConsoleOutput ?? true
    this.enableRemoteLogging = config.enableRemoteLogging ?? false
    this.maxLogs = config.maxLogs ?? 1000
  }

  /**
   * Log an error with context
   */
  logError(
    error: Error | string,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    context: ErrorContext = {}
  ): string {
    const logEntry = this.createLogEntry(
      LogLevel.ERROR,
      typeof error === 'string' ? error : error.message,
      category,
      typeof error === 'string' ? undefined : error,
      context
    )

    this.processLog(logEntry)
    return logEntry.id
  }

  /**
   * Log a warning
   */
  logWarning(
    message: string,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    context: ErrorContext = {}
  ): string {
    const logEntry = this.createLogEntry(LogLevel.WARN, message, category, undefined, context)
    this.processLog(logEntry)
    return logEntry.id
  }

  /**
   * Log info message
   */
  logInfo(
    message: string,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    context: ErrorContext = {}
  ): string {
    const logEntry = this.createLogEntry(LogLevel.INFO, message, category, undefined, context)
    this.processLog(logEntry)
    return logEntry.id
  }

  /**
   * Log debug message
   */
  logDebug(
    message: string,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    context: ErrorContext = {}
  ): string {
    const logEntry = this.createLogEntry(LogLevel.DEBUG, message, category, undefined, context)
    this.processLog(logEntry)
    return logEntry.id
  }

  /**
   * Handle async operation with error catching
   */
  async handleAsync<T>(
    operation: () => Promise<T>,
    context: ErrorContext = {},
    fallback?: T
  ): Promise<T | undefined> {
    try {
      return await operation()
    } catch (error) {
      this.logError(
        error as Error,
        this.categorizeError(error as Error),
        {
          ...context,
          action: 'async_operation'
        }
      )

      if (fallback !== undefined) {
        return fallback
      }

      return undefined
    }
  }

  /**
   * Wrap sync operation with error catching
   */
  handleSync<T>(
    operation: () => T,
    context: ErrorContext = {},
    fallback?: T
  ): T | undefined {
    try {
      return operation()
    } catch (error) {
      this.logError(
        error as Error,
        this.categorizeError(error as Error),
        {
          ...context,
          action: 'sync_operation'
        }
      )

      if (fallback !== undefined) {
        return fallback
      }

      return undefined
    }
  }

  /**
   * Get recent logs
   */
  getRecentLogs(count: number = 50, level?: LogLevel): LogEntry[] {
    let filteredLogs = this.logs

    if (level !== undefined) {
      filteredLogs = this.logs.filter(log => log.level >= level)
    }

    return filteredLogs
      .slice(-count)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  /**
   * Get error statistics
   */
  getStats(timeWindow: number = 3600000): {
    total: number
    byLevel: Record<string, number>
    byCategory: Record<string, number>
    recentErrors: number
  } {
    const now = Date.now()
    const recentLogs = this.logs.filter(
      log => now - new Date(log.timestamp).getTime() < timeWindow
    )

    const byLevel: Record<string, number> = {}
    const byCategory: Record<string, number> = {}

    recentLogs.forEach(log => {
      const levelName = LogLevel[log.level]
      byLevel[levelName] = (byLevel[levelName] || 0) + 1

      if (log.category) {
        byCategory[log.category] = (byCategory[log.category] || 0) + 1
      }
    })

    return {
      total: this.logs.length,
      byLevel,
      byCategory,
      recentErrors: recentLogs.filter(log => log.level >= LogLevel.ERROR).length
    }
  }

  /**
   * Clear old logs
   */
  clearOldLogs(maxAge: number = 86400000): number {
    const cutoff = Date.now() - maxAge
    const initialCount = this.logs.length

    this.logs = this.logs.filter(
      log => new Date(log.timestamp).getTime() > cutoff
    )

    return initialCount - this.logs.length
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    category?: ErrorCategory,
    error?: Error,
    context: ErrorContext = {}
  ): LogEntry {
    return {
      id: this.generateId(),
      level,
      message,
      category,
      error,
      context: {
        ...context,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }
  }

  private processLog(logEntry: LogEntry): void {
    // Check if we should log this level
    if (logEntry.level < this.logLevel) {
      return
    }

    // Add to memory store
    this.addToMemoryStore(logEntry)

    // Console output
    if (this.enableConsoleOutput) {
      this.outputToConsole(logEntry)
    }

    // Remote logging
    if (this.enableRemoteLogging) {
      this.sendToRemoteLogger(logEntry)
    }
  }

  private addToMemoryStore(logEntry: LogEntry): void {
    this.logs.push(logEntry)

    // Trim if we exceed max logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }
  }

  private outputToConsole(logEntry: LogEntry): void {
    const prefix = `[${LogLevel[logEntry.level]}] ${logEntry.timestamp}`
    const message = logEntry.category 
      ? `${prefix} [${logEntry.category}] ${logEntry.message}`
      : `${prefix} ${logEntry.message}`

    switch (logEntry.level) {
      case LogLevel.DEBUG:
        console.debug(message, logEntry.context, logEntry.error)
        break
      case LogLevel.INFO:
        console.info(message, logEntry.context)
        break
      case LogLevel.WARN:
        console.warn(message, logEntry.context, logEntry.error)
        break
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message, logEntry.context, logEntry.error)
        break
    }
  }

  private async sendToRemoteLogger(logEntry: LogEntry): Promise<void> {
    try {
      // In production, integrate with services like Sentry, LogRocket, etc.
      // For now, we'll use a placeholder
      const payload = {
        ...logEntry,
        environment: process.env.NODE_ENV,
        version: process.env.NEXT_PUBLIC_APP_VERSION
      }

      // Example: await fetch('/api/logs', { method: 'POST', body: JSON.stringify(payload) })
      
    } catch (error) {
      // Silent fail for remote logging to prevent infinite loops
      console.error('Failed to send log to remote service:', error)
    }
  }

  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase()
    const stack = error.stack?.toLowerCase() || ''

    if (message.includes('auth') || message.includes('login') || message.includes('token')) {
      return ErrorCategory.AUTHENTICATION
    }

    if (message.includes('database') || message.includes('sql') || message.includes('connection')) {
      return ErrorCategory.DATABASE
    }

    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return ErrorCategory.NETWORK
    }

    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return ErrorCategory.VALIDATION
    }

    if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
      return ErrorCategory.AUTHORIZATION
    }

    if (stack.includes('supabase') || message.includes('api')) {
      return ErrorCategory.EXTERNAL_SERVICE
    }

    return ErrorCategory.SYSTEM
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Circuit Breaker for handling repeated failures
export class CircuitBreaker {
  private failures = 0
  private lastFailTime = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000,
    private errorHandler: ErrorHandler
  ) {}

  async execute<T>(
    operation: () => Promise<T>,
    context: ErrorContext = {}
  ): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailTime > this.timeout) {
        this.state = 'HALF_OPEN'
        this.errorHandler.logInfo('Circuit breaker transitioning to HALF_OPEN', ErrorCategory.SYSTEM, context)
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable')
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure(error as Error, context)
      throw error
    }
  }

  private onSuccess(): void {
    this.failures = 0
    this.state = 'CLOSED'
  }

  private onFailure(error: Error, context: ErrorContext): void {
    this.failures++
    this.lastFailTime = Date.now()

    this.errorHandler.logError(error, ErrorCategory.SYSTEM, {
      ...context,
      circuitBreakerFailures: this.failures,
      circuitBreakerState: this.state
    })

    if (this.failures >= this.threshold) {
      this.state = 'OPEN'
      this.errorHandler.logError(
        'Circuit breaker opened due to repeated failures',
        ErrorCategory.SYSTEM,
        {
          ...context,
          threshold: this.threshold,
          failures: this.failures
        }
      )
    }
  }

  getState(): { state: string; failures: number; lastFailTime: number } {
    return {
      state: this.state,
      failures: this.failures,
      lastFailTime: this.lastFailTime
    }
  }
}

// Retry mechanism with exponential backoff
export class RetryHandler {
  constructor(private errorHandler: ErrorHandler) {}

  async retry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number
      baseDelay?: number
      maxDelay?: number
      exponential?: boolean
      context?: ErrorContext
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 30000,
      exponential = true,
      context = {}
    } = options

    let lastError: Error

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation()
        
        if (attempt > 0) {
          this.errorHandler.logInfo(
            `Operation succeeded after ${attempt} retries`,
            ErrorCategory.SYSTEM,
            { ...context, attempt, maxRetries }
          )
        }
        
        return result
      } catch (error) {
        lastError = error as Error

        if (attempt === maxRetries) {
          this.errorHandler.logError(
            `Operation failed after ${maxRetries} retries`,
            ErrorCategory.SYSTEM,
            {
              ...context,
              attempt,
              maxRetries,
              finalError: lastError.message
            }
          )
          break
        }

        const delay = exponential 
          ? Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
          : baseDelay

        this.errorHandler.logWarning(
          `Operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`,
          ErrorCategory.SYSTEM,
          {
            ...context,
            attempt: attempt + 1,
            delay,
            error: lastError.message
          }
        )

        await this.sleep(delay)
      }
    }

    throw lastError!
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Global error handler instance
export const errorHandler = new ErrorHandler({
  logLevel: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
  enableConsoleOutput: true,
  enableRemoteLogging: process.env.NODE_ENV === 'production'
})

// Global circuit breaker instances for critical services
export const authCircuitBreaker = new CircuitBreaker(3, 30000, errorHandler)
export const dbCircuitBreaker = new CircuitBreaker(5, 60000, errorHandler)
export const apiCircuitBreaker = new CircuitBreaker(10, 30000, errorHandler)

// Global retry handler
export const retryHandler = new RetryHandler(errorHandler)

// Utility functions for common error handling patterns
export const withErrorHandling = <T>(
  operation: () => Promise<T>,
  context: ErrorContext = {},
  fallback?: T
) => errorHandler.handleAsync(operation, context, fallback)

export const withRetry = <T>(
  operation: () => Promise<T>,
  options: Parameters<RetryHandler['retry']>[1] = {}
) => retryHandler.retry(operation, options)

export const withCircuitBreaker = <T>(
  operation: () => Promise<T>,
  breaker: CircuitBreaker,
  context: ErrorContext = {}
) => breaker.execute(operation, context)

// Global error boundary for React components
export { ErrorBoundary } from './error-boundary' 