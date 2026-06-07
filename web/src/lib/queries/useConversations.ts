'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from './keys'
import type { Conversation } from '@/lib/schemas'

/**
 * Conversations the current user participates in, most recent first.
 *
 * Faithful port of the mobile `ApiService.fetchUserConversations`: the per-conv
 * N+1 query shape (counterpart name, last message, match details) is kept as-is.
 * Each `.single()` that returns null simply yields a fallback value rather than
 * throwing, mirroring the mobile try/catch resilience for the list as a whole.
 */
export function useConversations(userId: string) {
  return useQuery({
    queryKey: queryKeys.conversations(userId),
    queryFn: async (): Promise<Conversation[]> => {
      const supabase = createClient()

      // 1. Conversations the user participates in.
      const { data: participations, error: partError } = await supabase
        .from('conversation_participants')
        .select('conversation_id, unread_count')
        .eq('user_id', userId)
      if (partError) throw partError
      if (!participations || participations.length === 0) return []

      // 2. Conversation ids + unread lookup.
      const convIds = participations.map((p) => p.conversation_id as string)
      const unreadMap = new Map<string, number>(
        participations.map((p) => [p.conversation_id as string, Number(p.unread_count ?? 0)])
      )

      // 3. Conversation details, most recently updated first.
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id, match_id, updated_at')
        .in('id', convIds)
        .order('updated_at', { ascending: false })
      if (convError) throw convError

      const result: Conversation[] = []

      for (const conv of conversations ?? []) {
        // 4a. The other participant → counterpart name.
        const { data: otherParticipant } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conv.id)
          .neq('user_id', userId)
          .single()

        let counterpartName = 'Utilisateur'
        if (otherParticipant?.user_id) {
          const { data: otherUser } = await supabase
            .from('users')
            .select('name')
            .eq('auth_id', otherParticipant.user_id)
            .single()
          counterpartName = otherUser?.name ?? 'Utilisateur'
        }

        // 4b. Last message preview.
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // 4c. Match details (amount, currency, corridor).
        let matchDetails: Conversation['matchDetails'] = undefined
        if (conv.match_id) {
          const { data: match } = await supabase
            .from('matches')
            .select('intent_a')
            .eq('id', conv.match_id)
            .single()

          if (match?.intent_a) {
            const { data: intent } = await supabase
              .from('intents')
              .select('amount, currency, origin_country, dest_country')
              .eq('id', match.intent_a)
              .single()

            if (intent) {
              matchDetails = {
                amount: Number(intent.amount),
                currency: intent.currency,
                corridor: `${intent.origin_country} → ${intent.dest_country}`,
              }
            }
          }
        }

        result.push({
          id: conv.id,
          counterpartName,
          lastMessage: lastMsg?.content ?? '',
          updatedAt: new Date(conv.updated_at).getTime(),
          unreadCount: unreadMap.get(conv.id) ?? 0,
          matchDetails,
        })
      }

      return result
    },
    enabled: Boolean(userId),
    refetchInterval: 20_000,
  })
}
