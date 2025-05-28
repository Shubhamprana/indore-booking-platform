import { supabase } from "./supabase"

export const checkDatabaseSetup = async () => {
  try {
    // Try to query the users table to see if it exists
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .limit(1)

    if (error) {
      console.error("Database setup check failed:", error)
      return {
        isSetup: false,
        error: error.message,
        needsMigration: true
      }
    }

    return {
      isSetup: true,
      error: null,
      needsMigration: false
    }
  } catch (error) {
    console.error("Database setup check error:", error)
    return {
      isSetup: false,
      error: "Failed to check database setup",
      needsMigration: true
    }
  }
}

export const getDatabaseStatus = async () => {
  try {
    // Check if tables exist by trying to query them
    const tables = ['users', 'referrals', 'user_activities', 'business_dashboards', 'bookings']
    const status: Record<string, boolean> = {}

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select("*")
          .limit(1)
        
        status[table] = !error
      } catch {
        status[table] = false
      }
    }

    return status
  } catch (error) {
    console.error("Error checking database status:", error)
    return {}
  }
} 