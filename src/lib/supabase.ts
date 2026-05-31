import 'react-native-get-random-values'
import 'react-native-url-polyfill/auto'

import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>

const supabaseUrl = extra.SUPABASE_URL || (process.env.EXPO_PUBLIC_SUPABASE_URL as string)
const supabaseAnonKey =
  extra.SUPABASE_ANON_KEY || (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
