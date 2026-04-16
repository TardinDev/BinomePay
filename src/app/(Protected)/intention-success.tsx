import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, Pressable, BackHandler } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router, Stack, useFocusEffect } from 'expo-router'
import AnimatedSplash from '@/components/AnimatedSplash'

export default function IntentionSuccessPage() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 900)
    return () => clearTimeout(t)
  }, [])

  // Intercepte le bouton back matériel (Android) pour éviter l'écran sitemap
  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        router.replace('/(Protected)/(tabs)')
        return true
      }
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack)
      return () => sub.remove()
    }, [])
  )

  if (showSplash) {
    return <AnimatedSplash ready={true} />
  }

  return (
    <View className="flex-1 items-center justify-center bg-black px-5 pt-6">
      <Stack.Screen
        options={{ gestureEnabled: false, animation: 'fade', headerBackVisible: false }}
      />
      <View className="mb-8 items-center">
        <View style={{ backgroundColor: '#FDE68A', padding: 18, borderRadius: 9999 }}>
          <Ionicons name="checkmark-circle" size={56} color="#111827" />
        </View>
        <Text className="mt-4 text-center text-xl font-extrabold text-white">
          Votre nouvelle intention a été bien créée
        </Text>
      </View>

      <Pressable
        onPress={() => router.replace('/(Protected)/(tabs)')}
        className="flex-row items-center justify-center rounded-xl"
        style={{ backgroundColor: '#1F2937', paddingVertical: 12, paddingHorizontal: 16 }}
      >
        <Ionicons name="home" color="#EAB308" size={20} />
        <Text className="ml-2 text-base font-extrabold text-white">Retour à l’accueil</Text>
      </Pressable>
    </View>
  )
}
