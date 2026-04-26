import { useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import useAppStore from '@/store/useAppStore'

/**
 * Hook pour initialiser l'application avec les données utilisateur
 * Se déclenche automatiquement quand l'utilisateur est connecté
 */
export function useAppInitialization() {
  const { user, isLoaded } = useAuth()
  const initializeUserData = useAppStore((s) => s.initializeUserData)
  const setUser = useAppStore((s) => s.setUser)
  const reset = useAppStore((s) => s.reset)
  const isLoading = useAppStore((s) => s.isLoading)
  const error = useAppStore((s) => s.error)

  useEffect(() => {
    if (!isLoaded) return

    if (user?.id) {
      const firstName = (user.user_metadata?.firstName as string) || undefined
      const avatarUrl = (user.user_metadata?.avatar_url as string) || undefined

      const userData = {
        id: user.id,
        name: firstName || 'Utilisateur',
        kycStatus: 'unverified' as const,
        ratingAvg: 0,
        avatarUrl,
      }

      setUser(userData)
      initializeUserData(user.id, firstName)
    } else {
      reset()
    }
  }, [user, isLoaded, initializeUserData, setUser, reset])

  return {
    isLoading,
    error,
    user,
    isReady: isLoaded && !isLoading && user,
  }
}
