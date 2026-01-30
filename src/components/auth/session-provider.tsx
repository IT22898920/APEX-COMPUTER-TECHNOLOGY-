'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SessionExpiredModal } from './session-expired-modal'

// Inactivity timeout in milliseconds (30 minutes)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000

// Warning before timeout (5 minutes before)
const WARNING_BEFORE_TIMEOUT = 5 * 60 * 1000

interface SessionContextType {
  resetInactivityTimer: () => void
  showWarning: boolean
  timeUntilLogout: number
}

const SessionContext = createContext<SessionContextType>({
  resetInactivityTimer: () => {},
  showWarning: false,
  timeUntilLogout: 0,
})

export function useSession() {
  return useContext(SessionContext)
}

interface SessionProviderProps {
  children: React.ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [sessionExpired, setSessionExpired] = useState(false)
  const [expiredReason, setExpiredReason] = useState<'expired' | 'inactive' | 'signed_out'>('expired')
  const [showWarning, setShowWarning] = useState(false)
  const [timeUntilLogout, setTimeUntilLogout] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const supabaseRef = useRef(createClient())

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
      inactivityTimerRef.current = null
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current)
      warningTimerRef.current = null
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    setShowWarning(false)
  }, [])

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (!isAuthenticated) return

    clearAllTimers()

    // Set warning timer (shows warning 5 min before timeout)
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true)
      setTimeUntilLogout(WARNING_BEFORE_TIMEOUT / 1000)

      // Start countdown
      countdownRef.current = setInterval(() => {
        setTimeUntilLogout((prev) => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE_TIMEOUT)

    // Set logout timer
    inactivityTimerRef.current = setTimeout(() => {
      handleInactivityLogout()
    }, INACTIVITY_TIMEOUT)
  }, [isAuthenticated, clearAllTimers])

  // Handle inactivity logout
  const handleInactivityLogout = async () => {
    clearAllTimers()
    setExpiredReason('inactive')
    setSessionExpired(true)

    // Sign out from Supabase
    await supabaseRef.current.auth.signOut()
  }

  // Listen for auth state changes
  useEffect(() => {
    const supabase = supabaseRef.current

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const wasAuthenticated = isAuthenticated
      setIsAuthenticated(!!session)

      if (event === 'SIGNED_OUT') {
        clearAllTimers()
        // Only show modal if user was previously authenticated
        if (wasAuthenticated && !sessionExpired) {
          setExpiredReason('signed_out')
          setSessionExpired(true)
        }
      } else if (event === 'TOKEN_REFRESHED') {
        // Token was refreshed, reset timer
        resetInactivityTimer()
      } else if (event === 'SIGNED_IN') {
        setSessionExpired(false)
        resetInactivityTimer()
      }
    })

    return () => {
      subscription.unsubscribe()
      clearAllTimers()
    }
  }, [clearAllTimers, isAuthenticated, sessionExpired])

  // Set up activity listeners
  useEffect(() => {
    if (!isAuthenticated) return

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']

    const handleActivity = () => {
      if (showWarning) {
        // User is active, reset everything
        setShowWarning(false)
      }
      resetInactivityTimer()
    }

    // Throttle activity handler to prevent too many resets
    let lastActivity = Date.now()
    const throttledHandler = () => {
      const now = Date.now()
      if (now - lastActivity > 1000) { // Only reset if more than 1 second has passed
        lastActivity = now
        handleActivity()
      }
    }

    activityEvents.forEach((event) => {
      window.addEventListener(event, throttledHandler, { passive: true })
    })

    // Initial timer setup
    resetInactivityTimer()

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, throttledHandler)
      })
    }
  }, [isAuthenticated, resetInactivityTimer, showWarning])

  const handleModalClose = () => {
    setSessionExpired(false)
  }

  return (
    <SessionContext.Provider value={{ resetInactivityTimer, showWarning, timeUntilLogout }}>
      {children}

      {/* Session Expired Modal */}
      <SessionExpiredModal
        isOpen={sessionExpired}
        reason={expiredReason}
        onClose={handleModalClose}
      />

      {/* Inactivity Warning Toast */}
      {showWarning && !sessionExpired && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 shadow-lg max-w-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Session Expiring Soon
                </h3>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                  You will be logged out in{' '}
                  <span className="font-bold">
                    {Math.floor(timeUntilLogout / 60)}:{(timeUntilLogout % 60).toString().padStart(2, '0')}
                  </span>
                  {' '}due to inactivity.
                </p>
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  Move your mouse or press any key to stay logged in.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </SessionContext.Provider>
  )
}
