import 'react-native-get-random-values'
import 'react-native-url-polyfill/auto'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

const supabaseUrl = (Constants.expoConfig?.extra as any)?.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = (Constants.expoConfig?.extra as any)?.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})


