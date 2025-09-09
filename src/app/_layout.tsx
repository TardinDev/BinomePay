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
import { Ionicons } from '@expo/vector-icons'
import * as Font from 'expo-font'
// Preload Ionicons font early with a fallback timeout

export default function RootLayout() {
  console.log('RootLayout rendering...', { clerkPublishableKey })
  
  const [isReady, setIsReady] = useState(false)
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true)
  const [iconsReady, setIconsReady] = useState(false)

  useEffect(() => {
    // Preload Ionicons font early; don't block forever
    try { (Ionicons as any).loadFont?.() } catch {}

    let readyTimeout: ReturnType<typeof setTimeout> | undefined
    let hideTimeout: ReturnType<typeof setTimeout> | undefined
    let fontTimeout: ReturnType<typeof setTimeout> | undefined
    ;(async () => {
      try {
        await SplashScreen.preventAutoHideAsync()
      } catch {}
      // Race font load with a timeout so we never hang
      try {
        const load = Font.loadAsync({
          Ionicons: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
        })
        await Promise.race([
          load.then(() => setIconsReady(true)),
          new Promise<void>((resolve) => {
            fontTimeout = setTimeout(() => resolve(), 1800)
          }),
        ])
      } catch {}
      try {
        await SplashScreen.hideAsync()
      } catch {}
      // Target ~3s total splash: start fade at ~2.6s, unmount at ~3.0s
      readyTimeout = setTimeout(() => setIsReady(true), 2600)
      hideTimeout = setTimeout(() => setShowAnimatedSplash(false), 3000)
    })()
    return () => {
      if (readyTimeout) clearTimeout(readyTimeout)
      if (hideTimeout) clearTimeout(hideTimeout)
      if (fontTimeout) clearTimeout(fontTimeout)
    }
  }, [])

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}> 
      <SafeAreaView className='flex-1 bg-black'>
        {showAnimatedSplash ? <AnimatedSplash ready={isReady} /> : <Slot />}
        <ToastProvider />
      </SafeAreaView>
    </ClerkProvider>
  )
}
