"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RefreshCw, Home, AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong!</h1>
          <p className="text-gray-600 mb-8">
            We apologize for the inconvenience. An unexpected error occurred while processing your request.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={reset}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Link href="/">
            <Button variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>If this problem persists, please <Link href="/contact" className="text-blue-600 hover:underline">contact our support team</Link></p>
          {error.digest && (
            <p className="mt-2 font-mono text-xs bg-gray-100 p-2 rounded">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 