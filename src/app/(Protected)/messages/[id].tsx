import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import useAppStore from '@/store/useAppStore'
import { useUser } from '@clerk/clerk-expo'
import ApiService, { Message as ApiMessage } from '@/services/apiService'

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
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          message.isFromMe ? 'bg-blue-600' : 'border border-gray-700 bg-gray-800'
        }`}
      >
        <Text className="text-white">{message.text}</Text>
      </View>
      <Text className="mt-1 text-xs text-gray-500">{timeString}</Text>
    </View>
  )
}

export default function MessageDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useUser()
  const conversations = useAppStore((s) => s.conversations)
  const addMessageToConversation = useAppStore((s) => s.addMessageToConversation)

  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(true)
  const [isSending, setIsSending] = useState(false)

  const flatListRef = useRef<FlatList>(null)
  const isMounted = useRef(true)

  const conversation = conversations.find((c) => c.id === id)

  // Charger les vrais messages depuis l'API
  const loadMessages = useCallback(async () => {
    if (!id || !user?.id) return

    try {
      setIsLoadingMessages(true)
      const apiMessages = await ApiService.fetchConversationMessages(id)

      if (!isMounted.current) return

      const formattedMessages: Message[] = apiMessages.map((msg: ApiMessage) => ({
        id: msg.id,
        text: msg.content,
        isFromMe: msg.senderId === user.id,
        timestamp: msg.createdAt,
      }))

      setMessages(formattedMessages)
    } catch (error) {
      if (__DEV__) console.warn('Erreur chargement messages:', error)
      // En cas d'erreur, afficher un message système
      if (isMounted.current) {
        setMessages([
          {
            id: 'system_welcome',
            text: 'Bienvenue dans la conversation ! Envoyez votre premier message.',
            isFromMe: false,
            timestamp: Date.now(),
          },
        ])
      }
    } finally {
      if (isMounted.current) {
        setIsLoadingMessages(false)
      }
    }
  }, [id, user?.id])

  useEffect(() => {
    isMounted.current = true
    loadMessages()
    return () => {
      isMounted.current = false
    }
  }, [loadMessages])

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        if (isMounted.current) {
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      }, 100)
    }
  }, [messages])

  if (!conversation) {
    return (
      <View className="flex-1 bg-black px-5 pt-6">
        <View className="mb-6 mt-6 flex-row items-center">
          <Pressable
            onPress={() => router.push('/(Protected)/(tabs)/messages')}
            className="mr-4 rounded-full p-3"
            style={{ backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#374151' }}
            accessibilityLabel="Retour aux conversations"
          >
            <Ionicons name="arrow-back" color="#FFFFFF" size={24} />
          </Pressable>
          <Text className="text-xl font-bold text-white">Conversation introuvable</Text>
        </View>
        <Text className="text-gray-400">Cette conversation n'existe plus.</Text>
      </View>
    )
  }

  const sendMessage = async () => {
    const trimmedText = inputText.trim()
    if (!trimmedText || !user?.id || isSending) return

    const newMessage: Message = {
      id: 'msg_' + Date.now().toString(),
      text: trimmedText,
      isFromMe: true,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInputText('')
    setIsSending(true)
    Keyboard.dismiss()

    try {
      await addMessageToConversation(conversation.id, trimmedText, true)
    } catch (error) {
      if (__DEV__) console.warn('Erreur envoi message:', error)
    } finally {
      if (isMounted.current) {
        setIsSending(false)
      }
    }

    setTimeout(() => {
      if (isMounted.current) {
        flatListRef.current?.scrollToEnd({ animated: true })
      }
    }, 100)
  }

  return (
    <View className="flex-1 bg-black">
      <View className="border-b border-gray-800 bg-black px-5 pb-4 pt-12">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.push('/(Protected)/(tabs)/messages')}
            className="mr-4 rounded-full p-3"
            style={{ backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#374151' }}
            accessibilityLabel="Retour aux conversations"
          >
            <Ionicons name="arrow-back" color="#FFFFFF" size={24} />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold text-white">{conversation.counterpartName}</Text>
            {conversation.matchDetails && (
              <Text className="text-sm font-semibold text-yellow-400">
                {conversation.matchDetails.amount} {conversation.matchDetails.currency} •{' '}
                {conversation.matchDetails.corridor}
              </Text>
            )}
          </View>
        </View>
      </View>

      {isLoadingMessages ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-3 text-gray-400">Chargement des messages...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          className="flex-1 px-5"
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={{ paddingVertical: 20 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-gray-500">Aucun message. Commencez la conversation !</Text>
            </View>
          }
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View className="border-t border-gray-800 px-5 py-4">
          <View className="flex-row items-end">
            <TextInput
              className="mr-3 max-h-24 flex-1 rounded-2xl bg-gray-800 px-4 py-3 text-white"
              placeholder="Tapez votre message..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <Pressable
              onPress={sendMessage}
              className="overflow-hidden rounded-full"
              disabled={isSending || !inputText.trim()}
              accessibilityLabel="Envoyer le message"
            >
              <LinearGradient
                colors={
                  inputText.trim() && !isSending ? ['#3B82F6', '#1D4ED8'] : ['#374151', '#1F2937']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 12, borderRadius: 9999 }}
              >
                {isSending ? (
                  <ActivityIndicator size={20} color="#FFFFFF" />
                ) : (
                  <Ionicons
                    name="send"
                    color={inputText.trim() ? '#FFFFFF' : '#6B7280'}
                    size={20}
                  />
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}
