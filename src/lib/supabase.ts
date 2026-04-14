import 'react-native-get-random-values'
import 'react-native-url-polyfill/auto'

import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

const supabaseUrl =
  (Constants.expoConfig?.extra as any)?.SUPABASE_URL ||
  (process.env.EXPO_PUBLIC_SUPABASE_URL as string)
const supabaseAnonKey =
  (Constants.expoConfig?.extra as any)?.SUPABASE_ANON_KEY ||
  (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string)

// Référence mutable vers le getter de token Clerk
let clerkTokenGetter: (() => Promise<string | null>) | null = null

/**
 * Appelé depuis le layout protégé pour connecter Clerk à Supabase.
 * Le getter sera invoqué à chaque requête Supabase pour obtenir un JWT frais.
 */
export function setClerkTokenGetter(getter: (() => Promise<string | null>) | null) {
  clerkTokenGetter = getter
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  accessToken: async () => {
    if (clerkTokenGetter) {
      return (await clerkTokenGetter()) ?? null
    }
    return null
  },
})
