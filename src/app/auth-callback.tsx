import React, { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const params = useLocalSearchParams<{ code?: string; token_hash?: string; type?: string }>()

  useEffect(() => {
    ;(async () => {
      try {
        if (params.code) {
          await supabase.auth.exchangeCodeForSession(String(params.code))
        } else if (params.token_hash) {
          await supabase.auth.verifyOtp({ token_hash: String(params.token_hash), type: (params.type as any) || 'signup' })
        }
      } catch {}
      router.replace('/(Protected)/(tabs)/index')
    })()
  }, [params])

  return (
    <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#FDE68A" />
    </View>
  )
}


