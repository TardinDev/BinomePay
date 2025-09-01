import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SuggestedItem } from '@/store/useAppStore'
import { router } from 'expo-router'
import { useFormattedDate } from '@/utils/dateUtils'

type Props = { item: SuggestedItem }

export default function SuggestedCard({ item }: Props) {
  const formattedTime = useFormattedDate(item.createdAt, 'time')
  
  return (
    <View className={`border rounded-2xl px-4 py-3 mb-3 ${
      item.isAccepted 
        ? 'border-green-500 bg-green-950/30' 
        : 'border-gray-800 bg-neutral-900'
    }`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-white font-semibold">{item.amount} {item.currency}</Text>
          {item.isAccepted && (
            <Ionicons name="checkmark-circle" color="#10B981" size={16} style={{ marginLeft: 8 }} />
          )}
        </View>
        <Text className="text-gray-400 text-xs">{formattedTime}</Text>
      </View>
      <Text className="text-gray-400 mt-1">{item.originCountryName} → {item.destCountryName}</Text>
      <Text className="text-gray-400 text-sm">Par: {item.senderName}</Text>
      
      {item.isAccepted && (
        <View className="mt-2 flex-row items-center">
          <Ionicons name="chatbubble-ellipses" color="#10B981" size={14} />
          <Text className="text-green-400 text-xs ml-1">Match créé - Vous pouvez discuter</Text>
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
          className={`px-3 py-2 rounded-full ${
            item.isAccepted ? 'bg-green-600' : 'bg-gray-800'
          }`}
        >
          <Text className="text-white text-xs font-bold">
            {item.isAccepted ? 'Messages' : 'Voir'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}


