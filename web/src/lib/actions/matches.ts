'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Accepts an open suggestion and bootstraps the full match transaction.
 *
 * This mirrors the mobile `ApiService.acceptSuggestion` 8-step sequence exactly
 * (do not reorder or drop steps): fetch the open intent, resolve the accepting
 * user's name, create the complementary (already-matched) intent, create the
 * match, create the conversation, add both participants (the other side starts
 * with one unread), mark the suggested intent MATCHED, and post a system
 * opening message.
 */
export async function acceptSuggestion(
  suggestionId: string
): Promise<{ conversationId: string; matchId: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')
  const userId = user.id

  // 1. Fetch the suggestion intent (still open)
  const { data: suggestion, error: suggErr } = await supabase
    .from('intents')
    .select('id, user_id, direction, amount, currency, origin_country, dest_country, user_name')
    .eq('id', suggestionId)
    .eq('status', 'OPEN')
    .single()
  if (suggErr || !suggestion) throw new Error('Suggestion introuvable ou déjà acceptée')

  // 2. Accepting user's name (users joined via auth_id)
  const { data: acceptingUser } = await supabase
    .from('users')
    .select('name')
    .eq('auth_id', userId)
    .single()
  const acceptingUserName = acceptingUser?.name ?? 'Utilisateur'

  // 3. Complementary intent (opposite direction), already MATCHED
  const complementaryDirection = suggestion.direction === 'SEND' ? 'RECEIVE' : 'SEND'
  const { data: myIntent, error: myIntentErr } = await supabase
    .from('intents')
    .insert({
      user_id: userId,
      user_name: acceptingUserName,
      direction: complementaryDirection,
      amount: suggestion.amount,
      currency: suggestion.currency,
      origin_country: suggestion.origin_country,
      dest_country: suggestion.dest_country,
      status: 'MATCHED',
    })
    .select('id')
    .single()
  if (myIntentErr || !myIntent) throw myIntentErr ?? new Error("Erreur création d'intent")

  // 4. Create the match
  const { data: match, error: matchErr } = await supabase
    .from('matches')
    .insert({ intent_a: suggestion.id, intent_b: myIntent.id, status: 'ACCEPTED' })
    .select('id')
    .single()
  if (matchErr || !match) throw matchErr ?? new Error('Erreur création match')

  // 5. Create the conversation
  const { data: conversation, error: convErr } = await supabase
    .from('conversations')
    .insert({ match_id: match.id })
    .select('id')
    .single()
  if (convErr || !conversation) throw convErr ?? new Error('Erreur création conversation')

  // 6. Add the two participants (the other starts with 1 unread)
  const { error: partErr } = await supabase.from('conversation_participants').insert([
    { conversation_id: conversation.id, user_id: userId, unread_count: 0 },
    { conversation_id: conversation.id, user_id: suggestion.user_id, unread_count: 1 },
  ])
  if (partErr) throw partErr

  // 7. Mark the suggested intent MATCHED
  await supabase
    .from('intents')
    .update({ status: 'MATCHED', updated_at: new Date().toISOString() })
    .eq('id', suggestion.id)

  // 8. System opening message
  await supabase.from('messages').insert({
    conversation_id: conversation.id,
    sender_id: userId,
    content: `Match créé ! ${acceptingUserName} a accepté la proposition de ${suggestion.amount} ${suggestion.currency}.`,
  })

  revalidatePath('/app')
  return { conversationId: conversation.id, matchId: match.id }
}
