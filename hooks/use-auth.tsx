"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from "react"
import { User as SupabaseUser, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { User } from "@/lib/supabase"
import { cleanupAuthState } from "@/lib/auth"

interface AuthContextType {
  user: SupabaseUser | null
  profile: User | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  isHydrated: boolean
  forceRefresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // During SSR, context might be undefined, so provide a fallback
    if (typeof window === 'undefined') {
      return {
        user: null,
        profile: null,
        loading: true,
        signOut: async () => {},
        refreshProfile: async () => {},
        isHydrated: false,
        forceRefresh: async () => {},
      }
    }
    // In client-side, if context is undefined, provide fallback instead of throwing
    console.warn("useAuth called outside of AuthProvider, providing fallback")
    return {
      user: null,
      profile: null,
      loading: false,
      signOut: async () => {},
      refreshProfile: async () => {},
      isHydrated: false,
      forceRefresh: async () => {},
    }
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const refreshProfile = async (userId?: string) => {
    const targetUserId = userId || user?.id
    if (targetUserId) {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", targetUserId)
          .single()
        
        if (!error && data) {
          setProfile(data)
          // Force re-render of components that depend on profile
          setRefreshKey(prev => prev + 1)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      }
    }
  }

  const forceRefresh = async () => {
    if (user?.id) {
      await refreshProfile(user.id)
    }
  }

  useEffect(() => {
    // Mark as hydrated after component mounts
    setIsHydrated(true)
    
    // Set a timeout to ensure loading doesn't persist indefinitely
    const loadingTimeout = setTimeout(() => {
      if (process.env.NODE_ENV === 'development') {
        console.warn("Auth loading timeout reached, setting loading to false")
      }
      setLoading(false)
    }, 3000) // Reduced from 5 seconds to 3 seconds
    
    const getSession = async () => {
      try {
        // First try to cleanup any corrupted auth state
        const cleanupPerformed = await cleanupAuthState()
        if (cleanupPerformed) {
          if (process.env.NODE_ENV === 'development') {
            console.log("Auth state cleanup completed")
          }
          setUser(null)
          setProfile(null)
          return
        }
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Session error:", error)
          // Handle refresh token errors specifically
          if (error.message.includes("refresh_token_not_found") || 
              error.message.includes("Invalid Refresh Token")) {
            if (process.env.NODE_ENV === 'development') {
              console.log("Refresh token invalid, clearing session")
            }
            await supabase.auth.signOut()
            setUser(null)
            setProfile(null)
            return
          }
        }
        
        setUser(session?.user ?? null)
        if (session?.user) {
          await refreshProfile(session.user.id)
        }
      } catch (error) {
        console.error("Error getting session:", error)
        // If there's a critical error, clear the session
        if (error instanceof Error && error.message.includes("refresh")) {
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
        }
      } finally {
        clearTimeout(loadingTimeout)
        setLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
      if (process.env.NODE_ENV === 'development') {
        console.log("Auth state change:", event, session?.user?.id)
      }
      
      try {
        // Handle specific auth events
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          if (event === 'TOKEN_REFRESHED' && session) {
            if (process.env.NODE_ENV === 'development') {
              console.log("Token refreshed successfully")
            }
            setUser(session.user)
            if (session.user) {
              await refreshProfile(session.user.id)
            }
          } else if (event === 'SIGNED_OUT') {
            if (process.env.NODE_ENV === 'development') {
              console.log("User signed out")
            }
            setUser(null)
            setProfile(null)
          }
        } else {
          setUser(session?.user ?? null)
          if (session?.user) {
            await refreshProfile(session.user.id)
          } else {
            setProfile(null)
          }
        }
      } catch (error) {
        console.error("Error in auth state change:", error)
        // Handle refresh token errors in auth state changes
        if (error instanceof Error && 
            (error.message.includes("refresh_token_not_found") || 
             error.message.includes("Invalid Refresh Token"))) {
          if (process.env.NODE_ENV === 'development') {
            console.log("Auth state change error: Invalid refresh token, signing out")
          }
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
        }
      } finally {
        clearTimeout(loadingTimeout)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(loadingTimeout)
    }
  }, [])

  // Set up real-time updates for profile changes
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Profile updated in real-time:', payload)
          setProfile(payload.new as User)
          setRefreshKey(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const value = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
    isHydrated,
    forceRefresh,
  }

  return (
    <AuthContext.Provider value={value} key={refreshKey}>
      {children}
    </AuthContext.Provider>
  )
} 