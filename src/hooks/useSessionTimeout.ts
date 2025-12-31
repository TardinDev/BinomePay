import { useEffect, useRef, useCallback } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { useAuth } from '@clerk/clerk-expo'
import AsyncStorage from '@react-native-async-storage/async-storage'

const LAST_ACTIVITY_KEY = '@binomepay_last_activity'
const SESSION_TIMEOUT_MS = 15 * 60 * 1000 // 15 minutes

interface UseSessionTimeoutOptions {
  timeoutMs?: number
  onTimeout?: () => void
  enabled?: boolean
}

export function useSessionTimeout({
  timeoutMs = SESSION_TIMEOUT_MS,
  onTimeout,
  enabled = true,
}: UseSessionTimeoutOptions = {}) {
  const { signOut, isSignedIn } = useAuth()
  const appState = useRef(AppState.currentState)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  const updateLastActivity = useCallback(async () => {
    const now = Date.now()
    lastActivityRef.current = now
    try {
      await AsyncStorage.setItem(LAST_ACTIVITY_KEY, now.toString())
    } catch (error) {
      if (__DEV__) console.error('Error saving last activity:', error)
    }
  }, [])

  const checkSessionTimeout = useCallback(async () => {
    if (!enabled || !isSignedIn) return

    try {
      const lastActivityStr = await AsyncStorage.getItem(LAST_ACTIVITY_KEY)
      const lastActivity = lastActivityStr ? parseInt(lastActivityStr, 10) : Date.now()
      const timeSinceActivity = Date.now() - lastActivity

      if (timeSinceActivity >= timeoutMs) {
        if (__DEV__) console.log('Session timeout - logging out')

        if (onTimeout) {
          onTimeout()
        } else {
          await signOut()
        }
      }
    } catch (error) {
      if (__DEV__) console.error('Error checking session timeout:', error)
    }
  }, [enabled, isSignedIn, timeoutMs, onTimeout, signOut])

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (enabled && isSignedIn) {
      updateLastActivity()
      timeoutRef.current = setTimeout(() => {
        checkSessionTimeout()
      }, timeoutMs)
    }
  }, [enabled, isSignedIn, timeoutMs, updateLastActivity, checkSessionTimeout])

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground - check if session expired
        checkSessionTimeout()
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // App going to background - save last activity
        updateLastActivity()
      }

      appState.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [checkSessionTimeout, updateLastActivity])

  // Initialize timeout on mount
  useEffect(() => {
    if (enabled && isSignedIn) {
      updateLastActivity()
      resetTimeout()
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [enabled, isSignedIn, updateLastActivity, resetTimeout])

  return {
    resetTimeout,
    updateLastActivity,
    checkSessionTimeout,
  }
}

export default useSessionTimeout
