'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, UserSession } from '@/types'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<UserSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    let isMounted = true
    const supabase = supabaseRef.current

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError) {
          // AuthSessionMissingError is expected when user is not logged in - don't log it
          if (userError.name !== 'AuthSessionMissingError' && !userError.message?.includes('Auth session missing')) {
            console.error('Error getting user:', userError)
          }
          if (isMounted) setIsLoading(false)
          return
        }

        if (isMounted) setUser(user)

        if (user) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: profileData } = await (supabase.from('profiles') as any)
              .select('*')
              .eq('id', user.id)
              .maybeSingle()

            const profile = profileData as Profile | null
            if (isMounted) {
              setProfile(profile)

              // Always set session when user exists, with or without profile
              setSession({
                id: user.id,
                email: user.email || '',
                role: profile?.role || 'customer',
                staffType: profile?.staff_type,
                fullName: profile?.full_name || user.email?.split('@')[0] || 'User',
                avatarUrl: profile?.avatar_url || undefined,
              })
            }
          } catch (profileError) {
            console.error('Error fetching profile:', profileError)
            // Still set basic session even if profile fetch fails
            if (isMounted) {
              setSession({
                id: user.id,
                email: user.email || '',
                role: 'customer',
                fullName: user.email?.split('@')[0] || 'User',
              })
            }
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    let subscription: { unsubscribe: () => void } | null = null

    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, authSession) => {
          if (!isMounted) return

          setUser(authSession?.user ?? null)

          if (authSession?.user) {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const { data: profileData } = await (supabase.from('profiles') as any)
                .select('*')
                .eq('id', authSession.user.id)
                .maybeSingle()

              const profile = profileData as Profile | null
              if (isMounted) {
                setProfile(profile)

                // Always set session when user exists, with or without profile
                setSession({
                  id: authSession.user.id,
                  email: authSession.user.email || '',
                  role: profile?.role || 'customer',
                  staffType: profile?.staff_type,
                  fullName: profile?.full_name || authSession.user.email?.split('@')[0] || 'User',
                  avatarUrl: profile?.avatar_url || undefined,
                })
              }
            } catch (error) {
              // Ignore AbortError, set basic session for other errors
              if (error instanceof Error && error.name === 'AbortError') return
              if (isMounted) {
                setSession({
                  id: authSession.user.id,
                  email: authSession.user.email || '',
                  role: 'customer',
                  fullName: authSession.user.email?.split('@')[0] || 'User',
                })
              }
            }
          } else {
            if (isMounted) {
              setProfile(null)
              setSession(null)
            }
          }

          if (isMounted) setIsLoading(false)
        }
      )
      subscription = data.subscription
    } catch (error) {
      // Ignore AbortError during cleanup
      if (error instanceof Error && error.name === 'AbortError') return
      console.error('Auth state change error:', error)
    }

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    // Clear local state first
    setUser(null)
    setProfile(null)
    setSession(null)
    // Use server-side signout to properly clear cookies
    window.location.href = '/auth/signout'
  }

  // Use session.role as primary source (it's set even without profile)
  const role = session?.role || profile?.role || 'customer'
  const staffType = session?.staffType || profile?.staff_type

  return {
    user,
    profile,
    session,
    isLoading,
    signOut,
    isAdmin: role === 'admin',
    isStaff: role === 'staff' || role === 'admin',
    isCustomer: role === 'customer',
    isTechnician: staffType === 'technician',
    isMarketing: staffType === 'marketing',
  }
}
