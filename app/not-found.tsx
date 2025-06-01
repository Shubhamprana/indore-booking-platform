"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl font-bold text-white">404</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or doesn't exist.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Need help? <Link href="/contact" className="text-blue-600 hover:underline">Contact us</Link></p>
        </div>
      </div>
    </div>
  )
} 