'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface UpdateProfileInput {
  name: string
}

/** Updates the current user's display name on their `users` row (joined via auth_id). */
export async function updateProfile(input: UpdateProfileInput) {
  const name = input.name.trim()
  if (!name) throw new Error('Le nom ne peut pas être vide')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const { error } = await supabase.from('users').update({ name }).eq('auth_id', user.id)
  if (error) throw error

  revalidatePath('/app/profile')
}

/**
 * Permanently deletes the current account via the `delete-account` Edge Function
 * (service role, bypasses RLS), then signs the session out.
 */
export async function deleteAccount() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const { error } = await supabase.functions.invoke('delete-account')
  if (error) throw error

  await supabase.auth.signOut()
}
