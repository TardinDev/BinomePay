import { create } from 'zustand'
import { nanoid } from 'nanoid/non-secure'
import ApiService from '@/services/apiService'
import { notifyMatchAccepted } from '@/services/notificationService'

export type MatchStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'COMPLETED'

export interface Match {
  id: string
  counterpartName: string
  counterpartId?: string
  amount: number
  currency: string
  corridor: string
  status: MatchStatus
  createdAt?: number
  conversationId?: string
}

export interface Suggestion {
  id: string
  amount: number
  currency: string
  originCountryName: string
  destCountryName: string
  senderName: string
  senderId?: string
  note?: string
  createdAt: number
  isAccepted?: boolean
  conversationId?: string
}

interface MatchState {
  matches: Match[]
  suggestions: Suggestion[]
  isLoadingMatches: boolean
  isLoadingSuggestions: boolean
  isAccepting: boolean

  // Actions
  setMatches: (matches: Match[]) => void
  setSuggestions: (suggestions: Suggestion[]) => void
  loadMatches: (userId: string) => Promise<void>
  loadSuggestions: (userId: string) => Promise<void>
  acceptSuggestion: (
    suggestionId: string,
    userId: string,
    onConversationCreated?: (conversationId: string) => void
  ) => Promise<string | null>
  updateMatchStatus: (matchId: string, status: MatchStatus) => Promise<void>
  removeSuggestion: (suggestionId: string) => void
  reset: () => void
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: [],
  suggestions: [],
  isLoadingMatches: false,
  isLoadingSuggestions: false,
  isAccepting: false,

  setMatches: (matches) => set({ matches }),
  setSuggestions: (suggestions) => set({ suggestions }),

  loadMatches: async (userId) => {
    set({ isLoadingMatches: true })
    try {
      const matches = await ApiService.fetchUserMatches(userId)
      set({ matches, isLoadingMatches: false })
    } catch (error) {
      if (__DEV__) console.warn('Error loading matches:', error)
      set({ isLoadingMatches: false })
    }
  },

  loadSuggestions: async (userId) => {
    set({ isLoadingSuggestions: true })
    try {
      const suggestions = await ApiService.fetchSuggestionsForUser(userId)
      set({ suggestions, isLoadingSuggestions: false })
    } catch (error) {
      if (__DEV__) console.warn('Error loading suggestions:', error)
      set({ isLoadingSuggestions: false })
    }
  },

  acceptSuggestion: async (suggestionId, userId, onConversationCreated) => {
    const { suggestions } = get()
    const suggestion = suggestions.find((s) => s.id === suggestionId)

    if (!suggestion) return null

    set({ isAccepting: true })

    try {
      // Try API first
      let apiResult: { conversationId: string; matchId: string } | null = null

      try {
        apiResult = await ApiService.acceptSuggestion(suggestionId, userId)
      } catch (error) {
        if (__DEV__) console.warn('API not available, processing locally:', error)
        // Queue for offline
        await ApiService.queueOfflineAction({
          type: 'ACCEPT_SUGGESTION',
          payload: { suggestionId },
          userId,
          timestamp: Date.now(),
        })
      }

      const conversationId = apiResult?.conversationId || 'conv_' + nanoid(8)

      // Create new match
      const newMatch: Match = {
        id: apiResult?.matchId || nanoid(8),
        counterpartName: suggestion.senderName,
        counterpartId: suggestion.senderId,
        amount: suggestion.amount,
        currency: suggestion.currency,
        corridor: `${suggestion.originCountryName.slice(0, 2).toUpperCase()} → ${suggestion.destCountryName.slice(0, 2).toUpperCase()}`,
        status: 'ACCEPTED',
        createdAt: Date.now(),
        conversationId,
      }

      set((state) => ({
        matches: [newMatch, ...state.matches],
        suggestions: state.suggestions.map((s) =>
          s.id === suggestionId
            ? { ...s, isAccepted: true, conversationId }
            : s
        ),
        isAccepting: false,
      }))

      // Notify callback for conversation creation
      if (onConversationCreated) {
        onConversationCreated(conversationId)
      }

      // Send notification
      await notifyMatchAccepted(
        suggestion.senderName,
        suggestion.amount,
        suggestion.currency,
        `${suggestion.originCountryName} → ${suggestion.destCountryName}`
      )

      return conversationId
    } catch (error) {
      set({ isAccepting: false })
      if (__DEV__) console.error('Error accepting suggestion:', error)
      return null
    }
  },

  updateMatchStatus: async (matchId, status) => {
    // Optimistic update
    set((state) => ({
      matches: state.matches.map((m) =>
        m.id === matchId ? { ...m, status } : m
      ),
    }))

    try {
      await ApiService.updateMatchStatus(matchId, status as any)
    } catch (error) {
      if (__DEV__) console.error('Error updating match status:', error)
    }
  },

  removeSuggestion: (suggestionId) => {
    set((state) => ({
      suggestions: state.suggestions.filter((s) => s.id !== suggestionId),
    }))
  },

  reset: () =>
    set({
      matches: [],
      suggestions: [],
      isLoadingMatches: false,
      isLoadingSuggestions: false,
      isAccepting: false,
    }),
}))

export default useMatchStore
