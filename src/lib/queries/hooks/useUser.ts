import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-expo'
import ApiService from '@/services/apiService'
import { queryKeys } from '../keys'
import { UserSchema } from '@/lib/schemas'
import type { User } from '@/lib/schemas'

export const useUserProfile = () => {
  const { userId } = useAuth()
  
  return useQuery({
    queryKey: queryKeys.userProfile(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated')
      const response = await ApiService.fetchUserProfile(userId)
      return UserSchema.parse(response)
    },
    enabled: !!userId,
  })
}

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient()
  const { userId } = useAuth()

  return useMutation({
    mutationFn: async (userData: Partial<User>) => {
      if (!userId) throw new Error('User not authenticated')
      return await ApiService.updateUserProfile(userId, userData)
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.userProfile(userId) })
      }
    },
  })
}

export const useUserRating = () => {
  const { userId } = useAuth()
  
  return useQuery({
    queryKey: queryKeys.userRating(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated')
      const ratingService = await import('@/services/ratingService')
      return await ratingService.default.getUserRating(userId)
    },
    enabled: !!userId,
  })
}