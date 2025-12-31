import { create } from 'zustand'
import { nanoid } from 'nanoid/non-secure'
import ApiService from '@/services/apiService'

export type IntentionType = 'SEND' | 'RECEIVE'
export type IntentionStatus = 'OPEN' | 'MATCHED' | 'CLOSED'

export interface Intention {
  id: string
  type: IntentionType
  amount: number
  currency: string
  originCountry: string
  destCountry: string
  status: IntentionStatus
  createdAt?: number
}

interface IntentionState {
  intentions: Intention[]
  isLoading: boolean
  isCreating: boolean
  error: string | null

  // Actions
  setIntentions: (intentions: Intention[]) => void
  loadIntentions: (userId: string) => Promise<void>
  createIntention: (
    userId: string,
    intention: Omit<Intention, 'id' | 'status'>
  ) => Promise<Intention | null>
  updateIntentionStatus: (intentionId: string, status: IntentionStatus) => Promise<void>
  removeIntention: (intentionId: string) => void
  reset: () => void
}

export const useIntentionStore = create<IntentionState>((set, get) => ({
  intentions: [],
  isLoading: false,
  isCreating: false,
  error: null,

  setIntentions: (intentions) => set({ intentions }),

  loadIntentions: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      const intentions = await ApiService.fetchUserRequests(userId)
      set({ intentions, isLoading: false })
    } catch (error) {
      if (__DEV__) console.warn('Error loading intentions:', error)
      set({ isLoading: false })
    }
  },

  createIntention: async (userId, intention) => {
    set({ isCreating: true, error: null })

    // Create temporary intention for optimistic update
    const tempIntention: Intention = {
      id: 'temp_' + nanoid(8),
      ...intention,
      status: 'OPEN',
      createdAt: Date.now(),
    }

    // Optimistic update
    set((state) => ({
      intentions: [...state.intentions, tempIntention],
    }))

    try {
      const newIntention = await ApiService.createRequest(userId, intention)

      // Replace temp with real intention
      set((state) => ({
        intentions: state.intentions.map((i) =>
          i.id === tempIntention.id ? newIntention : i
        ),
        isCreating: false,
      }))

      return newIntention
    } catch (error) {
      // Queue for offline processing
      await ApiService.queueOfflineAction({
        type: 'CREATE_REQUEST',
        payload: intention,
        userId,
        timestamp: Date.now(),
      })

      set({ isCreating: false })
      if (__DEV__) console.error('Error creating intention:', error)

      // Keep the temp intention in the list (will be synced later)
      return tempIntention
    }
  },

  updateIntentionStatus: async (intentionId, status) => {
    // Optimistic update
    set((state) => ({
      intentions: state.intentions.map((i) =>
        i.id === intentionId ? { ...i, status } : i
      ),
    }))

    try {
      await ApiService.updateRequestStatus(intentionId, status)
    } catch (error) {
      if (__DEV__) console.error('Error updating intention status:', error)
    }
  },

  removeIntention: (intentionId) => {
    set((state) => ({
      intentions: state.intentions.filter((i) => i.id !== intentionId),
    }))
  },

  reset: () =>
    set({
      intentions: [],
      isLoading: false,
      isCreating: false,
      error: null,
    }),
}))

export default useIntentionStore
