import React, { useState, useRef, useEffect } from 'react'
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  Pressable, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import useAppStore from '@/store/useAppStore'
import { useUser } from '@clerk/clerk-expo'

type Message = {
  id: string
  text: string
  isFromMe: boolean
  timestamp: number
}

const MessageBubble = ({ message }: { message: Message }) => {
  const timeString = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(message.timestamp))

  return (
    <View className={`mb-3 ${message.isFromMe ? 'items-end' : 'items-start'}`}>
      <View
        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
          message.isFromMe
            ? 'bg-blue-600'
            : 'bg-gray-800 border border-gray-700'
        }`}
      >
        <Text className="text-white">{message.text}</Text>
      </View>
      <Text className="text-gray-500 text-xs mt-1">{timeString}</Text>
    </View>
  )
}

export default function MessageDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useUser()
  const conversations = useAppStore((s) => s.conversations)
  const addMessageToConversation = useAppStore((s) => s.addMessageToConversation)
  
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Match créé ! Vous pouvez maintenant discuter.',
      isFromMe: false,
      timestamp: Date.now() - 1000 * 60 * 5,
    },
    {
      id: '2', 
      text: 'Bonjour ! Parfait pour cet échange.',
      isFromMe: false,
      timestamp: Date.now() - 1000 * 60 * 3,
    }
  ])
  
  const flatListRef = useRef<FlatList>(null)
  
  const conversation = conversations.find((c) => c.id === id)
  
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }, [messages])
  
  if (!conversation) {
    return (
      <View className="flex-1 bg-black px-5 pt-6">
        <View className="flex-row items-center mb-6">
          <Pressable 
            onPress={() => router.back()} 
            className="mr-3"
            style={{ padding: 10, borderRadius: 9999, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937' }}
          >
            <Ionicons name="arrow-back" color="#E5E7EB" size={20} />
          </Pressable>
          <Text className="text-white text-xl font-bold">Conversation introuvable</Text>
        </View>
        <Text className="text-gray-400">Cette conversation n'existe plus.</Text>
      </View>
    )
  }

  const sendMessage = () => {
    const trimmedText = inputText.trim()
    if (!trimmedText || !user?.id) return

    const newMessage: Message = {
      id: Date.now().toString(),
      text: trimmedText,
      isFromMe: true,
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, newMessage])
    addMessageToConversation(conversation.id, trimmedText, true)
    setInputText('')
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }

  return (
    <View className="flex-1 bg-black">
      <View className="px-5 pt-6 pb-4 border-b border-gray-800">
        <View className="flex-row items-center">
          <Pressable 
            onPress={() => router.back()} 
            className="mr-3"
            style={{ padding: 10, borderRadius: 9999, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937' }}
          >
            <Ionicons name="arrow-back" color="#E5E7EB" size={20} />
          </Pressable>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">{conversation.counterpartName}</Text>
            <Text className="text-green-400 text-sm">En ligne</Text>
          </View>
          <Pressable 
            className="p-2"
            onPress={() => Alert.alert('Information', 'Fonctionnalité à venir')}
          >
            <Ionicons name="information-circle" color="#6B7280" size={24} />
          </Pressable>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        className="flex-1 px-5"
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={{ paddingVertical: 20 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View className="border-t border-gray-800 px-5 py-4">
          <View className="flex-row items-end">
            <TextInput
              className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-2xl mr-3 max-h-24"
              placeholder="Tapez votre message..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <Pressable onPress={sendMessage} className="rounded-full overflow-hidden">
              <LinearGradient
                colors={inputText.trim() ? ['#3B82F6', '#1D4ED8'] : ['#374151', '#1F2937']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 12, borderRadius: 9999 }}
              >
                <Ionicons 
                  name="send" 
                  color={inputText.trim() ? '#FFFFFF' : '#6B7280'} 
                  size={20} 
                />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}