import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ApiService from '@/services/apiService'
import ratingService, { UserRating } from '@/services/ratingService'

export type KycStatus = 'unverified' | 'pending' | 'verified'

export interface User {
  id: string
  name: string
  kycStatus: KycStatus
  ratingAvg: number
  avatarUrl?: string
  avatarUpdatedAt?: number
  userRating?: UserRating
}

interface UserState {
  user: User | null
  isLoading: boolean
  error: string | null

  // Actions
  setUser: (user: User | null) => void
  fetchUser: (userId: string) => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<void>
  loadUserRating: (userId: string) => Promise<void>
  setError: (error: string | null) => void
  reset: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),

      fetchUser: async (userId) => {
        set({ isLoading: true, error: null })
        try {
          const userProfile = await ApiService.fetchUserProfile(userId)
          set({ user: userProfile, isLoading: false })
        } catch (error) {
          if (__DEV__) console.warn('Error fetching user profile:', error)
          // Create default user on error
          const defaultUser: User = {
            id: userId,
            name: 'Utilisateur',
            kycStatus: 'unverified',
            ratingAvg: 0,
          }
          set({ user: defaultUser, isLoading: false })
        }
      },

      updateUser: async (updates) => {
        const { user } = get()
        if (!user) return

        // Optimistic update
        set({ user: { ...user, ...updates } })

        try {
          await ApiService.updateUserProfile(user.id, updates)
        } catch (error) {
          // Revert on error
          set({ user })
          if (__DEV__) console.error('Error updating user:', error)
        }
      },

      loadUserRating: async (userId) => {
        try {
          const userRating = await ratingService.getUserRating(userId)
          set((state) => ({
            user: state.user ? { ...state.user, userRating } : null,
          }))
        } catch (error) {
          if (__DEV__) console.error('Error loading user rating:', error)
        }
      },

      setError: (error) => set({ error }),

      reset: () => set({ user: null, isLoading: false, error: null }),
    }),
    {
      name: 'binomepay-user-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
)

export default useUserStore
