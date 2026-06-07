'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from './keys'
import type { User } from '@/lib/schemas'

/**
 * Reads the current user's row from `users` joined by `auth_id`.
 * Faithful port of the mobile `DataService.syncUserWithSupabase` read.
 */
export function useUserProfile(userId: string, fallbackName = 'Utilisateur') {
  return useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: async (): Promise<User> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('users')
        .select('auth_id, name, kyc_status, rating_avg, avatar_url')
        .eq('auth_id', userId)
        .maybeSingle()
      if (error) throw error
      return {
        id: userId,
        name: data?.name || fallbackName,
        kycStatus: (data?.kyc_status as User['kycStatus']) || 'unverified',
        ratingAvg: Number(data?.rating_avg) || 0,
        avatarUrl: data?.avatar_url || undefined,
      }
    },
    enabled: Boolean(userId),
  })
}
