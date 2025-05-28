import { supabase } from "./supabase"

export async function verifyDatabaseSetup() {
  console.log("🔍 Verifying database setup...")
  
  const results = {
    users: false,
    referrals: false,
    user_activities: false,
    achievements: false,
    user_stats: false,
    calculate_user_stats_function: false,
    process_referral_function: false
  }

  try {
    // Check if users table exists and has data
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, referral_code')
      .limit(1)

    if (!usersError) {
      results.users = true
      console.log("✅ Users table exists")
      if (users && users.length > 0) {
        console.log(`   Sample referral code: ${users[0].referral_code}`)
      }
    } else {
      console.log("❌ Users table error:", usersError.message)
    }

    // Check referrals table
    const { error: referralsError } = await supabase
      .from('referrals')
      .select('id')
      .limit(1)

    if (!referralsError) {
      results.referrals = true
      console.log("✅ Referrals table exists")
    } else {
      console.log("❌ Referrals table error:", referralsError.message)
    }

    // Check user_activities table
    const { error: activitiesError } = await supabase
      .from('user_activities')
      .select('id')
      .limit(1)

    if (!activitiesError) {
      results.user_activities = true
      console.log("✅ User activities table exists")
    } else {
      console.log("❌ User activities table error:", activitiesError.message)
    }

    // Check achievements table
    const { error: achievementsError } = await supabase
      .from('achievements')
      .select('id')
      .limit(1)

    if (!achievementsError) {
      results.achievements = true
      console.log("✅ Achievements table exists")
    } else {
      console.log("❌ Achievements table error:", achievementsError.message)
    }

    // Check user_stats table
    const { error: statsError } = await supabase
      .from('user_stats')
      .select('user_id')
      .limit(1)

    if (!statsError) {
      results.user_stats = true
      console.log("✅ User stats table exists")
    } else {
      console.log("❌ User stats table error:", statsError.message)
    }

    // Test calculate_user_stats function
    if (users && users.length > 0) {
      const { error: calcError } = await supabase.rpc('calculate_user_stats', {
        target_user_id: users[0].id
      })

      if (!calcError) {
        results.calculate_user_stats_function = true
        console.log("✅ calculate_user_stats function works")
      } else {
        console.log("❌ calculate_user_stats function error:", calcError.message)
      }
    }

    // Test process_referral function (dry run with fake data)
    const { error: processError } = await supabase.rpc('process_referral', {
      referrer_id_param: '00000000-0000-0000-0000-000000000000',
      referred_user_id_param: '00000000-0000-0000-0000-000000000001',
      referral_code_param: 'TESTCODE'
    })

    if (!processError || processError.message?.includes('foreign key')) {
      results.process_referral_function = true
      console.log("✅ process_referral function exists")
    } else {
      console.log("❌ process_referral function error:", processError.message)
    }

  } catch (error) {
    console.error("Database verification error:", error)
  }

  console.log("\n📊 Database Setup Summary:")
  Object.entries(results).forEach(([key, value]) => {
    console.log(`${value ? '✅' : '❌'} ${key.replace(/_/g, ' ')}`)
  })

  const allGood = Object.values(results).every(Boolean)
  if (allGood) {
    console.log("\n🎉 All database components are set up correctly!")
  } else {
    console.log("\n⚠️  Some database components need to be set up. Please run the migration SQL files.")
  }

  return results
}

// Function to get a sample referral code for testing
export async function getSampleReferralCode(): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('referral_code')
      .limit(1)

    if (error || !data || data.length === 0) {
      return null
    }

    return data[0].referral_code
  } catch (error) {
    console.error("Error getting sample referral code:", error)
    return null
  }
} 