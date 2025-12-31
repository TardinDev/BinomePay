import { useState, useCallback, useRef, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface RateLimitConfig {
  maxActions: number
  windowMs: number
  storageKey?: string
}

interface RateLimitState {
  isLimited: boolean
  remainingActions: number
  resetTime: number | null
  timeUntilReset: number | null
}

interface UseRateLimitResult {
  checkLimit: () => Promise<boolean>
  recordAction: () => Promise<boolean>
  reset: () => Promise<void>
  state: RateLimitState
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxActions: 5,
  windowMs: 60 * 1000, // 1 minute
}

export function useRateLimit(
  actionType: string,
  config: Partial<RateLimitConfig> = {}
): UseRateLimitResult {
  const {
    maxActions = DEFAULT_CONFIG.maxActions,
    windowMs = DEFAULT_CONFIG.windowMs,
    storageKey = `@binomepay_ratelimit_${actionType}`,
  } = config

  const [state, setState] = useState<RateLimitState>({
    isLimited: false,
    remainingActions: maxActions,
    resetTime: null,
    timeUntilReset: null,
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Update time until reset every second when limited
  useEffect(() => {
    if (state.resetTime) {
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const timeUntilReset = Math.max(0, state.resetTime! - now)

        if (timeUntilReset === 0) {
          // Reset when time is up
          setState((prev) => ({
            ...prev,
            isLimited: false,
            remainingActions: maxActions,
            resetTime: null,
            timeUntilReset: null,
          }))
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
        } else {
          setState((prev) => ({
            ...prev,
            timeUntilReset,
          }))
        }
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [state.resetTime, maxActions])

  const getTimestamps = useCallback(async (): Promise<number[]> => {
    try {
      const stored = await AsyncStorage.getItem(storageKey)
      if (!stored) return []
      return JSON.parse(stored)
    } catch {
      return []
    }
  }, [storageKey])

  const saveTimestamps = useCallback(
    async (timestamps: number[]): Promise<void> => {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(timestamps))
      } catch (error) {
        if (__DEV__) console.error('Error saving rate limit timestamps:', error)
      }
    },
    [storageKey]
  )

  const cleanOldTimestamps = useCallback(
    (timestamps: number[]): number[] => {
      const now = Date.now()
      const windowStart = now - windowMs
      return timestamps.filter((ts) => ts > windowStart)
    },
    [windowMs]
  )

  const checkLimit = useCallback(async (): Promise<boolean> => {
    const timestamps = await getTimestamps()
    const recentTimestamps = cleanOldTimestamps(timestamps)
    const isLimited = recentTimestamps.length >= maxActions

    const resetTime =
      recentTimestamps.length > 0
        ? Math.min(...recentTimestamps) + windowMs
        : null

    setState({
      isLimited,
      remainingActions: Math.max(0, maxActions - recentTimestamps.length),
      resetTime,
      timeUntilReset: resetTime ? Math.max(0, resetTime - Date.now()) : null,
    })

    return !isLimited
  }, [getTimestamps, cleanOldTimestamps, maxActions, windowMs])

  const recordAction = useCallback(async (): Promise<boolean> => {
    const timestamps = await getTimestamps()
    const recentTimestamps = cleanOldTimestamps(timestamps)

    if (recentTimestamps.length >= maxActions) {
      const resetTime = Math.min(...recentTimestamps) + windowMs
      setState({
        isLimited: true,
        remainingActions: 0,
        resetTime,
        timeUntilReset: Math.max(0, resetTime - Date.now()),
      })
      return false
    }

    // Add new timestamp
    const now = Date.now()
    recentTimestamps.push(now)
    await saveTimestamps(recentTimestamps)

    const newRemaining = maxActions - recentTimestamps.length
    const isNowLimited = newRemaining === 0
    const resetTime = Math.min(...recentTimestamps) + windowMs

    setState({
      isLimited: isNowLimited,
      remainingActions: newRemaining,
      resetTime: isNowLimited ? resetTime : null,
      timeUntilReset: isNowLimited ? Math.max(0, resetTime - Date.now()) : null,
    })

    return true
  }, [getTimestamps, cleanOldTimestamps, saveTimestamps, maxActions, windowMs])

  const reset = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(storageKey)
      setState({
        isLimited: false,
        remainingActions: maxActions,
        resetTime: null,
        timeUntilReset: null,
      })
    } catch (error) {
      if (__DEV__) console.error('Error resetting rate limit:', error)
    }
  }, [storageKey, maxActions])

  // Check limit on mount
  useEffect(() => {
    checkLimit()
  }, [checkLimit])

  return {
    checkLimit,
    recordAction,
    reset,
    state,
  }
}

// Pre-configured rate limiters for common actions
export function useMessageRateLimit() {
  return useRateLimit('send_message', {
    maxActions: 10,
    windowMs: 60 * 1000, // 10 messages per minute
  })
}

export function useIntentionRateLimit() {
  return useRateLimit('create_intention', {
    maxActions: 5,
    windowMs: 60 * 60 * 1000, // 5 intentions per hour
  })
}

export function useReportRateLimit() {
  return useRateLimit('report_user', {
    maxActions: 3,
    windowMs: 24 * 60 * 60 * 1000, // 3 reports per day
  })
}

export function formatTimeRemaining(ms: number): string {
  const seconds = Math.ceil(ms / 1000)
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

export default useRateLimit
