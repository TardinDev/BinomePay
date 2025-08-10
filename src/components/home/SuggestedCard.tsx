import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { SuggestedItem } from '@/store/useAppStore'
import { router } from 'expo-router'

type Props = { item: SuggestedItem }

export default function SuggestedCard({ item }: Props) {
  return (
    <View className="border border-gray-800 rounded-2xl p-4 mb-3 bg-neutral-900">
      <View className="flex-row items-center justify-between">
        <Text className="text-white font-semibold">{item.amount} {item.currency} → {item.destCountryName}</Text>
        <Text className="text-gray-400 text-xs">{new Date(item.createdAt).toLocaleTimeString()}</Text>
      </View>
      <Text className="text-gray-400 mt-1">Par: {item.senderName}</Text>
      <View className="mt-2 flex-row justify-end">
        <Pressable onPress={() => router.push(`/(Protected)/suggested/${item.id}`)} className="px-3 py-2 rounded-full bg-gray-800">
          <Text className="text-white text-xs font-bold">Voir</Text>
        </Pressable>
      </View>
    </View>
  )
}


