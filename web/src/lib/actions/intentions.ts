'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const InputSchema = z.object({
  type: z.enum(['SEND', 'RECEIVE']),
  amount: z.number().positive(),
  currency: z.string().length(3),
  originCountry: z.string().min(1),
  destCountry: z.string().min(1),
})

export type CreateIntentionInput = z.infer<typeof InputSchema>

export async function createIntention(input: CreateIntentionInput) {
  const parsed = InputSchema.parse(input)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  // Fetch the user's display name (users joined via auth_id) to fill intents.user_name,
  // which the suggestions read path surfaces as senderName.
  const { data: profile } = await supabase
    .from('users')
    .select('name')
    .eq('auth_id', user.id)
    .maybeSingle()

  const { error } = await supabase.from('intents').insert({
    user_id: user.id,
    user_name: profile?.name ?? 'Utilisateur',
    direction: parsed.type, // DB column is `direction`, NOT `type`
    amount: parsed.amount,
    currency: parsed.currency,
    origin_country: parsed.originCountry,
    dest_country: parsed.destCountry,
    status: 'OPEN',
  })
  if (error) throw error

  revalidatePath('/app')
}
