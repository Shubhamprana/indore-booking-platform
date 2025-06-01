import { supabase } from "./supabase"
import { 
  getUserStats as getStatsFromDB, 
  getUserReferrals as getReferralsFromDB, 
  getUserActivities as getActivitiesFromDB, 
  calculateAndUpdateUserStats,
  initializeUserStats as initStats,
  createUserActivity
} from "./supabase"

// Main interfaces
export interface UserStats {
  total_referrals: number
  successful_referrals: number
  credits_earned: number
  total_points: number
  achievements_count: number
  position_rank: number
  last_calculated_at: string
}

export interface Achievement {
  id: string
  type: string
  title: string
  description: string
  earnedAt: string
  pointsAwarded: number
  name?: string
  icon?: string
  points?: number
  unlocked?: boolean
  unlockedAt?: string
  progress?: number
  target?: number
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

export interface Referral {
  id: string
  referrer_id: string
  referred_user_id: string
  referral_code: string
  created_at: string
  status: "pending" | "completed"
}

// Cache configuration - reduced since we have better caching in supabase.ts
const CACHE_DURATION = 300000 // 5 minutes instead of 15
const statsCache = new Map<string, { stats: UserStats, timestamp: number }>()

export const clearUserStatsCache = (userId: string) => {
  statsCache.delete(userId)
}

export const calculateLevelFromPoints = (points: number): number => {
  if (points < 100) return 1
  if (points < 500) return 2
  if (points < 1000) return 3
  if (points < 2500) return 4
  if (points < 5000) return 5
  return Math.floor(points / 1000) + 1
}

// Get user statistics with caching
export async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    // Check local cache first (short-term)
    const cached = statsCache.get(userId)
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.stats
    }

    // Get from database (which has its own caching now)
    const existingStats = await getStatsFromDB(userId)
    
    if (existingStats) {
      const stats = {
        total_referrals: existingStats.total_referrals,
        successful_referrals: existingStats.successful_referrals,
        credits_earned: existingStats.total_credits_earned,
        total_points: existingStats.total_points,
        achievements_count: existingStats.achievements_count,
        position_rank: existingStats.position_rank || 0,
        last_calculated_at: existingStats.last_calculated_at
      }
      
      // Cache the stats locally
      statsCache.set(userId, { stats, timestamp: Date.now() })
      return stats
    }

    // Only calculate if stats don't exist at all (rare case)
    const calculatedStats = await calculateAndUpdateUserStats(userId)
    
    const stats = {
      total_referrals: calculatedStats.total_referrals,
      successful_referrals: calculatedStats.successful_referrals,
      credits_earned: calculatedStats.total_credits_earned,
      total_points: calculatedStats.total_points,
      achievements_count: calculatedStats.achievements_count,
      position_rank: calculatedStats.position_rank || 0,
      last_calculated_at: calculatedStats.last_calculated_at
    }
    
    statsCache.set(userId, { stats, timestamp: Date.now() })
    return stats
  } catch (error) {
    console.error("Error getting user stats:", error)
    return {
      total_referrals: 0,
      successful_referrals: 0,
      credits_earned: 0,
      total_points: 0,
      achievements_count: 0,
      position_rank: 0,
      last_calculated_at: new Date().toISOString()
    }
  }
}

// Force recalculation of stats
export async function getUserStatsWithRecalculation(userId: string): Promise<UserStats | null> {
  try {
    const stats = await calculateAndUpdateUserStats(userId)
    
    return {
      total_referrals: stats.total_referrals,
      successful_referrals: stats.successful_referrals,
      credits_earned: stats.total_credits_earned,
      total_points: stats.total_points,
      achievements_count: stats.achievements_count,
      position_rank: stats.position_rank || 0,
      last_calculated_at: stats.last_calculated_at
    }
  } catch (error) {
    console.error("Error getting user stats with recalculation:", error)
    return {
      total_referrals: 0,
      successful_referrals: 0,
      credits_earned: 0,
      total_points: 0,
      achievements_count: 0,
      position_rank: 0,
      last_calculated_at: new Date().toISOString()
    }
  }
}

// Get user achievements
export async function getUserAchievements(userId: string): Promise<Achievement[]> {
  try {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false })

    if (error) {
      console.error("Error fetching achievements:", error)
      return []
    }

    return data.map(achievement => ({
      id: achievement.id,
      type: achievement.achievement_type,
      title: achievement.title,
      description: achievement.description,
      earnedAt: achievement.earned_at,
      pointsAwarded: achievement.points_awarded || 0,
      name: achievement.title,
      icon: achievement.icon || "🏆",
      points: achievement.points_awarded || 0,
      unlocked: true,
      unlockedAt: achievement.earned_at,
      progress: achievement.progress || 100,
      target: achievement.target || 100
    }))
  } catch (error) {
    console.error("Error in getUserAchievements:", error)
    return []
  }
}

// Get user activities
export async function getUserActivities(userId: string, limit: number = 10): Promise<UserActivity[]> {
  try {
    return await getActivitiesFromDB(userId)
  } catch (error) {
    console.error("Error in getUserActivities:", error)
    return []
  }
}

// Get user referrals
export async function getUserReferrals(userId: string): Promise<Referral[]> {
  try {
    const referrals = await getReferralsFromDB(userId)
    
    return referrals.map(referral => ({
      id: referral.id,
      referrer_id: referral.referrer_id,
      referred_user_id: referral.referred_user_id,
      referral_code: referral.referral_code,
      created_at: referral.created_at,
      status: (referral.status as "pending" | "completed") || "completed"
    }))
  } catch (error) {
    console.error("Error in getUserReferrals:", error)
    return []
  }
}

// Get total user count
export async function getTotalUserCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    if (error) {
      console.error("Error getting total user count:", error)
      return 15847
    }
    return count || 15847
  } catch (error) {
    console.error("Error in getTotalUserCount:", error)
    return 15847
  }
}

// Process referral with milestone system
export const processReferral = async (referrerId: string, referredUserId: string, referralCode: string) => {
  try {
    await processReferralManually(referrerId, referredUserId, referralCode)

    // Send reward notification email to referrer
    try {
      const { data: referrerProfile } = await supabase
        .from("users")
        .select("email, full_name")
        .eq("id", referrerId)
        .single()

      const { data: referredProfile } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", referredUserId)
        .single()

      if (referrerProfile && referredProfile) {
        // Send referral bonus notification via API call instead of direct import
        try {
          const response = await fetch('/api/reward-notification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userEmail: referrerProfile.email,
              userName: referrerProfile.full_name,
              rewardType: 'referral_bonus',
              amount: 25,
              description: `${referredProfile.full_name} joined FastBookr using your referral code!`,
              source: 'Referral Program'
            }),
          })
          
          if (response.ok) {
            console.log(`Referral bonus notification sent to ${referrerProfile.email}`)
          } else {
            console.error('Failed to send referral bonus notification via API')
          }
        } catch (emailError) {
          console.error('Failed to send referral bonus notification:', emailError)
          // Don't throw - email failure shouldn't affect the referral process
        }
      }
    } catch (profileError) {
      console.error('Failed to fetch profiles for referral notification:', profileError)
    }

  } catch (error) {
    console.error("Error in processReferral:", error)
  }
}

// Optimized referral processing with milestone system
async function processReferralManually(referrerId: string, referredUserId: string, referralCode: string): Promise<void> {
  try {
    // Create referral record
    const { error: insertError } = await supabase
      .from("referrals")
      .insert({
        referrer_id: referrerId,
        referred_user_id: referredUserId,
        referral_code: referralCode,
        status: "completed",
        reward_amount: 0
      })

    if (insertError) {
      console.error("Error creating referral record:", insertError)
      return
    }

    // Get total referrals count
    const { data: referralCount } = await supabase
      .from("referrals")
      .select("id")
      .eq("referrer_id", referrerId)
      .eq("status", "completed")

    const totalReferrals = referralCount?.length || 0

    // Check for milestone (every 2 referrals)
    if (totalReferrals >= 2 && totalReferrals % 2 === 0) {
      const currentMilestone = Math.floor(totalReferrals / 2)
      
      // Check if milestone already rewarded
      const { data: existingMilestone } = await supabase
        .from("user_activities")
        .select("id, metadata")
        .eq("user_id", referrerId)
        .eq("activity_type", "referral_milestone")

      const alreadyRewarded = existingMilestone?.some(activity => 
        activity.metadata?.milestone_number === currentMilestone
      )

      if (!alreadyRewarded) {
        // Give milestone rewards
        createUserActivity(
          referrerId,
          "referral_milestone",
          `Milestone ${currentMilestone} reached! You've earned 50 credits! 🎉`,
          0,
          { 
            milestone_number: currentMilestone, 
            total_referrals: totalReferrals,
            reward_amount: 50, 
            reward_type: "credits" 
          }
        ).catch(error => console.error("Error creating milestone activity:", error))

        // Get recent referred users
        const { data: recentReferrals } = await supabase
          .from("referrals")
          .select("referred_user_id, created_at")
          .eq("referrer_id", referrerId)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(2)

        // Reward recent referred users
        if (recentReferrals) {
          for (const referral of recentReferrals) {
            createUserActivity(
              referral.referred_user_id,
              "referral_reward",
              `Milestone reached! You've earned 25 points! 🎯`,
              25,
              { 
                referrer_id: referrerId, 
                milestone_number: currentMilestone,
                reward_type: "points" 
              }
            ).catch(error => console.error("Error creating reward activity:", error))
            
            // Update stats in background
            setTimeout(() => {
              calculateAndUpdateUserStats(referral.referred_user_id)
                .then(() => clearUserStatsCache(referral.referred_user_id))
                .catch(error => console.error("Error updating user stats:", error))
            }, 600 + (recentReferrals.indexOf(referral) * 200))
          }
        }

        // Update referrer stats
        setTimeout(() => {
          calculateAndUpdateUserStats(referrerId)
            .then(() => clearUserStatsCache(referrerId))
            .catch(error => console.error("Error updating referrer stats:", error))
        }, 800)
      }
    } else {
      // Progress tracking
      const progressInCurrentMilestone = totalReferrals % 2 === 0 ? 2 : totalReferrals % 2
      const milestoneNumber = Math.ceil(totalReferrals / 2)
      
      createUserActivity(
        referredUserId,
        "referral_pending",
        `Joined using referral code! Progress: ${progressInCurrentMilestone}/2`,
        0,
        { 
          referral_code: referralCode, 
          referrer_id: referrerId, 
          pending_milestone: milestoneNumber, 
          current_count: progressInCurrentMilestone,
          total_referrals: totalReferrals
        }
      ).catch(error => console.error("Error creating pending activity:", error))

      createUserActivity(
        referrerId,
        "referral_progress",
        `Friend joined! Progress: ${progressInCurrentMilestone}/2 🎯`,
        0,
        { 
          referral_code: referralCode, 
          referred_user_id: referredUserId, 
          progress: progressInCurrentMilestone, 
          target: 2,
          milestone_number: milestoneNumber,
          total_referrals: totalReferrals
        }
      ).catch(error => console.error("Error creating progress activity:", error))
    }

    // Update stats for both users (staggered)
    setTimeout(() => {
      calculateAndUpdateUserStats(referrerId)
        .then(() => clearUserStatsCache(referrerId))
        .catch(error => console.error("Error updating referrer stats:", error))
    }, 200)
    
    setTimeout(() => {
      calculateAndUpdateUserStats(referredUserId)
        .then(() => clearUserStatsCache(referredUserId))
        .catch(error => console.error("Error updating referred user stats:", error))
    }, 400)

  } catch (error) {
    console.error("Error in manual referral processing:", error)
  }
}

// Helper functions
export const copyReferralCode = (code: string) => {
  navigator.clipboard.writeText(code)
}

export const shareOnSocial = (platform: string, code: string) => {
  const message = `Join me on BookNow! When I get 2 friends, we all earn rewards! Use my referral code: ${code}`
  const url = `${window.location.origin}/register?ref=${code}`
  
  const urls = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(message + " " + url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  }
  
  if (urls[platform as keyof typeof urls]) {
    window.open(urls[platform as keyof typeof urls])
  }
} 