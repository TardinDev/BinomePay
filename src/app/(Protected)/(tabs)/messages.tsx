import React from 'react'
import { View, Text, FlatList, Pressable } from 'react-native'
import useAppStore, { Conversation } from '@/store/useAppStore'
import { Ionicons } from '@expo/vector-icons'
import { useFormattedDate } from '@/utils/dateUtils'
import { router } from 'expo-router'

const ConversationItem = ({ item, onPress }: { item: Conversation; onPress: (id: string) => void }) => {
  const formattedDate = useFormattedDate(item.updatedAt, 'datetime')
  
  return (
    <Pressable
      onPress={() => onPress(item.id)}
      className="border border-gray-800 rounded-xl p-4 mb-3 bg-neutral-900"
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-white font-semibold">{item.counterpartName}</Text>
        {item.unreadCount > 0 && (
          <View className="bg-yellow-400 rounded-full px-2 py-0.5">
            <Text className="text-black text-xs font-extrabold">{item.unreadCount}</Text>
          </View>
        )}
      </View>
      
      {item.matchDetails && (
        <View className="mb-2">
          <Text className="text-yellow-400 text-sm font-semibold">
            {item.matchDetails.amount} {item.matchDetails.currency} • {item.matchDetails.corridor}
          </Text>
        </View>
      )}
      
      <View className="flex-row items-center mt-1">
        <Ionicons name="chatbubble" color="#9CA3AF" size={14} />
        <Text className="text-gray-400 ml-1" numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      <Text className="text-gray-500 text-xs mt-1">{formattedDate}</Text>
    </Pressable>
  )
}

export default function MessagesPage() {
  const conversations = useAppStore((s) => s.conversations)
  const markConversationRead = useAppStore((s) => s.markConversationRead)

  return (
    <View className="flex-1 bg-black px-5 pt-6">
      <Text className="text-white text-xl font-extrabold">Messages</Text>
      <FlatList
        className="mt-5"
        data={conversations}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <Text className="text-gray-400">Aucune conversation.</Text>
        )}
        removeClippedSubviews={true}
        maxToRenderPerBatch={6}
        windowSize={12}
        initialNumToRender={8}
        getItemLayout={(data, index) => ({
          length: 90,
          offset: 90 * index + (index > 0 ? 12 * index : 0),
          index,
        })}
        renderItem={({ item }) => (
          <ConversationItem
            item={item}
            onPress={(id) => {
              markConversationRead(id)
              router.push(`/(Protected)/messages/${id}`)
            }}
          />
        )}
      />
    </View>
  )
}


