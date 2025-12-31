import NetInfo from '@react-native-community/netinfo'
import ApiService from './apiService'
import useAppStore, { RequestItem, MatchItem, Conversation, SuggestedItem } from '@/store/useAppStore'
import { notifyMatchAccepted, notifyNewMessage, notifyNewSuggestion } from './notificationService'

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'

class SyncService {
  private syncInProgress = false
  private lastSyncTimestamp = 0
  private syncInterval: NodeJS.Timeout | null = null
  private readonly SYNC_INTERVAL = 30000 // 30 secondes
  private readonly MIN_SYNC_INTERVAL = 5000 // 5 secondes minimum entre syncs
  private readonly USE_MOCK_API = process.env.EXPO_PUBLIC_MOCK_API === 'true'

  // ================================
  // INITIALISATION ET CONTRÔLE
  // ================================

  async initialize(): Promise<void> {
    if (this.USE_MOCK_API) {
      if (__DEV__) console.log('Mode mock actif - synchronisation désactivée')
      return
    }
    
    // Écouter les changements de connectivité
    NetInfo.addEventListener(state => {
      if (state.isConnected && !this.syncInProgress) {
        this.performSync()
      }
    })

    // Démarrer la synchronisation périodique
    this.startPeriodicSync()

    // Synchronisation initiale si connecté
    const netInfo = await NetInfo.fetch()
    if (netInfo.isConnected) {
      await this.performSync()
    }
  }

  startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = setInterval(async () => {
      const netInfo = await NetInfo.fetch()
      if (netInfo.isConnected && !this.syncInProgress) {
        await this.performSync()
      }
    }, this.SYNC_INTERVAL)
  }

  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // ================================
  // SYNCHRONISATION PRINCIPALE
  // ================================

  async performSync(force = false): Promise<boolean> {
    if (this.USE_MOCK_API) {
      if (__DEV__) console.log('Mode mock - synchronisation ignorée')
      return true
    }
    
    const now = Date.now()
    
    // Éviter la synchronisation trop fréquente
    if (!force && (now - this.lastSyncTimestamp) < this.MIN_SYNC_INTERVAL) {
      return false
    }

    if (this.syncInProgress) {
      return false
    }

    try {
      this.syncInProgress = true
      this.lastSyncTimestamp = now

      const store = useAppStore.getState()
      const userId = store.user?.id

      if (!userId) {
        if (__DEV__) console.log('Aucun utilisateur connecté pour la synchronisation')
        return false
      }

      // Vérifier la connectivité
      const netInfo = await NetInfo.fetch()
      if (!netInfo.isConnected) {
        if (__DEV__) console.log('Pas de connexion réseau pour la synchronisation')
        return false
      }

      // Vérifier la santé de l'API
      const apiHealthy = await ApiService.checkApiHealth()
      if (!apiHealthy) {
        if (__DEV__) console.log('API non disponible')
        return false
      }

      if (__DEV__) console.log('Début de la synchronisation pour l\'utilisateur:', userId)

      // 1. Traiter d'abord les actions hors ligne en attente
      await ApiService.processOfflineQueue()

      // 2. Synchroniser les données utilisateur
      await this.syncAllUserData(userId)

      if (__DEV__) console.log('Synchronisation terminée avec succès')
      return true

    } catch (error) {
      if (__DEV__) console.error('Erreur lors de la synchronisation:', error)
      return false
    } finally {
      this.syncInProgress = false
    }
  }

  // ================================
  // SYNCHRONISATION PAR TYPE DE DONNÉES
  // ================================

  private async syncAllUserData(userId: string): Promise<void> {
    try {
      // Synchronisation complète en une requête pour optimiser
      const syncData = await ApiService.syncUserData(userId)
      
      const store = useAppStore.getState()
      
      // Mettre à jour le store avec les nouvelles données
      store.setUser(syncData.user)
      store.setMatches(syncData.matches)
      
      // Pour les autres données, utiliser les fonctions de mise à jour spécifiques
      this.updateRequestsIfChanged(syncData.requests)
      this.updateConversationsIfChanged(syncData.conversations)
      this.updateSuggestionsIfChanged(syncData.suggestions)

    } catch (error) {
      if (__DEV__) console.error('Erreur synchronisation données utilisateur:', error)

      // En cas d'erreur, essayer la synchronisation par parties
      await this.fallbackSyncUserData(userId)
    }
  }

  private async fallbackSyncUserData(userId: string): Promise<void> {
    try {
      // Synchroniser en parallèle avec gestion d'erreur individuelle
      await Promise.allSettled([
        this.syncUserProfile(userId),
        this.syncUserRequests(userId),
        this.syncUserMatches(userId),
        this.syncUserConversations(userId),
        this.syncUserSuggestions(userId)
      ])
    } catch (error) {
      if (__DEV__) console.error('Erreur synchronisation fallback:', error)
    }
  }

  private async syncUserProfile(userId: string): Promise<void> {
    try {
      const userProfile = await ApiService.fetchUserProfile(userId)
      const store = useAppStore.getState()
      store.setUser(userProfile)
    } catch (error) {
      if (__DEV__) console.error('Erreur sync profil utilisateur:', error)
    }
  }

  private async syncUserRequests(userId: string): Promise<void> {
    try {
      const requests = await ApiService.fetchUserRequests(userId)
      this.updateRequestsIfChanged(requests)
    } catch (error) {
      if (__DEV__) console.error('Erreur sync intentions utilisateur:', error)
    }
  }

  private async syncUserMatches(userId: string): Promise<void> {
    try {
      const matches = await ApiService.fetchUserMatches(userId)
      this.updateMatchesIfChanged(matches)
    } catch (error) {
      if (__DEV__) console.error('Erreur sync matches utilisateur:', error)
    }
  }

  private async syncUserConversations(userId: string): Promise<void> {
    try {
      const conversations = await ApiService.fetchUserConversations(userId)
      this.updateConversationsIfChanged(conversations)
    } catch (error) {
      if (__DEV__) console.error('Erreur sync conversations utilisateur:', error)
    }
  }

  private async syncUserSuggestions(userId: string): Promise<void> {
    try {
      const suggestions = await ApiService.fetchSuggestionsForUser(userId)
      this.updateSuggestionsIfChanged(suggestions)
    } catch (error) {
      if (__DEV__) console.error('Erreur sync suggestions utilisateur:', error)
    }
  }

  // ================================
  // MISE À JOUR INTELLIGENTE DES DONNÉES
  // ================================

  private updateRequestsIfChanged(newRequests: RequestItem[]): void {
    const store = useAppStore.getState()
    const currentRequests = store.requests

    // Comparer et mettre à jour seulement si différent
    if (this.hasDataChanged(currentRequests, newRequests)) {
      useAppStore.setState({ requests: newRequests })
      if (__DEV__) console.log('Intentions mises à jour')
    }
  }

  private updateMatchesIfChanged(newMatches: MatchItem[]): void {
    const store = useAppStore.getState()
    const currentMatches = store.matches

    if (this.hasDataChanged(currentMatches, newMatches)) {
      store.setMatches(newMatches)

      // Détecter les nouveaux matches pour les notifications
      this.checkForNewMatches(currentMatches, newMatches)
      if (__DEV__) console.log('Matches mis à jour')
    }
  }

  private updateConversationsIfChanged(newConversations: Conversation[]): void {
    const store = useAppStore.getState()
    const currentConversations = store.conversations

    if (this.hasDataChanged(currentConversations, newConversations)) {
      // Détecter les nouveaux messages pour les notifications
      this.checkForNewMessages(currentConversations, newConversations)

      // Mettre à jour le store
      useAppStore.setState({ conversations: newConversations })
      if (__DEV__) console.log('Conversations mises à jour')
    }
  }

  private updateSuggestionsIfChanged(newSuggestions: SuggestedItem[]): void {
    const store = useAppStore.getState()
    const currentSuggestions = store.suggested

    if (this.hasDataChanged(currentSuggestions, newSuggestions)) {
      // Détecter les nouvelles suggestions pour les notifications
      this.checkForNewSuggestions(currentSuggestions, newSuggestions)

      useAppStore.setState({ suggested: newSuggestions })
      if (__DEV__) console.log('Suggestions mises à jour')
    }
  }

  // ================================
  // DÉTECTION DES CHANGEMENTS
  // ================================

  private hasDataChanged<T extends { id: string; updatedAt?: number; createdAt?: number }>(
    current: T[],
    updated: T[]
  ): boolean {
    if (current.length !== updated.length) return true

    // Comparaison simple basée sur les IDs et timestamps
    const currentIds = current.map(item => `${item.id}-${item.updatedAt || item.createdAt}`).sort()
    const updatedIds = updated.map(item => `${item.id}-${item.updatedAt || item.createdAt}`).sort()

    return JSON.stringify(currentIds) !== JSON.stringify(updatedIds)
  }

  private checkForNewMatches(oldMatches: MatchItem[], newMatches: MatchItem[]): void {
    const oldIds = new Set(oldMatches.map(m => m.id))
    const newItems = newMatches.filter(m => !oldIds.has(m.id))

    newItems.forEach(match => {
      notifyMatchAccepted(
        match.counterpartName,
        match.amount,
        match.currency,
        match.corridor
      )
    })
  }

  private checkForNewMessages(oldConversations: Conversation[], newConversations: Conversation[]): void {
    const oldConvMap = new Map(oldConversations.map(c => [c.id, c]))

    newConversations.forEach(newConv => {
      const oldConv = oldConvMap.get(newConv.id)
      if (oldConv && oldConv.updatedAt < newConv.updatedAt && newConv.unreadCount > oldConv.unreadCount) {
        notifyNewMessage(
          newConv.counterpartName,
          newConv.lastMessage,
          newConv.id
        )
      }
    })
  }

  private checkForNewSuggestions(oldSuggestions: SuggestedItem[], newSuggestions: SuggestedItem[]): void {
    const oldIds = new Set(oldSuggestions.map(s => s.id))
    const newItems = newSuggestions.filter(s => !oldIds.has(s.id))

    if (newItems.length > 0) {
      notifyNewSuggestion(newItems.length)
    }
  }

  // ================================
  // SYNCHRONISATION FORCÉE PAR L'UTILISATEUR
  // ================================

  async forceSync(): Promise<boolean> {
    if (this.USE_MOCK_API) {
      if (__DEV__) console.log('Mode mock - synchronisation forcée ignorée')
      return true
    }

    if (__DEV__) console.log('Synchronisation forcée par l\'utilisateur')
    return await this.performSync(true)
  }

  // ================================
  // NETTOYAGE
  // ================================

  destroy(): void {
    this.stopPeriodicSync()
    this.syncInProgress = false
  }

  // ================================
  // GETTERS POUR L'UI
  // ================================

  get isSyncing(): boolean {
    return this.syncInProgress
  }

  get lastSyncTime(): number {
    return this.lastSyncTimestamp
  }
}

// Instance singleton
export const syncService = new SyncService()
export default syncService