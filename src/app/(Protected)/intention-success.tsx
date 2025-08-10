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
    <View className="flex-1 bg-black px-5 pt-6 items-center justify-center">
      <View className="items-center mb-8">
        <View style={{ backgroundColor: '#FDE68A', padding: 18, borderRadius: 9999 }}>
          <Ionicons name="checkmark-circle" size={56} color="#111827" />
        </View>
        <Text className="text-white text-xl font-extrabold mt-4 text-center">
          Votre nouvelle intention a été bien créée
        </Text>
      </View>

      <Pressable
        onPress={() => router.replace('/(Protected)/(tabs)/index')}
        className="rounded-xl flex-row items-center justify-center"
        style={{ backgroundColor: '#1F2937', paddingVertical: 12, paddingHorizontal: 16 }}
      >
        <Ionicons name="home" color="#EAB308" size={20} />
        <Text className="ml-2 text-white font-extrabold text-base">Retour à l’accueil</Text>
      </Pressable>
    </View>
  )
}


