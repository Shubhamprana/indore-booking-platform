"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function RegisterCompletePage() {
  const router = useRouter()

  useEffect(() => {
    // Automatically redirect to welcome page after 5 seconds
    const redirectTimeout = setTimeout(() => {
      router.push("/welcome")
    }, 5000)

    return () => clearTimeout(redirectTimeout)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">BookNow</span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Pre-Launch
            </Badge>
          </Link>
          
          <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h1>
            <p className="text-gray-600 mb-6">
              Welcome to the BookNow family! You'll be redirected to your dashboard in a moment.
            </p>
            
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            
            <div className="mt-4">
              <Link 
                href="/welcome" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Click here if you're not redirected automatically
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 