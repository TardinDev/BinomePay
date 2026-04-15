import React, { useEffect, useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import AnimatedSplash from '@/components/AnimatedSplash'

export default function IntentionSuccessPage() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 900)
    return () => clearTimeout(t)
  }, [])

  if (showSplash) {
    return <AnimatedSplash ready={true} />
  }

  return (
    <View className="flex-1 items-center justify-center bg-black px-5 pt-6">
      <View className="mb-8 items-center">
        <View style={{ backgroundColor: '#FDE68A', padding: 18, borderRadius: 9999 }}>
          <Ionicons name="checkmark-circle" size={56} color="#111827" />
        </View>
        <Text className="mt-4 text-center text-xl font-extrabold text-white">
          Votre nouvelle intention a été bien créée
        </Text>
      </View>

      <Pressable
        onPress={() => router.replace('/(Protected)/(tabs)/index')}
        className="flex-row items-center justify-center rounded-xl"
        style={{ backgroundColor: '#1F2937', paddingVertical: 12, paddingHorizontal: 16 }}
      >
        <Ionicons name="home" color="#EAB308" size={20} />
        <Text className="ml-2 text-base font-extrabold text-white">Retour à l’accueil</Text>
      </Pressable>
    </View>
  )
}
