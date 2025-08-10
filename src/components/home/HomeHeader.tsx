import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { User } from '@/store/useAppStore'

type Props = {
  user: User | null
}

export default function HomeHeader({ user }: Props) {
  return (
    <View className="rounded-2xl p-4 border bg-[#0B0F1A] border-gray-800">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="bg-[#0B1220] p-2 rounded-full border border-gray-800">
            <Ionicons name="globe-outline" color="#EAB308" size={18} />
          </View>
          <View className="ml-3">
            <Text className="text-white text-xl font-extrabold">Bonjour{user?.name ? `, ${user.name}` : ''} 👋</Text>
            <Text className="text-gray-400 text-xs">Prêt à échanger en toute confiance</Text>
          </View>
        </View>
        <Pressable onPress={() => router.navigate('/(Protected)/profile')} className="bg-gray-800 py-2 px-3 rounded-full">
          <Ionicons name="person" color="#EAB308" size={20} />
        </Pressable>
      </View>
    </View>
  )
}


