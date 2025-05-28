"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from "react"
import { User as SupabaseUser, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { User } from "@/lib/supabase"

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
    
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        if (session?.user) {
          await refreshProfile(session.user.id)
        }
      } catch (error) {
        console.error("Error getting session:", error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
      try {
        setUser(session?.user ?? null)
        if (session?.user) {
          await refreshProfile(session.user.id)
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error("Error in auth state change:", error)
      } finally {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
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