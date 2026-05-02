import 'react-native-reanimated'
import '../../global.css'
import React, { useEffect } from 'react'
import { Slot } from 'expo-router'
import * as Linking from 'expo-linking'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import ToastProvider from '@/components/ToastProvider'
import QueryProvider from '@/components/QueryProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import { AuthProvider } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// Capture le deep link Supabase (binomepay://verify#access_token=...&refresh_token=...)
// après confirmation email ou reset password, et hydrate la session.
const handleAuthDeepLink = async (url: string) => {
  const fragmentIndex = url.indexOf('#')
  if (fragmentIndex === -1) return

  const params = new URLSearchParams(url.slice(fragmentIndex + 1))
  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')

  if (!access_token || !refresh_token) return

  const { error } = await supabase.auth.setSession({ access_token, refresh_token })
  if (error && __DEV__) console.error('[deeplink] setSession a échoué:', error)
}

export default function RootLayout() {
  if (__DEV__) console.log('RootLayout rendering...')

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) handleAuthDeepLink(url)
    })
    const sub = Linking.addEventListener('url', ({ url }) => handleAuthDeepLink(url))
    return () => sub.remove()
  }, [])

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <QueryProvider>
            <SafeAreaView className="flex-1 bg-black">
              <Slot />
              <ToastProvider />
            </SafeAreaView>
          </QueryProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  )
}
