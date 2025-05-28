/**
 * Hydration utilities to prevent client-server mismatches in Next.js
 */

import { useEffect, useState } from "react"

/**
 * Hook to check if component is mounted (client-side)
 * Prevents hydration mismatches for dynamic content
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

/**
 * Hook to safely use localStorage/sessionStorage
 * Returns null during SSR to prevent hydration mismatches
 */
export function useClientStorage<T>(
  key: string,
  defaultValue: T,
  storageType: 'localStorage' | 'sessionStorage' = 'localStorage'
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(defaultValue)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    try {
      const storage = storageType === 'localStorage' ? localStorage : sessionStorage
      const storedValue = storage.getItem(key)
      if (storedValue !== null) {
        setValue(JSON.parse(storedValue))
      }
    } catch (error) {
      console.warn(`Failed to read from ${storageType}:`, error)
    }
  }, [key, storageType])

  const setStoredValue = (newValue: T) => {
    setValue(newValue)
    
    if (isClient) {
      try {
        const storage = storageType === 'localStorage' ? localStorage : sessionStorage
        storage.setItem(key, JSON.stringify(newValue))
      } catch (error) {
        console.warn(`Failed to write to ${storageType}:`, error)
      }
    }
  }

  return [value, setStoredValue]
}

/**
 * Safe check for browser environment
 */
export const isBrowser = typeof window !== 'undefined'

/**
 * Safe way to use browser APIs that might not exist during SSR
 */
export function safelyUseBrowserAPI<T>(
  browserCallback: () => T,
  fallback: T
): T {
  if (isBrowser) {
    try {
      return browserCallback()
    } catch (error) {
      console.warn('Browser API error:', error)
      return fallback
    }
  }
  return fallback
}

/**
 * Generate stable IDs that won't change between server and client
 * Useful for components that need consistent IDs
 */
let idCounter = 0
export function useStableId(prefix = 'id'): string {
  const [id] = useState(() => {
    if (isBrowser) {
      // On client, use counter
      return `${prefix}-${++idCounter}`
    }
    // On server, use stable fallback
    return `${prefix}-ssr`
  })
  
  return id
}

/**
 * Hook for handling dates that might differ between server and client
 * Always returns the same date on server and client until hydration
 */
export function useStableDate(initialDate?: Date) {
  const [date, setDate] = useState(() => initialDate || new Date('2024-01-01'))
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
    if (!initialDate) {
      setDate(new Date())
    }
  }, [initialDate])

  return { date, isHydrated }
} 