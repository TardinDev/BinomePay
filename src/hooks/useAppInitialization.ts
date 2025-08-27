import { useEffect } from 'react'
import { useUser } from '@clerk/clerk-expo'
import useAppStore from '@/store/useAppStore'

/**
 * Hook pour initialiser l'application avec les données utilisateur
 * Se déclenche automatiquement quand l'utilisateur est connecté
 */
export function useAppInitialization() {
  const { user, isLoaded } = useUser()
  const initializeUserData = useAppStore((s) => s.initializeUserData)
  const setUser = useAppStore((s) => s.setUser)
  const reset = useAppStore((s) => s.reset)
  const isLoading = useAppStore((s) => s.isLoading)
  const error = useAppStore((s) => s.error)

  useEffect(() => {
    if (!isLoaded) return

    if (user?.id) {
      // Utilisateur connecté - initialiser les données
      const userData = {
        id: user.id,
        name: user.firstName || user.username || 'Utilisateur',
        kycStatus: 'unverified' as const, // À déterminer depuis la base de données
        ratingAvg: 0, // À charger depuis la base de données
        avatarUrl: user.imageUrl,
      }
      
      setUser(userData)
      initializeUserData(user.id)
    } else {
      // Utilisateur déconnecté - réinitialiser le store
      reset()
    }
  }, [user, isLoaded, initializeUserData, setUser, reset])

  return {
    isLoading,
    error,
    user,
    isReady: isLoaded && !isLoading && user
  }
}