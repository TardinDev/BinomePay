import { create } from 'zustand'
import { nanoid } from 'nanoid/non-secure'
import { notifyMatchAccepted, notifyNewMessage } from '@/services/notificationService'
import ratingService, { UserRating } from '@/services/ratingService'
import ApiService from '@/services/apiService'

export type KycStatus = 'unverified' | 'pending' | 'verified'

export type User = {
  id: string
  name: string
  kycStatus: KycStatus
  ratingAvg: number
  avatarUrl?: string
  avatarUpdatedAt?: number
  userRating?: UserRating
}

export type RequestItem = {
  id: string
  type: 'SEND' | 'RECEIVE'
  amount: number
  currency: string
  originCountry: string
  destCountry: string
  status: 'OPEN' | 'MATCHED' | 'CLOSED'
}

export type MatchItem = {
  id: string
  counterpartName: string
  amount: number
  currency: string
  corridor: string
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED'
}

export type Conversation = {
  id: string
  counterpartName: string
  lastMessage: string
  updatedAt: number
  unreadCount: number
  matchDetails?: {
    amount: number
    currency: string
    corridor: string
  }
}

export type SuggestedItem = {
  id: string
  amount: number
  currency: string
  originCountryName: string
  destCountryName: string
  senderName: string
  note?: string
  createdAt: number
  isAccepted?: boolean // Ajout d'un flag pour savoir si c'est accepté
  conversationId?: string // ID de la conversation créée
}

type AppState = {
  // Data states
  user: User | null
  notifications: number
  requests: RequestItem[]
  matches: MatchItem[]
  conversations: Conversation[]
  suggested: SuggestedItem[]
  
  // Loading states
  isLoading: boolean
  isLoadingRequests: boolean
  isLoadingMatches: boolean
  isLoadingSuggested: boolean
  
  // Optimistic UI states
  isAcceptingMatch: boolean
  isSendingMessage: boolean
  isCreatingIntention: boolean
  
  // Error states
  error: string | null
  
  // Auth states
  isLoggingOut: boolean
  
  // User actions
  setUser: (user: User | null) => void
  initializeUserData: (userId: string) => Promise<void>
  
  // Notifications
  incrementNotifications: () => void
  clearNotifications: () => void
  
  // Requests/Intentions
  addRequest: (r: Omit<RequestItem, 'id' | 'status'> & { type: 'SEND' | 'RECEIVE' }) => void
  loadRequests: (userId: string) => Promise<void>
  
  // Suggestions
  addSuggested: (s: Omit<SuggestedItem, 'id'>) => void
  loadSuggested: (userId: string) => Promise<void>
  
  // Matches
  setMatches: (items: MatchItem[]) => void
  loadMatches: (userId: string) => Promise<void>
  
  // Conversations
  markConversationRead: (id: string) => void
  loadConversations: (userId: string) => Promise<void>
  addConversation: (conversation: Omit<Conversation, 'id'>) => string
  addMessageToConversation: (conversationId: string, message: string, isFromMe: boolean) => void
  
  // Match acceptance and matching logic
  acceptSuggestion: (suggestionId: string, myUserId: string) => Promise<string | null>
  removeSuggestion: (suggestionId: string) => void
  
  // Optimistic UI actions
  setAcceptingMatch: (loading: boolean) => void
  setSendingMessage: (loading: boolean) => void
  setCreatingIntention: (loading: boolean) => void
  
  // Rating system
  loadUserRating: (userId: string) => Promise<void>
  
  // General utilities
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setLoggingOut: (logging: boolean) => void
  reset: () => void
}

const useAppStore = create<AppState>((set, get) => ({
  // User data - initialement null
  user: null,
  notifications: 0,

  // Loading states
  isLoading: false,
  isLoadingRequests: false,
  isLoadingMatches: false,
  isLoadingSuggested: false,

  // Optimistic UI states
  isAcceptingMatch: false,
  isSendingMessage: false,
  isCreatingIntention: false,

  // Error states
  error: null,

  // Auth states
  isLoggingOut: false,

  // Data - initialement vide
  requests: [],
  matches: [],
  suggested: [],
  conversations: [],
  setUser: (user) => set({ user }),
  incrementNotifications: () => set((s) => ({ notifications: s.notifications + 1 })),
  clearNotifications: () => set({ notifications: 0 }),
  addRequest: async ({ type, amount, currency, originCountry, destCountry }) => {
    const state = get()
    if (!state.user?.id) return
    
    // Optimistic update
    const tempRequest: RequestItem = {
      id: 'temp_' + nanoid(8),
      type,
      amount,
      currency,
      originCountry,
      destCountry,
      status: 'OPEN',
    }
    
    set((s) => ({
      requests: [...s.requests, tempRequest],
      isCreatingIntention: true
    }))
    
    try {
      const newRequest = await ApiService.createRequest(state.user.id, {
        type, amount, currency, originCountry, destCountry
      })
      
      // Remplacer l'intention temporaire par la vraie
      set((s) => ({
        requests: s.requests.map(r => r.id === tempRequest.id ? newRequest : r),
        isCreatingIntention: false
      }))
    } catch (error) {
      // En cas d'erreur, ajouter à la queue hors ligne
      await ApiService.queueOfflineAction({
        type: 'CREATE_REQUEST',
        payload: { type, amount, currency, originCountry, destCountry },
        userId: state.user.id,
        timestamp: Date.now()
      })

      set({ isCreatingIntention: false })
      if (__DEV__) console.error('Erreur création intention:', error)
    }
  },
  addSuggested: ({ amount, currency, originCountryName, destCountryName, senderName, note, createdAt }) =>
    set((s) => ({
      suggested: [
        {
          id: nanoid(8),
          amount,
          currency,
          originCountryName,
          destCountryName,
          senderName,
          note,
          createdAt,
        },
        ...s.suggested,
      ],
    })),
  setMatches: (items) => set({ matches: items }),
  markConversationRead: (id) =>
    set((s) => ({
      conversations: s.conversations.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
    })),

  // Dynamic data initialization with API integration
  initializeUserData: async (userId: string) => {
    const currentState = get()

    // Ne pas initialiser si on est en train de se déconnecter
    if (currentState.isLoggingOut) {
      if (__DEV__) console.log('Initialisation annulée - déconnexion en cours')
      return
    }

    set({ isLoading: true, error: null })

    try {
      // Charger le profil utilisateur
      try {
        const userProfile = await ApiService.fetchUserProfile(userId)
        set({ user: userProfile })
      } catch (error) {
        if (__DEV__) console.warn('API non disponible, création profil par défaut:', error)
        const defaultUser: User = {
          id: userId,
          name: 'Utilisateur',
          kycStatus: 'unverified',
          ratingAvg: 0,
        }
        set({ user: defaultUser })
      }

      set({ isLoading: false })

      // Charger toutes les données utilisateur en parallèle
      const storeState = get()
      await Promise.allSettled([
        storeState.loadRequests(userId),
        storeState.loadMatches(userId),
        storeState.loadSuggested(userId),
        storeState.loadConversations(userId),
        storeState.loadUserRating(userId)
      ])

      // Initialiser le service de synchronisation
      try {
        const { syncService } = await import('@/services/syncService')
        await syncService.initialize()
      } catch (error) {
        if (__DEV__) console.error('Erreur initialisation syncService:', error)
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      set({ error: errorMessage, isLoading: false })
      if (__DEV__) console.error('Erreur initialisation données utilisateur:', error)
    }
  },

  loadRequests: async (userId: string) => {
    set({ isLoadingRequests: true })
    try {
      const requests = await ApiService.fetchUserRequests(userId)
      set({ requests, isLoadingRequests: false })
    } catch (error) {
      if (__DEV__) console.warn('Erreur chargement intentions:', error)
      set({ isLoadingRequests: false })
    }
  },

  loadMatches: async (userId: string) => {
    set({ isLoadingMatches: true })
    try {
      const matches = await ApiService.fetchUserMatches(userId)
      set({ matches, isLoadingMatches: false })
    } catch (error) {
      if (__DEV__) console.warn('Erreur chargement matches:', error)
      set({ isLoadingMatches: false })
    }
  },

  loadSuggested: async (userId: string) => {
    set({ isLoadingSuggested: true })
    try {
      const suggestions = await ApiService.fetchSuggestionsForUser(userId)
      set({ suggested: suggestions, isLoadingSuggested: false })
    } catch (error) {
      if (__DEV__) console.warn('Erreur chargement suggestions:', error)
      set({ isLoadingSuggested: false })
    }
  },

  loadConversations: async (userId: string) => {
    try {
      const conversations = await ApiService.fetchUserConversations(userId)
      set({ conversations })
    } catch (error) {
      if (__DEV__) console.warn('Erreur chargement conversations:', error)
    }
  },

  // Conversations management
  addConversation: (conversation: Omit<Conversation, 'id'>) => {
    const conversationId = 'conv_' + nanoid(8) // Ajouter un préfixe pour éviter les conflits
    const newConversation: Conversation = {
      id: conversationId,
      ...conversation,
    }
    
    set((s) => ({
      conversations: [newConversation, ...s.conversations],
    }))
    
    return conversationId
  },

  addMessageToConversation: async (conversationId: string, message: string, isFromMe: boolean) => {
    // Mise à jour optimiste locale
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: message,
              updatedAt: Date.now(),
              unreadCount: isFromMe ? c.unreadCount : c.unreadCount + 1,
            }
          : c
      ),
      isSendingMessage: isFromMe
    }))

    // Si c'est mon message, l'envoyer à l'API
    if (isFromMe) {
      const state = get()
      try {
        if (state.user?.id) {
          await ApiService.sendMessage(conversationId, message, state.user.id)
        }
      } catch (error) {
        // En cas d'erreur, ajouter à la queue hors ligne
        if (state.user?.id) {
          await ApiService.queueOfflineAction({
            type: 'SEND_MESSAGE',
            payload: { conversationId, message },
            userId: state.user.id,
            timestamp: Date.now()
          })
        }
        if (__DEV__) console.error('Erreur envoi message:', error)
      } finally {
        set({ isSendingMessage: false })
      }
    } else {
      // Message reçu - envoyer notification
      const conversation = get().conversations.find(c => c.id === conversationId)
      if (conversation) {
        notifyNewMessage(conversation.counterpartName, message, conversationId)
      }
    }
  },

  // Match acceptance logic with API integration
  acceptSuggestion: async (suggestionId: string, myUserId: string) => {
    const state = get()
    const suggestion = state.suggested.find((s) => s.id === suggestionId)
    
    if (!suggestion) return null

    set({ isAcceptingMatch: true })

    try {
      // Essayer d'accepter via l'API d'abord
      let apiResult: { conversationId: string; matchId: string } | null = null
      
      try {
        apiResult = await ApiService.acceptSuggestion(suggestionId, myUserId)
      } catch (error) {
        if (__DEV__) console.warn('API non disponible, traitement local:', error)
        // En cas d'erreur API, ajouter à la queue hors ligne
        await ApiService.queueOfflineAction({
          type: 'ACCEPT_SUGGESTION',
          payload: { suggestionId },
          userId: myUserId,
          timestamp: Date.now()
        })
      }

      // Mise à jour locale (optimiste ou avec données API)
      const conversationId = apiResult?.conversationId || state.addConversation({
        counterpartName: suggestion.senderName,
        lastMessage: 'Match créé ! Vous pouvez maintenant discuter.',
        updatedAt: Date.now(),
        unreadCount: 0,
        matchDetails: {
          amount: suggestion.amount,
          currency: suggestion.currency,
          corridor: `${suggestion.originCountryName} → ${suggestion.destCountryName}`
        }
      })

      const newMatch: MatchItem = {
        id: apiResult?.matchId || nanoid(8),
        counterpartName: suggestion.senderName,
        amount: suggestion.amount,
        currency: suggestion.currency,
        corridor: `${suggestion.originCountryName.slice(0, 2).toUpperCase()} → ${suggestion.destCountryName.slice(0, 2).toUpperCase()}`,
        status: 'ACCEPTED',
      }

      set((s) => ({
        matches: [newMatch, ...s.matches],
        notifications: s.notifications + 1,
        suggested: s.suggested.map((item) => 
          item.id === suggestionId 
            ? { ...item, isAccepted: true, conversationId }
            : item
        ),
      }))

      await notifyMatchAccepted(
        suggestion.senderName,
        suggestion.amount,
        suggestion.currency,
        `${suggestion.originCountryName} → ${suggestion.destCountryName}`
      )

      return conversationId
    } catch (error) {
      get().setError('Erreur lors de l\'acceptation du match')
      if (__DEV__) console.error('Erreur acceptation match:', error)
      return null
    } finally {
      set({ isAcceptingMatch: false })
    }
  },

  removeSuggestion: (suggestionId: string) => {
    set((s) => ({
      suggested: s.suggested.filter((item) => item.id !== suggestionId),
    }))
  },

  // Rating system
  loadUserRating: async (userId: string) => {
    try {
      const userRating = await ratingService.getUserRating(userId)
      set((s) => ({
        user: s.user ? { ...s.user, userRating } : null,
      }))
    } catch (error) {
      if (__DEV__) console.error('Erreur lors du chargement du rating:', error)
    }
  },

  // Optimistic UI actions
  setAcceptingMatch: (loading: boolean) => set({ isAcceptingMatch: loading }),
  setSendingMessage: (loading: boolean) => set({ isSendingMessage: loading }),
  setCreatingIntention: (loading: boolean) => set({ isCreatingIntention: loading }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  setLoggingOut: (logging: boolean) => set({ isLoggingOut: logging }),
  
  reset: () => set({
    user: null,
    notifications: 0,
    requests: [],
    matches: [],
    conversations: [],
    suggested: [],
    isLoading: false,
    isLoadingRequests: false,
    isLoadingMatches: false,
    isLoadingSuggested: false,
    isAcceptingMatch: false,
    isSendingMessage: false,
    isCreatingIntention: false,
    error: null,
    isLoggingOut: false, // Reset du flag de déconnexion
  }),
}))

export default useAppStore


