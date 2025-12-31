import { useState, useCallback, useRef } from 'react'

interface RetryConfig {
  maxRetries?: number
  baseDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
  retryCondition?: (error: unknown) => boolean
}

interface RetryState {
  isRetrying: boolean
  retryCount: number
  lastError: unknown | null
  nextRetryIn: number | null
}

interface UseRetryResult<T> {
  execute: () => Promise<T | null>
  reset: () => void
  state: RetryState
}

const DEFAULT_CONFIG: Required<Omit<RetryConfig, 'retryCondition'>> = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
}

// Default retry condition - retry on network errors and 5xx server errors
const defaultRetryCondition = (error: unknown): boolean => {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return true
    }
  }

  // Check for API errors with status codes
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: number }).status
    // Retry on server errors (5xx) or rate limiting (429)
    return status >= 500 || status === 429
  }

  return false
}

export function useRetry<T>(
  asyncFn: () => Promise<T>,
  config: RetryConfig = {}
): UseRetryResult<T> {
  const {
    maxRetries = DEFAULT_CONFIG.maxRetries,
    baseDelayMs = DEFAULT_CONFIG.baseDelayMs,
    maxDelayMs = DEFAULT_CONFIG.maxDelayMs,
    backoffMultiplier = DEFAULT_CONFIG.backoffMultiplier,
    retryCondition = defaultRetryCondition,
  } = config

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    retryCount: 0,
    lastError: null,
    nextRetryIn: null,
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const calculateDelay = useCallback(
    (retryAttempt: number): number => {
      const delay = baseDelayMs * Math.pow(backoffMultiplier, retryAttempt)
      // Add jitter (random 0-30% of delay)
      const jitter = delay * Math.random() * 0.3
      return Math.min(delay + jitter, maxDelayMs)
    },
    [baseDelayMs, backoffMultiplier, maxDelayMs]
  )

  const sleep = useCallback((ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }, [])

  const execute = useCallback(async (): Promise<T | null> => {
    // Cancel any pending retry
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setState((prev) => ({
      ...prev,
      isRetrying: true,
      retryCount: 0,
      lastError: null,
      nextRetryIn: null,
    }))

    let lastError: unknown = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await asyncFn()
        setState((prev) => ({
          ...prev,
          isRetrying: false,
          retryCount: attempt,
          lastError: null,
          nextRetryIn: null,
        }))
        return result
      } catch (error) {
        lastError = error

        if (__DEV__) {
          console.log(`Retry attempt ${attempt + 1}/${maxRetries + 1} failed:`, error)
        }

        // Check if we should retry
        if (attempt < maxRetries && retryCondition(error)) {
          const delay = calculateDelay(attempt)

          setState((prev) => ({
            ...prev,
            retryCount: attempt + 1,
            lastError: error,
            nextRetryIn: delay,
          }))

          // Wait before next retry
          await sleep(delay)

          // Check if aborted
          if (abortControllerRef.current?.signal.aborted) {
            setState((prev) => ({
              ...prev,
              isRetrying: false,
              nextRetryIn: null,
            }))
            return null
          }
        } else {
          // Max retries reached or error is not retryable
          break
        }
      }
    }

    setState((prev) => ({
      ...prev,
      isRetrying: false,
      lastError,
      nextRetryIn: null,
    }))

    // Re-throw the last error
    throw lastError
  }, [asyncFn, maxRetries, retryCondition, calculateDelay, sleep])

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setState({
      isRetrying: false,
      retryCount: 0,
      lastError: null,
      nextRetryIn: null,
    })
  }, [])

  return {
    execute,
    reset,
    state,
  }
}

// Utility function for one-off retries without hook
export async function retryAsync<T>(
  asyncFn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxRetries = DEFAULT_CONFIG.maxRetries,
    baseDelayMs = DEFAULT_CONFIG.baseDelayMs,
    maxDelayMs = DEFAULT_CONFIG.maxDelayMs,
    backoffMultiplier = DEFAULT_CONFIG.backoffMultiplier,
    retryCondition = defaultRetryCondition,
  } = config

  const calculateDelay = (attempt: number): number => {
    const delay = baseDelayMs * Math.pow(backoffMultiplier, attempt)
    const jitter = delay * Math.random() * 0.3
    return Math.min(delay + jitter, maxDelayMs)
  }

  let lastError: unknown = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn()
    } catch (error) {
      lastError = error

      if (__DEV__) {
        console.log(`Retry attempt ${attempt + 1}/${maxRetries + 1} failed:`, error)
      }

      if (attempt < maxRetries && retryCondition(error)) {
        const delay = calculateDelay(attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        break
      }
    }
  }

  throw lastError
}

export default useRetry
