/**
 * UI Refresh Utility
 * Manages UI state updates and ensures components display current information
 */

import { clearFollowCaches } from './follow-system'
import { clearUserStatsCache } from './user-stats'

// Event emitter for UI updates
class UIRefreshManager {
  private listeners: Map<string, Set<() => void>> = new Map()

  /**
   * Subscribe to refresh events
   */
  on(event: string, callback: () => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  /**
   * Emit refresh event
   */
  emit(event: string) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback()
        } catch (error) {
          console.error(`Error in UI refresh callback for ${event}:`, error)
        }
      })
    }
  }

  /**
   * Clear all listeners for an event
   */
  clear(event?: string) {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }

  /**
   * Get listener events
   */
  getListenerEvents() {
    return Array.from(this.listeners.keys())
  }

  /**
   * Get total listeners
   */
  getTotalListeners() {
    return Array.from(this.listeners.values())
      .reduce((sum, set) => sum + set.size, 0)
  }
}

// Global UI refresh manager
export const uiRefreshManager = new UIRefreshManager()

// Refresh events
export const UI_REFRESH_EVENTS = {
  PROFILE_UPDATED: 'profile_updated',
  FOLLOW_STATUS_CHANGED: 'follow_status_changed',
  USER_STATS_UPDATED: 'user_stats_updated',
  BUSINESS_DASHBOARD_UPDATED: 'business_dashboard_updated',
  AUTHENTICATION_CHANGED: 'authentication_changed',
  SEARCH_RESULTS_UPDATED: 'search_results_updated',
  REFERRAL_PROCESSED: 'referral_processed',
  SUBSCRIPTION_CHANGED: 'subscription_changed'
} as const

/**
 * Refresh user profile information across all components
 */
export const refreshUserProfile = (userId: string) => {
  // Clear relevant caches
  clearUserStatsCache(userId)
  
  // Emit refresh events
  uiRefreshManager.emit(UI_REFRESH_EVENTS.PROFILE_UPDATED)
  uiRefreshManager.emit(UI_REFRESH_EVENTS.USER_STATS_UPDATED)
}

/**
 * Refresh follow-related UI components
 */
export const refreshFollowSystem = () => {
  // Clear follow caches
  clearFollowCaches()
  
  // Emit refresh events
  uiRefreshManager.emit(UI_REFRESH_EVENTS.FOLLOW_STATUS_CHANGED)
  uiRefreshManager.emit(UI_REFRESH_EVENTS.SEARCH_RESULTS_UPDATED)
}

/**
 * Refresh business dashboard information
 */
export const refreshBusinessDashboard = () => {
  uiRefreshManager.emit(UI_REFRESH_EVENTS.BUSINESS_DASHBOARD_UPDATED)
}

/**
 * Refresh authentication state across components
 */
export const refreshAuthenticationState = () => {
  uiRefreshManager.emit(UI_REFRESH_EVENTS.AUTHENTICATION_CHANGED)
}

/**
 * Refresh all UI components
 */
export const refreshAllUI = (userId?: string) => {
  if (userId) {
    clearUserStatsCache(userId)
  }
  clearFollowCaches()
  
  // Emit all refresh events
  Object.values(UI_REFRESH_EVENTS).forEach(event => {
    uiRefreshManager.emit(event)
  })
}

/**
 * Hook for components to subscribe to UI refresh events
 */
export const useUIRefresh = (events: string[], callback: () => void) => {
  if (typeof window === 'undefined') return

  const unsubscribeFunctions: (() => void)[] = []

  events.forEach(event => {
    const unsubscribe = uiRefreshManager.on(event, callback)
    unsubscribeFunctions.push(unsubscribe)
  })

  // Return cleanup function
  return () => {
    unsubscribeFunctions.forEach(unsubscribe => unsubscribe())
  }
}

/**
 * Force refresh specific component types
 */
export const forceRefreshComponents = {
  profile: () => uiRefreshManager.emit(UI_REFRESH_EVENTS.PROFILE_UPDATED),
  followSystem: () => uiRefreshManager.emit(UI_REFRESH_EVENTS.FOLLOW_STATUS_CHANGED),
  userStats: () => uiRefreshManager.emit(UI_REFRESH_EVENTS.USER_STATS_UPDATED),
  businessDashboard: () => uiRefreshManager.emit(UI_REFRESH_EVENTS.BUSINESS_DASHBOARD_UPDATED),
  authentication: () => uiRefreshManager.emit(UI_REFRESH_EVENTS.AUTHENTICATION_CHANGED),
  searchResults: () => uiRefreshManager.emit(UI_REFRESH_EVENTS.SEARCH_RESULTS_UPDATED)
}

/**
 * Debug function to log current listeners
 */
export const debugUIRefresh = () => {
  console.log('UI Refresh Listeners:', {
    events: Array.from(uiRefreshManager.getListenerEvents()),
    totalListeners: uiRefreshManager.getTotalListeners()
  })
} 