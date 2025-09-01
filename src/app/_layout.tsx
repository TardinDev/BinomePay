import 'react-native-reanimated'
import '../../global.css'
import { SafeAreaView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import AnimatedSplash from '@/components/AnimatedSplash'
import ToastProvider from '@/components/ToastProvider'
import { ClerkProvider } from '@clerk/clerk-expo'
import { clerkPublishableKey, tokenCache } from '@/lib/clerk'

export default function RootLayout() {
  console.log('RootLayout rendering...', { clerkPublishableKey })
  
  const [isReady, setIsReady] = useState(false)
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true)

  useEffect(() => {
    SplashScreen.preventAutoHideAsync()

    const prepare = async () => {
      await new Promise((resolve) => setTimeout(resolve, 900))
      setIsReady(true)
    }
    prepare()
  }, [])

  useEffect(() => {
    if (isReady) {
      const t = setTimeout(() => {
        SplashScreen.hideAsync()
        setShowAnimatedSplash(false)
      }, 500)
      return () => clearTimeout(t)
    }
  }, [isReady])

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}> 
      <SafeAreaView className='flex-1 bg-black'>
        {showAnimatedSplash ? <AnimatedSplash ready={isReady} /> : <Slot />}
        <ToastProvider />
      </SafeAreaView>
    </ClerkProvider>
  )
}