import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SuggestedItem } from '@/store/useAppStore'
import { router } from 'expo-router'
import { useFormattedDate } from '@/utils/dateUtils'

type Props = { item: SuggestedItem }

export default function SuggestedCard({ item }: Props) {
  const formattedTime = useFormattedDate(item.createdAt)

  return (
    <View
      className={`mb-3 rounded-2xl border px-4 py-3 ${
        item.isAccepted ? 'border-green-500 bg-green-950/30' : 'border-gray-800 bg-neutral-900'
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="font-semibold text-white">
            {item.amount} {item.currency}
          </Text>
          {item.isAccepted && (
            <Ionicons name="checkmark-circle" color="#10B981" size={16} style={{ marginLeft: 8 }} />
          )}
        </View>
        <Text className="text-xs text-gray-400">{formattedTime}</Text>
      </View>
      <Text className="mt-1 text-gray-400">
        {item.originCountryName} → {item.destCountryName}
      </Text>
      <Text className="text-sm text-gray-400">Par: {item.senderName}</Text>

      {item.isAccepted && (
        <View className="mt-2 flex-row items-center">
          <Ionicons name="chatbubble-ellipses" color="#10B981" size={14} />
          <Text className="ml-1 text-xs text-green-400">Match créé - Vous pouvez discuter</Text>
        </View>
      )}

      <View className="mt-2 flex-row justify-end">
        <Pressable
          onPress={() => {
            if (item.isAccepted && item.conversationId) {
              // Si accepté et qu'on a un ID de conversation, aller directement aux messages
              router.push(`/(Protected)/messages/${item.conversationId}`)
            } else {
              // Sinon, aller vers les détails de la proposition
              router.push(`/(Protected)/suggested/${item.id}`)
            }
          }}
          className={`rounded-full px-3 py-2 ${item.isAccepted ? 'bg-green-600' : 'bg-gray-800'}`}
        >
          <Text className="text-xs font-bold text-white">
            {item.isAccepted ? 'Messages' : 'Voir'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
