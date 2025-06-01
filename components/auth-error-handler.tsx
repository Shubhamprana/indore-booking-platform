"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

export function AuthErrorHandler() {
  const [authError, setAuthError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' && !session) {
          // Check if this was due to a refresh token error
          const lastError = sessionStorage.getItem('auth-error')
          if (lastError?.includes('refresh')) {
            setAuthError("Your session has expired. Please sign in again.")
            sessionStorage.removeItem('auth-error')
          }
        }
      }
    )

    // Listen for auth errors globally
    const handleAuthError = (error: any) => {
      if (error?.message?.includes("refresh_token_not_found") || 
          error?.message?.includes("Invalid Refresh Token")) {
        setAuthError("Your session has expired. Please sign in again.")
        sessionStorage.setItem('auth-error', error.message)
      }
    }

    // Override console.error temporarily to catch auth errors
    const originalConsoleError = console.error
    console.error = (...args: any[]) => {
      const message = args.join(' ')
      if (message.includes('AuthApiError') && message.includes('refresh')) {
        handleAuthError({ message })
      }
      originalConsoleError(...args)
    }

    return () => {
      subscription.unsubscribe()
      console.error = originalConsoleError
    }
  }, [])

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await supabase.auth.signOut()
      setAuthError(null)
      // Redirect to login page
      window.location.href = '/login'
    } catch (error) {
      console.error('Error during retry:', error)
    } finally {
      setIsRetrying(false)
    }
  }

  const handleDismiss = () => {
    setAuthError(null)
    sessionStorage.removeItem('auth-error')
  }

  if (!authError) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          {authError}
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              className="h-8 text-xs"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Signing out...
                </>
              ) : (
                'Sign In Again'
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismiss}
              className="h-8 text-xs"
            >
              Dismiss
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
} 