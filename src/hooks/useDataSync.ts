import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@clerk/clerk-expo'
import useAppStore from '@/store/useAppStore'
import { syncService } from '@/services/syncService'
import NetInfo from '@react-native-community/netinfo'

export function useDataSync() {
  const { user: clerkUser } = useUser()
  const user = useAppStore((s) => s.user)
  const isLoggingOut = useAppStore((s) => s.isLoggingOut)
  const initializeUserData = useAppStore((s) => s.initializeUserData)
  const isLoading = useAppStore((s) => s.isLoading)
  const error = useAppStore((s) => s.error)
  const setError = useAppStore((s) => s.setError)
  
  const [isOnline, setIsOnline] = useState(true)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  
  const useMockApi = process.env.EXPO_PUBLIC_MOCK_API === 'true'

  // Surveiller la connectivité réseau (seulement en mode API réel)
  useEffect(() => {
    if (useMockApi) {
      setIsOnline(true) // Toujours "en ligne" en mode mock
      return
    }
    
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(!!state.isConnected)
      
      // Déclencher une synchronisation quand on revient en ligne
      if (state.isConnected && user?.id) {
        handleSync()
      }
    })

    return unsubscribe
  }, [useMockApi]) // Retirer user?.id qui cause des boucles

  // Initialiser les données utilisateur lors de la connexion
  useEffect(() => {
    // Ne pas initialiser si on est en train de se déconnecter
    if (isLoggingOut) return
    
    if (clerkUser?.id && !user) {
      console.log('Initialisation des données pour:', clerkUser.id)
      initializeUserData(clerkUser.id)
    }
  }, [clerkUser?.id, user?.id, isLoggingOut]) // Ajouter isLoggingOut

  // Synchronisation manuelle
  const handleSync = useCallback(async () => {
    if (!user?.id || isSyncing) return false
    
    if (useMockApi) {
      console.log('Mode mock - synchronisation simulée')
      setLastSyncTime(new Date())
      setError(null)
      return true
    }

    setIsSyncing(true)
    try {
      const success = await syncService.forceSync()
      if (success) {
        setLastSyncTime(new Date())
        setError(null)
      }
      return success
    } catch (error: any) {
      setError('Erreur de synchronisation')
      return false
    } finally {
      setIsSyncing(false)
    }
  }, [user?.id, isSyncing, setError, useMockApi])

  // Synchronisation automatique périodique (désactivée en mode mock)
  useEffect(() => {
    if (!user?.id || useMockApi) return

    // Synchronisation initiale après connexion
    const initialSync = setTimeout(() => {
      if (isOnline) {
        handleSync()
      }
    }, 1000)

    // Synchronisation périodique toutes les 30 secondes
    const interval = setInterval(() => {
      if (isOnline && !isSyncing) {
        syncService.performSync()
      }
    }, 30000)

    return () => {
      clearTimeout(initialSync)
      clearInterval(interval)
    }
  }, [user?.id, useMockApi]) // Retirer isOnline et isSyncing qui changent souvent

  return {
    isInitialized: !!user,
    isLoading,
    error,
    isOnline,
    isSyncing,
    lastSyncTime,
    sync: handleSync,
    clearError: () => setError(null)
  }
}

export default useDataSync