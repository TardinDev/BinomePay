import 'react-native-reanimated'
import { SafeAreaView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import AnimatedSplash from '@/components/AnimatedSplash'

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false)
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true)

  useEffect(() => {
    SplashScreen.preventAutoHideAsync()

    const prepare = async () => {
      // Ici on pourrait charger police/config, vérifier auth, etc.
      // On simule un court délai pour l’animation.
      await new Promise((resolve) => setTimeout(resolve, 900))
      setIsReady(true)
    }
    prepare()
  }, [])

  useEffect(() => {
    if (isReady) {
      // Laisser l’animation sortir avant de masquer le splash natif
      const t = setTimeout(() => {
        SplashScreen.hideAsync()
        setShowAnimatedSplash(false)
      }, 500)
      return () => clearTimeout(t)
    }
  }, [isReady])

  return (
    <SafeAreaView className='flex-1 bg-black'>
      {showAnimatedSplash ? <AnimatedSplash ready={isReady} /> : <Slot />}
    </SafeAreaView>
  )
}