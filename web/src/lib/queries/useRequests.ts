'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from './keys'
import type { RequestItem } from '@/lib/schemas'

/** My own intentions (shown in "Mes intentions"). */
export function useRequests(userId: string) {
  return useQuery({
    queryKey: queryKeys.requests(userId),
    queryFn: async (): Promise<RequestItem[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('intents')
        .select('id, direction, amount, currency, origin_country, dest_country, status')
        .eq('user_id', userId)
        .in('status', ['OPEN', 'MATCHED'])
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map((row) => ({
        id: row.id,
        type: row.direction as RequestItem['type'],
        amount: Number(row.amount),
        currency: row.currency,
        originCountry: row.origin_country,
        destCountry: row.dest_country,
        status: row.status as RequestItem['status'],
      }))
    },
    enabled: Boolean(userId),
    refetchInterval: 25_000,
  })
}
