import 'react-native-reanimated'
import '../../global.css'
import { SafeAreaView } from 'react-native'
import React from 'react'
import { Slot } from 'expo-router'
import ToastProvider from '@/components/ToastProvider'
import QueryProvider from '@/components/QueryProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import { AuthProvider } from '@/lib/auth'

export default function RootLayout() {
  if (__DEV__) console.log('RootLayout rendering...')

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryProvider>
          <SafeAreaView className="flex-1 bg-black">
            <Slot />
            <ToastProvider />
          </SafeAreaView>
        </QueryProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
