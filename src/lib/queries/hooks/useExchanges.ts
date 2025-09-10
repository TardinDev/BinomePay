import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-expo'
import ApiService from '@/services/apiService'
import { queryKeys } from '../keys'
import { RequestItemSchema, MatchItemSchema, SuggestedItemSchema } from '@/lib/schemas'
import type { RequestItem, MatchItem, SuggestedItem } from '@/lib/schemas'
import { z } from 'zod'

// Requests/Intentions hooks
export const useRequests = () => {
  const { userId } = useAuth()
  
  return useQuery({
    queryKey: queryKeys.requests(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated')
      const response = await ApiService.fetchUserRequests(userId)
      return z.array(RequestItemSchema).parse(response)
    },
    enabled: !!userId,
  })
}

export const useCreateRequest = () => {
  const queryClient = useQueryClient()
  const { userId } = useAuth()

  return useMutation({
    mutationFn: async (requestData: Omit<RequestItem, 'id' | 'status'>) => {
      if (!userId) throw new Error('User not authenticated')
      return await ApiService.createRequest(userId, requestData)
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.requests(userId) })
      }
    },
  })
}

// Matches hooks
export const useMatches = () => {
  const { userId } = useAuth()
  
  return useQuery({
    queryKey: queryKeys.matches(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated')
      const response = await ApiService.fetchUserMatches(userId)
      return z.array(MatchItemSchema).parse(response)
    },
    enabled: !!userId,
  })
}

// Suggestions hooks
export const useSuggestions = () => {
  const { userId } = useAuth()
  
  return useQuery({
    queryKey: queryKeys.suggestions(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated')
      const response = await ApiService.fetchSuggestionsForUser(userId)
      return z.array(SuggestedItemSchema).parse(response)
    },
    enabled: !!userId,
  })
}

export const useAcceptSuggestion = () => {
  const queryClient = useQueryClient()
  const { userId } = useAuth()

  return useMutation({
    mutationFn: async (suggestionId: string) => {
      if (!userId) throw new Error('User not authenticated')
      return await ApiService.acceptSuggestion(suggestionId, userId)
    },
    onSuccess: () => {
      if (userId) {
        // Invalidate multiple queries since accepting affects suggestions, matches, and conversations
        queryClient.invalidateQueries({ queryKey: queryKeys.suggestions(userId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.matches(userId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations(userId) })
      }
    },
  })
}