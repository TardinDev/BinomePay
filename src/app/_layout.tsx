import 'react-native-reanimated'
import '../../global.css'
import { SafeAreaView, View, Text } from 'react-native'
import React from 'react'
import { Slot } from 'expo-router'
import ToastProvider from '@/components/ToastProvider'
import QueryProvider from '@/components/QueryProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import { ClerkProvider } from '@clerk/clerk-expo'
import { clerkPublishableKey, tokenCache } from '@/lib/clerk'

export default function RootLayout() {
  if (__DEV__) console.log('RootLayout rendering...')

  if (!clerkPublishableKey) {
    if (__DEV__) console.error('Clé Clerk manquante')
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'white' }}>Configuration manquante</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
        <QueryProvider>
          <SafeAreaView className="flex-1 bg-black">
            <Slot />
            <ToastProvider />
          </SafeAreaView>
        </QueryProvider>
      </ClerkProvider>
    </ErrorBoundary>
  )
}
