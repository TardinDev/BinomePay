'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from './keys'
import type { Message } from '@/lib/schemas'

/**
 * Messages of a conversation, oldest first.
 * Faithful port of the mobile `ApiService.fetchConversationMessages`.
 * `isRead` is not tracked per-message (the unread count lives on
 * `conversation_participants`), so it defaults to `false`.
 */
export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: queryKeys.messages(conversationId),
    queryFn: async (): Promise<Message[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_id, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []).map((row) => ({
        id: row.id,
        conversationId: row.conversation_id,
        senderId: row.sender_id,
        content: row.content,
        createdAt: new Date(row.created_at).getTime(),
        isRead: false,
      }))
    },
    enabled: Boolean(conversationId),
    refetchInterval: 10_000,
  })
}
