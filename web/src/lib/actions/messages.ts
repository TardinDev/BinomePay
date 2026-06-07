'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Sends a message in a conversation, then bumps the conversation timestamp and
 * the OTHER participant's unread count. Mirrors the mobile `ApiService.sendMessage`.
 */
export async function sendMessage(conversationId: string, content: string) {
  const trimmed = content.trim()
  if (!trimmed) throw new Error('Message vide')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  // 1. Insert the message.
  const { error: msgErr } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: trimmed,
  })
  if (msgErr) throw msgErr

  // 2. Touch the conversation timestamp (list ordering).
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  // 3. Atomically bump the OTHER participant's unread count (RPC).
  await supabase.rpc('increment_unread_count', { conv_id: conversationId, sender: user.id })

  revalidatePath(`/app/messages/${conversationId}`)
}

/**
 * Clears the current user's unread count for a conversation.
 */
export async function markConversationAsRead(conversationId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')
  const { error } = await supabase
    .from('conversation_participants')
    .update({ unread_count: 0, last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
  if (error) throw error
  revalidatePath('/app/messages')
}
