'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from './keys'
import type { MatchItem } from '@/lib/schemas'

/**
 * Matches the current user is involved in.
 * Faithful port of the mobile `ApiService.fetchUserMatches`: the N+1 query
 * shape (one extra query per match for the "other" intent + counterpart name)
 * mirrors the mobile app and is intentionally kept as-is.
 */
export function useMatches(userId: string) {
  return useQuery({
    queryKey: queryKeys.matches(userId),
    queryFn: async (): Promise<MatchItem[]> => {
      const supabase = createClient()

      // 1. The user's own intent ids.
      const { data: myIntents, error: myIntentsError } = await supabase
        .from('intents')
        .select('id')
        .eq('user_id', userId)
      if (myIntentsError) throw myIntentsError

      const myIntentIds = (myIntents ?? []).map((row) => row.id as string)
      // 2. No intents → no matches.
      if (myIntentIds.length === 0) return []

      // 3. Matches where the user is on either side.
      const idList = myIntentIds.join(',')
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('id, intent_a, intent_b, status, created_at')
        .or(`intent_a.in.(${idList}),intent_b.in.(${idList})`)
        .order('created_at', { ascending: false })
      if (matchesError) throw matchesError

      const mine = new Set(myIntentIds)
      const results: MatchItem[] = []

      for (const match of matches ?? []) {
        // 4. The "other" intent id is the side not owned by the user.
        const otherId = mine.has(match.intent_a as string)
          ? (match.intent_b as string)
          : (match.intent_a as string)

        const { data: otherIntent, error: otherIntentError } = await supabase
          .from('intents')
          .select('user_id, amount, currency, origin_country, dest_country')
          .eq('id', otherId)
          .single()
        if (otherIntentError || !otherIntent) continue

        // 5. Resolve the counterpart name.
        let counterpartName = 'Utilisateur'
        const { data: counterpart } = await supabase
          .from('users')
          .select('name')
          .eq('auth_id', otherIntent.user_id)
          .single()
        if (counterpart?.name) counterpartName = counterpart.name

        // 6. Build the MatchItem.
        const origin = String(otherIntent.origin_country ?? '')
        const dest = String(otherIntent.dest_country ?? '')
        results.push({
          id: match.id,
          counterpartName,
          amount: Number(otherIntent.amount),
          currency: otherIntent.currency,
          corridor: `${origin.slice(0, 2).toUpperCase()} → ${dest.slice(0, 2).toUpperCase()}`,
          status: match.status as MatchItem['status'],
        })
      }

      return results
    },
    enabled: Boolean(userId),
    refetchInterval: 25_000,
  })
}
