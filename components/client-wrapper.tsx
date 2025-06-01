"use client"

import { useEffect, useState } from "react"

interface ClientWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ClientWrapper({ children, fallback }: ClientWrapperProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Set a small timeout to ensure DOM is ready
    const timer = setTimeout(() => {
    setIsClient(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // During SSR and before hydration, show a consistent loading state
  if (!isClient) {
    return (
      <div suppressHydrationWarning>
        {fallback || (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Only render children after client-side hydration
  return <div suppressHydrationWarning>{children}</div>
} 