import 'react-native-get-random-values'
import 'react-native-url-polyfill/auto'

import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>

const supabaseUrl = extra.SUPABASE_URL || (process.env.EXPO_PUBLIC_SUPABASE_URL as string)
const supabaseAnonKey =
  extra.SUPABASE_ANON_KEY || (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string)

// Garde-fou démarrage: en build EAS, ces valeurs sont figées au build depuis
// app.config.ts (extra) ou les variables EXPO_PUBLIC_*. Si le profil de build dans
// eas.json ne lie pas son "environment" EAS, elles arrivent à `undefined` et
// createClient lève une exception à l'import → l'app se ferme instantanément (avant
// tout rendu React, donc l'ErrorBoundary ne peut rien attraper). On lève ici un
// message explicite, visible dans `adb logcat`, pour diagnostiquer en quelques secondes.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[BinomePay] Configuration Supabase manquante au démarrage: ' +
      `SUPABASE_URL=${supabaseUrl ? 'ok' : 'MANQUANT'}, ` +
      `SUPABASE_ANON_KEY=${supabaseAnonKey ? 'ok' : 'MANQUANT'}. ` +
      'Vérifie que le profil de build dans eas.json définit "environment" et que les ' +
      'variables existent dans cet environnement EAS (eas env:list).'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
