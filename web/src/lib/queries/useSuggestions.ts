'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from './keys'
import type { SuggestedItem } from '@/lib/schemas'

/**
 * OTHER users' open intentions (shown in "Propositions pour vous").
 * Critical visibility rule: never return the current user's own intents.
 */
export function useSuggestions(userId: string) {
  return useQuery({
    queryKey: queryKeys.suggestions(userId),
    queryFn: async (): Promise<SuggestedItem[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('intents')
        .select('id, amount, currency, origin_country, dest_country, user_name, note, created_at')
        .neq('user_id', userId)
        .eq('status', 'OPEN')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map((row) => ({
        id: row.id,
        amount: Number(row.amount),
        currency: row.currency,
        originCountryName: row.origin_country,
        destCountryName: row.dest_country,
        senderName: row.user_name ?? 'Utilisateur',
        note: row.note ?? undefined,
        createdAt: new Date(row.created_at).getTime(),
      }))
    },
    enabled: Boolean(userId),
    refetchInterval: 25_000,
  })
}
