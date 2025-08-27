import { create } from 'zustand'
import { nanoid } from 'nanoid/non-secure'

export type KycStatus = 'unverified' | 'pending' | 'verified'

export type User = {
  id: string
  name: string
  kycStatus: KycStatus
  ratingAvg: number
  avatarUrl?: string
  avatarUpdatedAt?: number
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
  
  // Error states
  error: string | null
  
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
  
  // General utilities
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const useAppStore = create<AppState>((set, get) => ({
  // User data (mock for development)
  user: {
    id: 'u_1',
    name: 'Tardin',
    kycStatus: 'verified',
    ratingAvg: 4.8,
  },
  notifications: 2,
  
  // Loading states (for future dynamic data)
  isLoading: false,
  isLoadingRequests: false,
  isLoadingMatches: false,
  isLoadingSuggested: false,
  
  // Error states (for future dynamic data)
  error: null,
  
  // Mock data (current development data)
  requests: [
    {
      id: 'r_1',
      type: 'SEND',
      amount: 150,
      currency: 'EUR',
      originCountry: 'France',
      destCountry: 'Sénégal',
      status: 'OPEN',
    },
  ],
  matches: [
    { id: 'm_1', counterpartName: 'Moussa D.', amount: 150, currency: 'EUR', corridor: 'FR → SN', status: 'PENDING' },
    { id: 'm_2', counterpartName: 'Awa S.', amount: 200, currency: 'EUR', corridor: 'FR → CI', status: 'PENDING' },
    { id: 'm_3', counterpartName: 'Koffi A.', amount: 120, currency: 'EUR', corridor: 'FR → CI', status: 'ACCEPTED' },
    { id: 'm_4', counterpartName: 'Fatou N.', amount: 90, currency: 'EUR', corridor: 'FR → SN', status: 'PENDING' },
    { id: 'm_5', counterpartName: 'Yassine M.', amount: 300, currency: 'EUR', corridor: 'FR → MA', status: 'EXPIRED' },
  ],
  suggested: [
    { id: 's_1', amount: 200, currency: 'EUR', originCountryName: 'France', destCountryName: "Côte d'Ivoire", senderName: 'Fatou N.', createdAt: Date.now() - 1000 * 60 * 5 },
    { id: 's_2', amount: 120, currency: 'EUR', originCountryName: 'France', destCountryName: 'Sénégal', senderName: 'Jean P.', createdAt: Date.now() - 1000 * 60 * 12 },
    { id: 's_3', amount: 90, currency: 'EUR', originCountryName: 'France', destCountryName: 'Maroc', senderName: 'Yassine M.', createdAt: Date.now() - 1000 * 60 * 25 },
    { id: 's_4', amount: 300, currency: 'EUR', originCountryName: 'Belgique', destCountryName: 'Cameroun', senderName: 'Brice K.', createdAt: Date.now() - 1000 * 60 * 33 },
    { id: 's_5', amount: 75, currency: 'EUR', originCountryName: 'France', destCountryName: 'République Démocratique du Congo', senderName: 'Aline T.', createdAt: Date.now() - 1000 * 60 * 44 },
    { id: 's_6', amount: 250, currency: 'EUR', originCountryName: 'Canada', destCountryName: 'Bénin', senderName: 'Rachid O.', createdAt: Date.now() - 1000 * 60 * 58 },
    { id: 's_7', amount: 180, currency: 'EUR', originCountryName: 'France', destCountryName: 'Togo', senderName: 'Komi A.', createdAt: Date.now() - 1000 * 60 * 61 },
    { id: 's_8', amount: 60, currency: 'EUR', originCountryName: 'Espagne', destCountryName: 'Guinée', senderName: 'Ibrahima D.', createdAt: Date.now() - 1000 * 60 * 70 },
    { id: 's_9', amount: 220, currency: 'EUR', originCountryName: 'France', destCountryName: 'Mali', senderName: 'Aïssata C.', createdAt: Date.now() - 1000 * 60 * 85 },
    { id: 's_10', amount: 140, currency: 'EUR', originCountryName: 'Suisse', destCountryName: 'Burkina Faso', senderName: 'Paul K.', createdAt: Date.now() - 1000 * 60 * 100 },
  ],
  conversations: [
    {
      id: 'c_1',
      counterpartName: 'Moussa D.',
      lastMessage: 'On se retrouve à 18h à la station…',
      updatedAt: Date.now() - 1000 * 60 * 20,
      unreadCount: 2,
      matchDetails: {
        amount: 150,
        currency: 'EUR',
        corridor: 'France → Sénégal'
      }
    },
    {
      id: 'c_2',
      counterpartName: 'Awa S.',
      lastMessage: 'Parfait, je confirme demain matin.',
      updatedAt: Date.now() - 1000 * 60 * 90,
      unreadCount: 0,
      matchDetails: {
        amount: 200,
        currency: 'EUR',
        corridor: 'France → Côte d\'Ivoire'
      }
    },
  ],
  setUser: (user) => set({ user }),
  incrementNotifications: () => set((s) => ({ notifications: s.notifications + 1 })),
  clearNotifications: () => set({ notifications: 0 }),
  addRequest: ({ type, amount, currency, originCountry, destCountry }) =>
    set((s) => ({
      requests: [
        ...s.requests,
        {
          id: nanoid(8),
          type,
          amount,
          currency,
          originCountry,
          destCountry,
          status: 'OPEN',
        },
      ],
    })),
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

  // New dynamic data functions
  initializeUserData: async (userId: string) => {
    set({ isLoading: true, error: null })
    try {
      // For production: load user data from Supabase/API
      // const userProfile = await fetchUserProfile(userId)
      // const userData = await fetchUserData(userId)
      
      // For now, set mock user data
      const mockUser: User = {
        id: userId,
        name: 'Utilisateur',
        kycStatus: 'unverified',
        ratingAvg: 0,
      }
      
      set({ 
        user: mockUser,
        isLoading: false 
      })
      
      // Load all user-related data
      const state = get()
      await Promise.all([
        state.loadRequests(userId),
        state.loadMatches(userId),
        state.loadSuggested(userId),
        state.loadConversations(userId),
      ])
      
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  loadRequests: async (userId: string) => {
    set({ isLoadingRequests: true })
    try {
      // For production: fetch from Supabase
      // const requests = await supabase.from('intents').select('*').eq('user_id', userId)
      
      // For now, keep empty or load mock data
      set({ requests: [], isLoadingRequests: false })
    } catch (error: any) {
      set({ error: error.message, isLoadingRequests: false })
    }
  },

  loadMatches: async (userId: string) => {
    set({ isLoadingMatches: true })
    try {
      // For production: fetch user matches
      // const matches = await fetchUserMatches(userId)
      
      // Mock data for development
      const mockMatches: MatchItem[] = [
        { id: 'm_1', counterpartName: 'Moussa D.', amount: 150, currency: 'EUR', corridor: 'FR → SN', status: 'PENDING' },
        { id: 'm_2', counterpartName: 'Awa S.', amount: 200, currency: 'EUR', corridor: 'FR → CI', status: 'PENDING' },
      ]
      
      set({ matches: mockMatches, isLoadingMatches: false })
    } catch (error: any) {
      set({ error: error.message, isLoadingMatches: false })
    }
  },

  loadSuggested: async (userId: string) => {
    // For development: keep current mock data, don't override
    set({ isLoadingSuggested: false })
    // For production: this function will load from Supabase
  },

  loadConversations: async (userId: string) => {
    try {
      // For production: fetch user conversations
      // const conversations = await fetchUserConversations(userId)
      
      // Mock data for development
      const mockConversations: Conversation[] = [
        {
          id: 'c_1',
          counterpartName: 'Moussa D.',
          lastMessage: 'On se retrouve à 18h à la station…',
          updatedAt: Date.now() - 1000 * 60 * 20,
          unreadCount: 2,
          matchDetails: {
            amount: 150,
            currency: 'EUR',
            corridor: 'France → Sénégal'
          }
        },
      ]
      
      set({ conversations: mockConversations })
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  // Conversations management
  addConversation: (conversation: Omit<Conversation, 'id'>) => {
    const conversationId = nanoid(8)
    const newConversation: Conversation = {
      id: conversationId,
      ...conversation,
    }
    
    set((s) => ({
      conversations: [newConversation, ...s.conversations],
    }))
    
    return conversationId
  },

  addMessageToConversation: (conversationId: string, message: string, isFromMe: boolean) => {
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
    }))
  },

  // Match acceptance logic
  acceptSuggestion: async (suggestionId: string, myUserId: string) => {
    const state = get()
    const suggestion = state.suggested.find((s) => s.id === suggestionId)
    
    if (!suggestion) return null

    try {
      // 1. Créer une nouvelle conversation
      const conversationId = state.addConversation({
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

      // 2. Ajouter le match aux matches de l'utilisateur actuel
      const newMatch: MatchItem = {
        id: nanoid(8),
        counterpartName: suggestion.senderName,
        amount: suggestion.amount,
        currency: suggestion.currency,
        corridor: `${suggestion.originCountryName.slice(0, 2).toUpperCase()} → ${suggestion.destCountryName.slice(0, 2).toUpperCase()}`,
        status: 'ACCEPTED',
      }

      set((s) => ({
        matches: [newMatch, ...s.matches],
        notifications: s.notifications + 1,
      }))

      // 3. Supprimer la suggestion de la liste
      state.removeSuggestion(suggestionId)

      // 4. Pour production: Notifier l'autre utilisateur et créer le match dans Supabase
      // await createMatch(suggestionId, myUserId)
      // await notifyUser(suggestion.userId, 'match_accepted')

      return conversationId
    } catch (error: any) {
      state.setError('Erreur lors de l\'acceptation du match')
      return null
    }
  },

  removeSuggestion: (suggestionId: string) => {
    set((s) => ({
      suggested: s.suggested.filter((item) => item.id !== suggestionId),
    }))
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  
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
    error: null,
  }),
}))

export default useAppStore


