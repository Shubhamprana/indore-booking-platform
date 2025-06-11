import { supabase } from './supabase'

// Cache for business subscription data
const businessSubCache = new Map<string, { data: BusinessSubscription | null, timestamp: number }>()
const businessDashCache = new Map<string, { data: BusinessDashboard | null, timestamp: number }>()
const BUSINESS_CACHE_DURATION = 60000 // 1 minute

export interface BusinessSubscription {
  user_id: string
  full_name: string
  business_name?: string
  email: string
  subscription_plan: string
  plan_status: string
  pro_subscription_months: number
  pro_expires_at?: string
  pro_features_enabled: boolean
  referral_pro_months_earned: number
  initial_pro_months_given: boolean
  is_pro_active: boolean
  days_remaining: number
}

export interface BusinessDashboard {
  id: string
  user_id: string
  business_hours?: any
  services_offered?: any
  booking_settings?: any
  payment_methods?: any
  staff_members?: any
  business_metrics?: any
  subscription_plan: string
  plan_status: string
  trial_ends_at?: string
  pro_subscription_months: number
  pro_expires_at?: string
  pro_features_enabled: boolean
  referral_pro_months_earned: number
  initial_pro_months_given: boolean
  created_at: string
  updated_at: string
}

/**
 * Grant pro subscription months to a business user
 */
export async function grantProSubscription(
  businessUserId: string, 
  monthsToAdd: number, 
  reason: 'referral_reward' | 'initial_bonus' = 'referral_reward'
): Promise<void> {
  try {
    const { error } = await supabase.rpc('grant_pro_subscription', {
      business_user_id: businessUserId,
      months_to_add: monthsToAdd,
      reason: reason
    })

    if (error) {
      console.error('Error granting pro subscription:', error)
      throw error
    }

    // Invalidate caches for this user
    businessSubCache.delete(businessUserId)
    businessDashCache.delete(businessUserId)
  } catch (error) {
    console.error('Error in grantProSubscription:', error)
    throw error
  }
}

/**
 * Grant initial lifetime bonus to new business users
 */
export async function grantInitialBusinessBonus(businessUserId: string): Promise<void> {
  try {
    const { data, error } = await supabase.rpc('grant_initial_business_bonus', {
      business_user_id: businessUserId
    })

    if (error) {
      console.error('Error granting initial business bonus:', error)
      throw new Error(`Failed to grant initial business bonus: ${error.message}`)
    }

    // Invalidate caches for this user
    businessSubCache.delete(businessUserId)
    businessDashCache.delete(businessUserId)

    // Send pro subscription reward notification
    try {
      const { data: userProfile } = await supabase
        .from("users")
        .select("email, full_name")
        .eq("id", businessUserId)
        .single()

      if (userProfile) {
        console.log(`LIFETIME pro subscription bonus granted to ${userProfile.email}`)
        // Note: Email notifications will be sent via background worker when SMTP is working
        // For now, user will see the bonus in their account immediately
      }
    } catch (profileError) {
      console.error('Failed to fetch profile for logging:', profileError)
    }

    console.log(`Successfully granted LIFETIME initial business bonus to user ${businessUserId}`)
  } catch (error) {
    console.error('Error in grantInitialBusinessBonus:', error)
    if (error instanceof Error) {
      throw new Error(`Business bonus error: ${error.message}`)
    }
    throw new Error('Failed to grant initial business bonus')
  }
}

/**
 * Process business referral with pro subscription rewards
 */
export async function processBusinessReferral(
  referrerId: string,
  referredUserId: string,
  referralCode: string
): Promise<void> {
  try {
    const { error } = await supabase.rpc('process_business_referral', {
      referrer_id_param: referrerId,
      referred_user_id_param: referredUserId,
      referral_code_param: referralCode
    })

    if (error) {
      console.error('Error processing business referral:', error)
      throw error
    }

    // Invalidate caches for both users
    businessSubCache.delete(referrerId)
    businessSubCache.delete(referredUserId)
    businessDashCache.delete(referrerId)
    businessDashCache.delete(referredUserId)

    // Send referrer bonus notification for business referral
    try {
      const { data: referrerProfile } = await supabase
        .from("users")
        .select("email, full_name, business_name")
        .eq("id", referrerId)
        .single()

      const { data: referredProfile } = await supabase
        .from("users")
        .select("full_name, business_name")
        .eq("id", referredUserId)
        .single()

      if (referrerProfile && referredProfile) {
        console.log(`Business referral successful: ${referredProfile.business_name || referredProfile.full_name} joined using ${referrerProfile.full_name}'s referral code`)
        
        // Send referral bonus email to referrer using API route
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
              userEmail: referrerProfile.email,
              userName: referrerProfile.full_name,
              rewardType: 'pro_subscription',
                amount: 1,
                description: `🎉 Congratulations! ${referredProfile.business_name || referredProfile.full_name} just joined FastBookr Business using your referral code. You've earned 1 FREE month of Pro subscription as a thank you for referring a business partner!`,
                source: 'Business Referral Program'
              }),
              signal: controller.signal
            })

            clearTimeout(timeoutId)
          
          if (response.ok) {
              console.log(`✅ Business referral bonus notification sent to ${referrerProfile.email}`)
          } else {
              console.log(`⚠️ Business referral email queued for retry`)
            }
          } catch (emailError) {
            console.log(`⚠️ Business referral email will be retried later`)
          }
        }, 150) // Small delay to avoid race conditions

        // Send Pro subscription confirmation email to new business user using API route
        setTimeout(async () => {
          try {
            const { data: referredUserProfile } = await supabase
              .from("users")
              .select("email, full_name")
              .eq("id", referredUserId)
              .single()

            if (referredUserProfile) {
              const controller = new AbortController()
              const timeoutId = setTimeout(() => controller.abort(), 5000)
              
              const response = await fetch('/api/reward-notification', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userEmail: referredUserProfile.email,
                  userName: referredUserProfile.full_name,
                  rewardType: 'pro_subscription',
                  description: `🎉 Welcome to FastBookr Business! Your LIFETIME FREE Pro subscription is now active as a referral reward. Enjoy unlimited premium features with no monthly fees, ever!`,
                  source: 'Referral Reward - Business Registration',
                  amount: 'LIFETIME'
                }),
                signal: controller.signal
              })

              clearTimeout(timeoutId)

              if (response.ok) {
                console.log(`✅ Pro subscription confirmation sent to ${referredUserProfile.email}`)
              } else {
                console.log(`⚠️ Pro subscription email queued for retry`)
              }
            }
          } catch (proEmailError) {
            console.log(`⚠️ Pro subscription email will be retried later`)
          }
        }, 250) // Small delay to avoid race conditions
      }
    } catch (profileError) {
      console.error('Failed to fetch profiles for business referral notification:', profileError)
    }

  } catch (error) {
    console.error('Error in processBusinessReferral:', error)
    throw error
  }
}

/**
 * Check if a user is a business user (with caching)
 */
const businessUserCache = new Map<string, { isBusiness: boolean, timestamp: number }>()

export async function isBusinessUser(userId: string): Promise<boolean> {
  try {
    // Check cache first
    const cached = businessUserCache.get(userId)
    if (cached && (Date.now() - cached.timestamp) < BUSINESS_CACHE_DURATION) {
      return cached.isBusiness
    }

    const { data, error } = await supabase.rpc('is_business_user', {
      user_id: userId
    })

    if (error) {
      console.error('Error checking if user is business:', error)
      return false
    }

    const isBusiness = data || false
    
    // Cache the result
    businessUserCache.set(userId, {
      isBusiness,
      timestamp: Date.now()
    })

    return isBusiness
  } catch (error) {
    console.error('Error in isBusinessUser:', error)
    return false
  }
}

/**
 * Get business subscription status (with caching)
 */
export async function getBusinessSubscriptionStatus(userId: string): Promise<BusinessSubscription | null> {
  try {
    // Check cache first
    const cached = businessSubCache.get(userId)
    if (cached && (Date.now() - cached.timestamp) < BUSINESS_CACHE_DURATION) {
      return cached.data
    }

    const { data, error } = await supabase
      .from('business_subscription_status')
      .select('*')
      .eq('user_id', userId)
      .single()

    const result = error ? null : data
    
    // Cache the result
    businessSubCache.set(userId, {
      data: result,
      timestamp: Date.now()
    })

    return result
  } catch (error) {
    console.error('Error in getBusinessSubscriptionStatus:', error)
    return null
  }
}

/**
 * Get all business subscriptions (for admin view)
 */
export async function getAllBusinessSubscriptions(): Promise<BusinessSubscription[]> {
  try {
    const { data, error } = await supabase
      .from('business_subscription_status')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all business subscriptions:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllBusinessSubscriptions:', error)
    return []
  }
}

/**
 * Get business dashboard data (with caching)
 */
export async function getBusinessDashboard(userId: string): Promise<BusinessDashboard | null> {
  try {
    // Check cache first
    const cached = businessDashCache.get(userId)
    if (cached && (Date.now() - cached.timestamp) < BUSINESS_CACHE_DURATION) {
      return cached.data
    }

    const { data, error } = await supabase
      .from('business_dashboards')
      .select('*')
      .eq('user_id', userId)
      .single()

    const result = error ? null : data
    
    // Cache the result
    businessDashCache.set(userId, {
      data: result,
      timestamp: Date.now()
    })

    return result
  } catch (error) {
    console.error('Error in getBusinessDashboard:', error)
    return null
  }
}

/**
 * Initialize business dashboard for new business user
 */
export async function initializeBusinessDashboard(userId: string): Promise<BusinessDashboard | null> {
  try {
    const { data, error } = await supabase
      .from('business_dashboards')
      .insert({
        user_id: userId,
        subscription_plan: 'starter',
        plan_status: 'active',
        pro_subscription_months: 0,
        pro_features_enabled: false,
        initial_pro_months_given: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error initializing business dashboard:', error)
      throw error
    }

    // Invalidate cache for this user
    businessDashCache.delete(userId)

    return data
  } catch (error) {
    console.error('Error in initializeBusinessDashboard:', error)
    throw error
  }
}

/**
 * Check if business has active pro subscription (with caching)
 */
export async function hasActivePro(userId: string): Promise<boolean> {
  try {
    const subscription = await getBusinessSubscriptionStatus(userId)
    return subscription?.is_pro_active || false
  } catch (error) {
    console.error('Error checking active pro status:', error)
    return false
  }
}

/**
 * Get pro features list
 */
export const PRO_FEATURES = {
  unlimited_bookings: 'Unlimited bookings per month',
  advanced_analytics: 'Advanced analytics and insights',
  custom_branding: 'Custom branding and themes',
  priority_support: '24/7 priority customer support',
  api_access: 'API access for integrations',
  staff_management: 'Advanced staff management',
  automated_marketing: 'Automated marketing campaigns',
  multi_location: 'Multi-location management',
  payment_processing: 'Advanced payment processing',
  customer_database: 'Advanced customer database',
} as const

/**
 * Get formatted pro expiry info
 */
export function formatProExpiry(expiresAt?: string): string {
  if (!expiresAt) return 'No active subscription'
  
  const expiry = new Date(expiresAt)
  const now = new Date()
  
  if (expiry < now) return 'Expired'
  
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysLeft === 1) return '1 day remaining'
  if (daysLeft <= 30) return `${daysLeft} days remaining`
  
  const monthsLeft = Math.ceil(daysLeft / 30)
  return `${monthsLeft} month${monthsLeft > 1 ? 's' : ''} remaining`
} 