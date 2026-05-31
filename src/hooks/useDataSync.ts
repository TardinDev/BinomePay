import { useEffect, useState, useCallback, useRef } from 'react'
import useAppStore from '@/store/useAppStore'
import { syncService } from '@/services/syncService'
import NetInfo from '@react-native-community/netinfo'
import { logger } from '@/utils/logger'

export function useDataSync() {
  const user = useAppStore((s) => s.user)
  const isLoading = useAppStore((s) => s.isLoading)
  const error = useAppStore((s) => s.error)
  const setError = useAppStore((s) => s.setError)

  const [isOnline, setIsOnline] = useState(true)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const useMockApi = process.env.EXPO_PUBLIC_MOCK_API === 'true'

  // Référence stable vers la dernière version de handleSync et de l'id user.
  // Permet aux effets ci-dessous de déclencher une synchro sans dépendre de
  // ces valeurs (ce qui recréerait les listeners/timers et provoquerait des
  // boucles ou une double initialisation).
  const handleSyncRef = useRef<() => Promise<boolean>>(() => Promise.resolve(false))
  const userIdRef = useRef<string | undefined>(user?.id)
  userIdRef.current = user?.id
  const isOnlineRef = useRef<boolean>(isOnline)
  isOnlineRef.current = isOnline

  // Surveiller la connectivité réseau (seulement en mode API réel)
  useEffect(() => {
    if (useMockApi) {
      setIsOnline(true) // Toujours "en ligne" en mode mock
      return
    }

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected)

      // Déclencher une synchronisation quand on revient en ligne
      if (state.isConnected && userIdRef.current) {
        handleSyncRef.current()
      }
    })

    return unsubscribe
  }, [useMockApi])

  // NB: L'initialisation des données utilisateur est gérée exclusivement par
  // (Protected)/_layout.tsx (un seul owner) afin d'éviter les doubles fetch et
  // la double initialisation du syncService (listeners NetInfo + interval).

  // Synchronisation manuelle
  const handleSync = useCallback(async () => {
    if (!user?.id || isSyncing) return false

    if (useMockApi) {
      logger.debug('Mode mock - synchronisation simulée')
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
    } catch {
      setError('Erreur de synchronisation')
      return false
    } finally {
      setIsSyncing(false)
    }
  }, [user?.id, isSyncing, setError, useMockApi])

  // Garder la ref synchronisée avec la dernière closure handleSync.
  handleSyncRef.current = handleSync

  // Synchronisation initiale après connexion (désactivée en mode mock).
  // La synchronisation périodique est entièrement pilotée par syncService
  // (un seul interval), initialisé dans initializeUserData. On ne lance ici
  // qu'une synchro initiale ponctuelle pour rafraîchir l'UI rapidement.
  useEffect(() => {
    if (!user?.id || useMockApi) return

    const initialSync = setTimeout(() => {
      // On lit isOnline au moment du tick via la ref pour éviter de redéclencher
      // l'effet (et donc une double synchro) à chaque changement de connectivité.
      if (isOnlineRef.current) {
        handleSyncRef.current()
      }
    }, 1000)

    return () => {
      clearTimeout(initialSync)
    }
  }, [user?.id, useMockApi])

  return {
    isInitialized: !!user,
    isLoading,
    error,
    isOnline,
    isSyncing,
    lastSyncTime,
    sync: handleSync,
    clearError: () => setError(null),
  }
}

export default useDataSync
