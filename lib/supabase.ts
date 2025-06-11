import { createClient } from "@supabase/supabase-js"

// Function to get environment variables with validation
const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  
  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    )
  }
  
  // Validate URL format
  try {
    new URL(url)
  } catch {
    throw new Error('Invalid Supabase URL format. Please check your NEXT_PUBLIC_SUPABASE_URL environment variable.')
  }
  
  return { url, anonKey }
}

// Create Supabase client with validated config and proper auth settings
const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig()
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sb-auth-token',
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'booknow-app@1.0.0'
    }
  }
})

// Core interfaces
export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  location?: string
  user_type: "customer" | "business"
  referral_code: string
  service_interests?: string[]
  business_name?: string
  business_category?: string
  business_description?: string
  current_booking_method?: string
  launch_interest?: number
  marketing_consent?: boolean
  whatsapp_updates?: boolean
  early_access_interest?: boolean
  share_on_social?: boolean
  email_verified?: boolean
  bio?: string
  profile_image_url?: string
  created_at: string
  updated_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_user_id: string
  referral_code: string
  status: string
  reward_amount: number
  created_at: string
}

export interface UserActivity {
  id: string
  user_id: string
  activity_type: string
  description: string
  reward_points: number
  reward_amount: number
  metadata?: any
  created_at: string
}

export interface UserStats {
  user_id: string
  total_referrals: number
  successful_referrals: number
  total_credits_earned: number
  total_points: number
  achievements_count: number
  position_rank?: number
  last_calculated_at: string
}

// Cache for user stats
const userStatsCache = new Map<string, { stats: UserStats | null, timestamp: number }>()
const USER_STATS_CACHE_DURATION = 60000 // 1 minute

// User operations
export const getUserByEmail = async (email: string): Promise<User> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single()

  if (error) {
    throw new Error(`No user found with email: ${email}`)
  }
  return data
}

export const getUserByReferralCode = async (referralCode: string): Promise<User> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .ilike("referral_code", referralCode)
    .single()

  if (error) {
    throw new Error(`No user found with referral code: ${referralCode}`)
  }
  return data
}

export const createUser = async (userData: {
  id: string // This should be the UUID from Supabase Auth
  email: string
  full_name: string
  phone: string
  location: string
  user_type: "customer" | "business"
  referral_code: string
  service_interests?: string[]
  business_name?: string
  business_category?: string
  business_description?: string
  current_booking_method?: string
  launch_interest?: number
  marketing_consent?: boolean
  whatsapp_updates?: boolean
  early_access_interest?: boolean
  share_on_social?: boolean
  email_verified?: boolean
}) => {
  try {
    console.log('📝 Creating user profile with ID:', userData.id)
    
  const { data, error } = await supabase
    .from("users")
      .insert([{
        id: userData.id, // Use the UUID from Supabase Auth directly
        email: userData.email,
        full_name: userData.full_name,
        phone: userData.phone,
        location: userData.location,
        user_type: userData.user_type,
        referral_code: userData.referral_code,
        service_interests: userData.service_interests || [],
        business_name: userData.business_name,
        business_category: userData.business_category,
        business_description: userData.business_description,
        current_booking_method: userData.current_booking_method,
        launch_interest: userData.launch_interest || 5,
        marketing_consent: userData.marketing_consent || false,
        whatsapp_updates: userData.whatsapp_updates || false,
        early_access_interest: userData.early_access_interest || false,
        share_on_social: userData.share_on_social || false,
        email_verified: userData.email_verified || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
    .select()
    .single()

  if (error) {
      console.error('❌ User creation error:', error)
      throw new Error(`Failed to create user profile: ${error.message}`)
  }

    console.log('✅ User profile created successfully')
    return data
  } catch (error) {
    console.error("Error creating user:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Failed to create user profile")
  }
}

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User> => {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`)
  }
  return data
}

// Activity operations
export const createUserActivity = async (
  userId: string,
  activityType: string,
  description: string,
  rewardPoints: number = 0,
  metadata: any = null
): Promise<UserActivity> => {
  const rewardAmount = metadata?.reward_amount || 0.00
  
  const { data, error } = await supabase
    .from("user_activities")
    .insert([{
      user_id: userId,
      activity_type: activityType,
      description: description,
      reward_points: rewardPoints,
      reward_amount: rewardAmount,
      metadata: metadata
    }])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create activity: ${error.message}`)
  }
  return data
}

export const getUserActivities = async (userId: string, limit: number = 10): Promise<UserActivity[]> => {
  const { data, error } = await supabase
    .from("user_activities")
    .select("id, user_id, activity_type, description, reward_points, reward_amount, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching activities:", error)
    return []
  }
  return data || []
}

// Referral operations
export const getUserReferrals = async (userId: string, limit: number = 20): Promise<Referral[]> => {
  const { data, error } = await supabase
    .from("referrals")
    .select("id, referrer_id, referred_user_id, referral_code, status, reward_amount, created_at")
    .eq("referrer_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching referrals:", error)
    return []
  }
  return data || []
}

// Stats operations
export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  // Check cache first
  const cached = userStatsCache.get(userId)
  if (cached && (Date.now() - cached.timestamp) < USER_STATS_CACHE_DURATION) {
    return cached.stats
  }

  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single()

  const result = error ? null : data
  
  // Cache the result
  userStatsCache.set(userId, {
    stats: result,
    timestamp: Date.now()
  })

  return result
}

export const initializeUserStats = async (userId: string): Promise<UserStats> => {
  const { data, error } = await supabase
    .from("user_stats")
    .insert([{
      user_id: userId,
      total_referrals: 0,
      successful_referrals: 0,
      total_credits_earned: 0,
      total_points: 0,
      achievements_count: 0,
      position_rank: null
    }])
    .select()
    .single()

  if (error) {
    // If stats already exist, return them
    const existing = await getUserStats(userId)
    if (existing) {
      return existing
    }
    throw new Error(`Failed to initialize user stats: ${error.message}`)
  }
  return data
}

// Simple in-memory lock to prevent concurrent stats calculations
const statsCalculationLocks = new Set<string>()

export const calculateAndUpdateUserStats = async (userId: string): Promise<UserStats> => {
  // Prevent concurrent calculations
  if (statsCalculationLocks.has(userId)) {
    const existing = await getUserStats(userId)
    if (existing) return existing
  }

  statsCalculationLocks.add(userId)
  
  try {
    // Use more efficient queries with only needed fields
    const [referralsResult, activitiesResult, achievementsResult] = await Promise.all([
      supabase.from("referrals").select("status").eq("referrer_id", userId),
      supabase.from("user_activities").select("reward_points, reward_amount").eq("user_id", userId),
      supabase.from("achievements").select("id").eq("user_id", userId)
    ])

    const referrals = referralsResult.data || []
    const activities = activitiesResult.data || []
    const achievements = achievementsResult.data || []

    const totalReferrals = referrals.length
    const successfulReferrals = referrals.filter(r => r.status === "completed").length
    const totalCredits = activities.reduce((sum, activity) => sum + (activity.reward_amount || 0), 0)
    const totalPoints = activities.reduce((sum, activity) => sum + (activity.reward_points || 0), 0)
    const achievementsCount = achievements.length

    // Update stats
    const { data, error } = await supabase
      .from("user_stats")
      .upsert({
        user_id: userId,
        total_referrals: totalReferrals,
        successful_referrals: successfulReferrals,
        total_credits_earned: totalCredits,
        total_points: totalPoints,
        achievements_count: achievementsCount,
        last_calculated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user stats: ${error.message}`)
    }

    // Invalidate cache for this user
    userStatsCache.delete(userId)

    return data
  } catch (error) {
    console.error("Error calculating user stats:", error)
    // Return default stats if calculation fails
    const defaultStats = {
      user_id: userId,
      total_referrals: 0,
      successful_referrals: 0,
      total_credits_earned: 0,
      total_points: 0,
      achievements_count: 0,
      last_calculated_at: new Date().toISOString()
    }
    
    // Cache the default stats too
    userStatsCache.set(userId, {
      stats: defaultStats,
      timestamp: Date.now()
    })
    
    return defaultStats
  } finally {
    statsCalculationLocks.delete(userId)
  }
}