import 'react-native-reanimated'
import '../../global.css'
import { SafeAreaView, View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import AnimatedSplash from '@/components/AnimatedSplash'
import ToastProvider from '@/components/ToastProvider'
import QueryProvider from '@/components/QueryProvider'
import { ClerkProvider } from '@clerk/clerk-expo'
import { clerkPublishableKey, tokenCache } from '@/lib/clerk'

export default function RootLayout() {
  console.log('RootLayout rendering...')
  
  if (!clerkPublishableKey) {
    console.error('Clé Clerk manquante')
    return (
      <SafeAreaView className='flex-1 bg-black'>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'white' }}>Configuration manquante</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <QueryProvider>
      <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}> 
        <SafeAreaView className='flex-1 bg-black'>
          <Slot />
          <ToastProvider />
        </SafeAreaView>
      </ClerkProvider>
    </QueryProvider>
  )
}
