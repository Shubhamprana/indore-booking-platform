"use client"

import { useEffect, useState } from "react"

interface NoSSRProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * NoSSR component prevents server-side rendering of its children
 * and only renders them after client-side hydration is complete.
 * This helps prevent hydration mismatches for dynamic content.
 */
export default function NoSSR({ children, fallback = null }: NoSSRProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
} 