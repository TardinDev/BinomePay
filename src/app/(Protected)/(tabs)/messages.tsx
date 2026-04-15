import React from 'react'
import { View, Text, FlatList, Pressable } from 'react-native'
import useAppStore, { Conversation } from '@/store/useAppStore'
import { Ionicons } from '@expo/vector-icons'
import { useFormattedDate } from '@/utils/dateUtils'
import { router } from 'expo-router'

const ConversationItem = ({
  item,
  onPress,
}: {
  item: Conversation
  onPress: (id: string) => void
}) => {
  const formattedDate = useFormattedDate(item.updatedAt)

  return (
    <Pressable
      onPress={() => onPress(item.id)}
      className="mb-3 rounded-xl border border-gray-800 bg-neutral-900 p-4"
    >
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="font-semibold text-white">{item.counterpartName}</Text>
        {item.unreadCount > 0 && (
          <View className="rounded-full bg-yellow-400 px-2 py-0.5">
            <Text className="text-xs font-extrabold text-black">{item.unreadCount}</Text>
          </View>
        )}
      </View>

      {item.matchDetails && (
        <View className="mb-2">
          <Text className="text-sm font-semibold text-yellow-400">
            {item.matchDetails.amount} {item.matchDetails.currency} • {item.matchDetails.corridor}
          </Text>
        </View>
      )}

      <View className="mt-1 flex-row items-center">
        <Ionicons name="chatbubble" color="#9CA3AF" size={14} />
        <Text className="ml-1 text-gray-400" numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      <Text className="mt-1 text-xs text-gray-500">{formattedDate}</Text>
    </Pressable>
  )
}

export default function MessagesPage() {
  const conversations = useAppStore((s) => s.conversations)
  const markConversationRead = useAppStore((s) => s.markConversationRead)

  return (
    <View className="flex-1 bg-black px-5 pt-6">
      <Text className="text-xl font-extrabold text-white">Messages</Text>
      <FlatList
        className="mt-5"
        data={conversations}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => <Text className="text-gray-400">Aucune conversation.</Text>}
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
