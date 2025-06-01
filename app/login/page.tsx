"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Mail, Lock, Eye, EyeOff, Calendar, ArrowRight, Smartphone, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { login } from "@/lib/auth"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    rememberMe: false,
  })

  const { toast } = useToast()
  const router = useRouter()

  // Handle client-side mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const credentials = {
        email: loginMethod === "email" ? formData.email : formData.phone,
        password: formData.password,
      }

      const result = await login(credentials)

      toast({
        title: "Welcome back! 🎉",
        description: `Successfully logged in as ${result.profile.full_name}`,
      })

      // Redirect based on user type
      if (result.profile.user_type === "business") {
        router.push("/business/dashboard")
      } else {
        router.push("/profile")
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">FastBookr</span>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
            <p className="text-gray-600">Sign in to your account to continue booking</p>
          </div>
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <div className="animate-pulse space-y-6">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">FastBookr</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600 mb-4">Sign in to your account to continue booking</p>
          
          {/* Home Button */}
          <div className="mb-6">
            <Link href="/">
              <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            {/* Login Method Toggle */}
            <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
              <button
                type="button"
                onClick={() => setLoginMethod("email")}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  loginMethod === "email" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
                suppressHydrationWarning
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod("phone")}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  loginMethod === "phone" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
                suppressHydrationWarning
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Phone
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
              {/* Email/Phone Input */}
              <div className="space-y-2">
                <Label htmlFor={loginMethod}>{loginMethod === "email" ? "Email Address" : "Phone Number"}</Label>
                <div className="relative">
                  {loginMethod === "email" ? (
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  ) : (
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  )}
                  <Input
                    id={loginMethod}
                    type={loginMethod === "email" ? "email" : "tel"}
                    placeholder={loginMethod === "email" ? "Enter your email" : "Enter your phone number"}
                    value={loginMethod === "email" ? formData.email : formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [loginMethod]: e.target.value,
                      })
                    }
                    className="pl-10"
                    required
                    disabled={isLoading}
                    suppressHydrationWarning
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                    suppressHydrationWarning
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                    suppressHydrationWarning
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: checked as boolean })}
                    disabled={isLoading}
                    suppressHydrationWarning
                  />
                  <Label htmlFor="rememberMe" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6 text-lg"
                disabled={isLoading}
                suppressHydrationWarning
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6">
              <Separator className="relative">
                <span className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 bg-white px-4 text-sm text-gray-500 text-center">
                  Or continue with
                </span>
              </Separator>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="py-6" disabled={isLoading} suppressHydrationWarning>
                <Image src="/placeholder.svg?height=20&width=20" alt="Google" width={20} height={20} className="mr-2" />
                Google
              </Button>
              <Button variant="outline" className="py-6" disabled={isLoading} suppressHydrationWarning>
                <Image
                  src="/placeholder.svg?height=20&width=20"
                  alt="Facebook"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                Facebook
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign up for free
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
            <span>🔒 Secure Login</span>
            <span>🛡️ Privacy Protected</span>
            <span>⚡ Instant Access</span>
          </div>
        </div>

        {/* Demo Credentials */}
        {/* <Card className="bg-blue-50 border-blue-200"> */}
          {/* <CardContent className="p-4"> */}
            {/* <div className="flex items-start space-x-2"> */}
              {/* <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" /> */}
              {/* <div className="text-sm text-blue-800"> */}
                {/* <p className="font-medium mb-1">Demo Credentials:</p> */}
                {/* <p>Email: demo@booknow.com</p> */}
                {/* <p>Password: demo123</p> */}
              {/* </div> */}
            {/* </div> */}
          {/* </CardContent> */}
        {/* </Card> */}
      </div>
    </div>
  )
}
