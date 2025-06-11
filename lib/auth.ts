import {
  supabase,
  createUser,
  getUserByEmail,
  getUserByReferralCode,
  createUserActivity,
  initializeUserStats,
  calculateAndUpdateUserStats
} from "./supabase"
import { processReferral } from "./user-stats"
import { 
  grantInitialBusinessBonus, 
  processBusinessReferral, 
  isBusinessUser,
  initializeBusinessDashboard 
} from "./business-subscription"

// Utility function to handle auth errors
export const handleAuthError = async (error: any) => {
  if (error?.message?.includes("refresh_token_not_found") || 
      error?.message?.includes("Invalid Refresh Token") ||
      error?.message?.includes("refresh token")) {
    console.warn("Refresh token issue detected, signing out user")
    try {
      await supabase.auth.signOut()
    } catch (signOutError) {
      console.error("Error during emergency sign out:", signOutError)
    }
    // Optionally reload the page to clear any stale state
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
    return true // Indicates error was handled
  }
  return false // Indicates error was not a refresh token issue
}

// Enhanced function to safely get current user with error handling
export const getCurrentUserSafe = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      const handled = await handleAuthError(error)
      if (handled) return null
      throw new Error(`Failed to get current user: ${error.message}`)
    }
    
    return user
  } catch (error) {
    console.error("Get current user error:", error)
    await handleAuthError(error)
    return null
  }
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  fullName: string
  phone: string
  location: string
  userType: "customer" | "business"
  referralCode?: string
  serviceInterests?: string[]
  businessName?: string
  businessCategory?: string
  businessDescription?: string
  currentBookingMethod?: string
  launchInterest?: number
  marketingConsent?: boolean
  whatsappUpdates?: boolean
  earlyAccessInterest?: boolean
  shareOnSocial?: boolean
}

export interface LoginData {
  email: string
  password: string
}

export const login = async (loginData: LoginData) => {
  try {
    // Validate input
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(loginData.email)) {
      throw new Error("Please enter a valid email address")
    }
    if (!loginData.password) {
      throw new Error("Password is required")
    }

    // Clear any existing invalid session before login
    try {
      await supabase.auth.signOut()
    } catch (signOutError) {
      // Ignore sign out errors as user might not be signed in
      console.log("Pre-login cleanup (expected if not signed in):", signOutError)
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginData.email.toLowerCase(),
      password: loginData.password,
    })

    if (error) {
      const handled = await handleAuthError(error)
      if (handled) {
        throw new Error("Authentication session expired. Please try logging in again.")
      }
      
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Invalid email or password")
      }
      throw new Error(`Login failed: ${error.message}`)
    }

    if (!data.user) {
      throw new Error("Login failed")
    }

    // Get user profile efficiently with minimal data
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, email, full_name, user_type, business_name")
      .eq("email", loginData.email.toLowerCase())
      .single()

    if (profileError) {
      throw new Error(`Profile lookup failed: ${profileError.message}`)
    }

    return {
      user: data.user,
      profile,
      message: "Login successful!",
    }
  } catch (error) {
    console.error("Login error:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Login failed. Please try again.")
  }
}

export const register = async (registerData: RegisterData) => {
  const startTime = Date.now()
  console.log('🚀 Starting registration process...')
  
  try {
    // Quick database connectivity check
    console.log('🔍 Checking database connectivity...')
    const dbCheckStart = Date.now()
    try {
      const { data, error } = await supabase.from('users').select('id').limit(1)
      if (error) {
        console.error('❌ Database connectivity issue:', error)
        throw new Error('Database connection failed. Please try again later.')
      }
      console.log('✅ Database connectivity check:', Date.now() - dbCheckStart, 'ms')
    } catch (dbError) {
      console.error('❌ Database check failed:', dbError)
      throw new Error('Unable to connect to database. Please check your internet connection and try again.')
    }

    // Validate input
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(registerData.email)) {
      throw new Error("Please enter a valid email address")
    }
    if (registerData.password.length < 6) {
      throw new Error("Password must be at least 6 characters long")
    }
    if (!registerData.fullName.trim()) {
      throw new Error("Full name is required")
    }
    if (!registerData.phone?.trim()) {
      throw new Error("Phone number is required")
    }
    if (!registerData.location) {
      throw new Error("Location is required")
    }

    console.log('✅ Input validation completed:', Date.now() - startTime, 'ms')

    // Create Supabase auth user (Supabase handles duplicate email detection)
    const authStartTime = Date.now()
    console.log('🔐 Starting Supabase auth signup...')
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: registerData.email.toLowerCase(),
      password: registerData.password,
    })

    console.log('🔐 Supabase auth completed:', Date.now() - authStartTime, 'ms')

    if (authError) {
      console.error('❌ Auth error:', authError)
      // Handle specific auth errors with user-friendly messages
      if (authError.message.includes("User already registered") || 
          authError.message.includes("already registered") ||
          authError.message.includes("already exists")) {
        throw new Error("An account with this email already exists")
      }
      throw new Error(`Registration failed: ${authError.message}`)
    }
    if (!authData.user) {
      throw new Error("Failed to create user account")
    }

    console.log('📝 Starting user profile creation...')
    const profileStartTime = Date.now()

    // Create user profile (critical path) with timeout protection
    let userProfile
    try {
      userProfile = await Promise.race([
        createUser({
      id: authData.user.id,
      email: registerData.email.toLowerCase(),
      full_name: registerData.fullName,
      phone: registerData.phone,
      location: registerData.location,
      user_type: registerData.userType,
      referral_code: generateReferralCode(),
      service_interests: registerData.serviceInterests || [],
      business_name: registerData.businessName,
      business_category: registerData.businessCategory,
      business_description: registerData.businessDescription,
      current_booking_method: registerData.currentBookingMethod,
      launch_interest: registerData.launchInterest || 5,
      marketing_consent: registerData.marketingConsent || false,
      whatsapp_updates: registerData.whatsappUpdates || false,
      early_access_interest: registerData.earlyAccessInterest || false,
      share_on_social: registerData.shareOnSocial || false,
      email_verified: false,
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('User profile creation timed out')), 8000)
        )
      ])
      
      console.log('📝 User profile created:', Date.now() - profileStartTime, 'ms')
    } catch (profileError) {
      console.error('❌ Profile creation error:', profileError)
      // If profile creation fails, we still have the auth user, so let's try a minimal approach
      throw new Error('Registration is taking longer than expected. Please try again or contact support.')
    }

    console.log('✅ Critical path completed in:', Date.now() - startTime, 'ms')

    // Initialize user stats immediately (critical for points/credits)
    console.log('📊 Initializing user stats...')
    const statsStartTime = Date.now()
    try {
      await initializeUserStats(userProfile.id)
      console.log('📊 User stats initialized:', Date.now() - statsStartTime, 'ms')
    } catch (statsError) {
      console.error('❌ Stats initialization error:', statsError)
      // Don't throw - continue with registration
    }

    // Create registration activity immediately (critical for recent activity)
    console.log('📝 Creating registration activity...')
    const activityStartTime = Date.now()
    try {
      const activityDescription = registerData.userType === "business" 
        ? "Successfully registered as a business partner! Welcome bonus: LIFETIME FREE pro subscription! 🎉"
        : "Successfully registered for FastBookr pre-launch"
      
      await createUserActivity(
        userProfile.id, 
        "registration", 
        activityDescription, 
        100, // Give 100 points for registration
        {
          user_type: registerData.userType,
          registration_source: "web",
          launch_interest: registerData.launchInterest,
          initial_bonus: registerData.userType === "business" ? "lifetime_pro" : "none",
          reward_amount: registerData.userType === "business" ? 0 : 25 // ₹25 welcome credit for customers
        }
      )
      console.log('📝 Registration activity created:', Date.now() - activityStartTime, 'ms')
    } catch (activityError) {
      console.error('❌ Registration activity error:', activityError)
      // Don't throw - continue with registration
    }

    // Process heavy operations in background (fully non-blocking)
    const processBackgroundTasks = async () => {
      try {
        console.log('🔄 Starting background tasks...')
        const bgStartTime = Date.now()

        // Send welcome email immediately (non-blocking)
        setTimeout(async () => {
          try {
            console.log('📧 Attempting to send welcome email in background...')
            
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)
            
            const response = await fetch('/api/welcome-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userEmail: registerData.email.toLowerCase(),
              userName: registerData.fullName,
              userType: registerData.userType,
              referralCode: userProfile.referral_code,
              hasReferralReward: !!registerData.referralCode,
              businessBonus: registerData.userType === 'business'
            }),
              signal: controller.signal
          })

            clearTimeout(timeoutId)

            if (response.ok) {
              console.log('Welcome email sent successfully in background')
              createUserActivity(
                userProfile.id,
                "notification",
                "Welcome email sent successfully! Check your inbox.",
                0,
                { email_status: "sent", email_type: "welcome" }
              ).catch(() => {})
          } else {
              console.log('Welcome email failed - server responded with error')
              createUserActivity(
                userProfile.id,
                "notification", 
                "Welcome email delivery is temporarily delayed. You'll receive it shortly.",
                0,
                { email_status: "delayed", error_type: "server_error" }
              ).catch(() => {})
          }
        } catch (error) {
            if (error.name === 'AbortError') {
              console.log('Welcome email timed out (5s) - this is normal')
            } else {
              console.log('Welcome email network issue - this is normal')
            }
            createUserActivity(
              userProfile.id, 
              "notification",
              "Welcome email delivery is temporarily delayed due to network issues. You'll receive it shortly.",
              0,
              { email_status: "delayed", error_type: "network_timeout" }
            ).catch(() => {})
          }
        }, 50) // Very small delay

        // Handle business operations (non-blocking)
        if (registerData.userType === "business") {
          setTimeout(async () => {
            try {
              // Run business operations in parallel without waiting
              Promise.allSettled([
            initializeBusinessDashboard(userProfile.id),
            grantInitialBusinessBonus(userProfile.id)
              ]).then(() => {
                console.log('🏢 Business operations completed')
              }).catch(() => {
                console.log('🏢 Business operations had some issues (non-critical)')
              })
            } catch (businessError) {
              console.log('Business operations will be retried later')
            }
          }, 100)
        }

        // Handle referral processing (non-blocking)
    if (registerData.referralCode) {
          setTimeout(async () => {
          try {
            const referrer = await getUserByReferralCode(registerData.referralCode)
            if (referrer) {
              const referrerIsBusiness = await isBusinessUser(referrer.id)
              const referredIsBusiness = registerData.userType === "business"
              
                // Process referral without waiting for completion
              if (referrerIsBusiness && referredIsBusiness) {
                  processBusinessReferral(referrer.id, userProfile.id, registerData.referralCode)
                    .then(() => console.log('Business referral processed'))
                    .catch(() => console.log('Business referral will be retried'))
              } else {
                  processReferral(referrer.id, userProfile.id, registerData.referralCode)
                    .then(() => console.log('Regular referral processed'))
                    .catch(() => console.log('Regular referral will be retried'))
                }
                
                // Create activity without waiting
                createUserActivity(
                  userProfile.id,
                  "referral_used",
                  `Successfully joined using referral code ${registerData.referralCode}. Bonus credits applied!`,
                  50,
                  { 
                    referral_code: registerData.referralCode,
                    referrer_id: referrer.id,
                    reward_amount: 25
                  }
                ).catch(() => {})
            }
          } catch (referralError) {
              console.log("Referral processing will be retried later")
            
            if (referralError instanceof Error && referralError.message?.includes("No user found with referral code")) {
                createUserActivity(
                userProfile.id, 
                "notification", 
                `Invalid referral code '${registerData.referralCode}' was entered during registration`, 
                0, 
                { 
                  referral_code: registerData.referralCode, 
                  error_type: "invalid_code",
                  message: "The referral code you entered doesn't exist. You can still earn rewards by referring others!"
                }
                ).catch(() => {})
              }
            }
          }, 150)
        }

        // Send Pro subscription confirmation for business users (non-referral)
        if (registerData.userType === 'business' && !registerData.referralCode) {
          setTimeout(async () => {
            try {
              const controller = new AbortController()
              const timeoutId = setTimeout(() => controller.abort(), 5000)
              
              const response = await fetch('/api/reward-notification', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userEmail: registerData.email.toLowerCase(),
                  userName: registerData.fullName,
                  rewardType: 'pro_subscription',
                  description: `🎉 Welcome to FastBookr Business! Your LIFETIME FREE Pro subscription is now active. Enjoy unlimited premium features with no monthly fees, ever!`,
                  source: 'Business Registration - Lifetime Pro Bonus',
                  amount: 'LIFETIME'
                }),
                signal: controller.signal
              })

              clearTimeout(timeoutId)

              if (response.ok) {
                console.log(`✅ Pro subscription confirmation sent to ${registerData.email}`)
              } else {
                console.log(`⚠️ Pro subscription email queued for retry`)
              }
            } catch (proEmailError) {
              console.log(`⚠️ Pro subscription email will be retried later`)
            }
          }, 200)
        }

        // Recalculate user stats (non-blocking)
        setTimeout(() => {
          calculateAndUpdateUserStats(userProfile.id)
            .then(() => console.log('📊 User stats recalculated after background tasks'))
            .catch(() => console.log('📊 User stats will be recalculated later'))
        }, 300)

        console.log('🔄 Background tasks scheduled in:', Date.now() - bgStartTime, 'ms')
      } catch (backgroundError) {
        console.log("Background processing scheduled for later retry")
      }
    }

    // Start background processing without waiting
    setTimeout(() => {
    processBackgroundTasks()
    }, 10) // Very small delay to ensure registration returns first

    console.log('🎉 Registration completed successfully in:', Date.now() - startTime, 'ms')

    return {
      user: authData.user,
      profile: userProfile,
      message: "Registration successful! Please check your email to verify your account.",
    }
  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error("Registration error after", totalTime, "ms:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Registration failed. Please try again.")
  }
}

// Cleanup utility to clear corrupted auth state
export const cleanupAuthState = async () => {
  try {
    // Check if we have a session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error && (error.message.includes("refresh_token_not_found") || 
                  error.message.includes("Invalid Refresh Token"))) {
      console.log("Cleaning up corrupted auth state")
      await supabase.auth.signOut()
      
      // Clear any cached auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb-auth-token')
        sessionStorage.removeItem('auth-error')
      }
      
      // Clear user cache
      currentUserCache = null
      
      return true // Indicates cleanup was performed
    }
    
    return false // No cleanup needed
  } catch (error) {
    console.error("Error during auth cleanup:", error)
    // Force cleanup if there's any error
    try {
      await supabase.auth.signOut()
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb-auth-token')
        sessionStorage.removeItem('auth-error')
      }
      currentUserCache = null
    } catch (cleanupError) {
      console.error("Force cleanup error:", cleanupError)
    }
    return true
  }
}

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(`Logout failed: ${error.message}`)
    }
    
    // Clear cache and storage
    currentUserCache = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sb-auth-token')
      sessionStorage.removeItem('auth-error')
    }
    
    return { message: "Logged out successfully" }
  } catch (error) {
    console.error("Logout error:", error)
    throw new Error("Logout failed. Please try again.")
  }
}

// Cache for current user data
let currentUserCache: { user: any, profile: any, timestamp: number } | null = null
const CURRENT_USER_CACHE_DURATION = 30000 // 30 seconds

export const getCurrentUser = async () => {
  try {
    // Check cache first
    if (currentUserCache && (Date.now() - currentUserCache.timestamp) < CURRENT_USER_CACHE_DURATION) {
      return currentUserCache
    }

    const user = await getCurrentUserSafe()
    
    if (!user) {
      currentUserCache = null
      return null
    }

    // Get minimal profile data efficiently
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, email, full_name, user_type, business_name, referral_code")
      .eq("email", user.email!)
      .single()

    if (profileError) {
      console.error("Profile fetch error:", profileError)
      currentUserCache = null
      return null
    }

    const result = { user, profile }
    
    // Cache the result
    currentUserCache = {
      ...result,
      timestamp: Date.now()
    }

    return result
  } catch (error) {
    console.error("Get current user error:", error)
    await handleAuthError(error)
    currentUserCache = null
    return null
  }
}

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      throw new Error(`Password reset failed: ${error.message}`)
    }
    return { message: "Password reset email sent!" }
  } catch (error) {
    console.error("Reset password error:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Password reset failed. Please try again.")
  }
}

export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update(profileData)
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`)
    }
    return data
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

export const generateReferralCode = (): string => {
  // Generate a 8-character code to fit within 10-character database limit
  // Format: BN + 6 random alphanumeric characters = 8 total
  return `BN${Math.random().toString(36).substring(2, 8).toUpperCase()}`
}
