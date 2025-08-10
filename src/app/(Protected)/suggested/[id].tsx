import React from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import useAppStore from '@/store/useAppStore'
import { Ionicons } from '@expo/vector-icons'

export default function SuggestedDetails() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const item = useAppStore((s) => s.suggested.find((x) => x.id === id))

  if (!item) {
    return (
      <View className="flex-1 bg-black px-5 pt-6">
        <Text className="text-white">Proposition introuvable.</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-black px-5 pt-6">
      <View className="flex-row items-center justify-between">
        <Pressable onPress={() => router.back()} className="p-2 rounded-full" style={{ backgroundColor: '#111827' }}>
          <Ionicons name="arrow-back" size={18} color="#E5E7EB" />
        </Pressable>
        <Text className="text-white text-lg font-extrabold">Détails de la proposition</Text>
        <View style={{ width: 32 }} />
      </View>

      <View className="mt-6 bg-neutral-900 rounded-2xl p-5 border" style={{ borderColor: '#334155' }}>
        <Text className="text-white text-xl font-extrabold">{item.amount} {item.currency} → {item.destCountryName}</Text>
        <Text className="text-gray-400 mt-1">Par: {item.senderName}</Text>
        <Text className="text-gray-500 text-xs mt-1">Créée à {new Date(item.createdAt).toLocaleString()}</Text>

        <View className="h-[1px] bg-gray-800 my-4" />
        <Text className="text-white font-semibold mb-2">Informations complémentaires</Text>
        <Text className="text-gray-300">Ce binôme propose d’envoyer localement la somme affichée vers {item.destCountryName}. Vous pouvez engager la discussion depuis l’onglet Messages après un match.</Text>
      </View>
    </ScrollView>
  )
}


