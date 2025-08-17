import React, { useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { useFormattedDate } from '@/utils/dateUtils'

type ChatMessage = {
  id: string
  sender_id: string
  content: string
  created_at: string
}

export default function ConversationDetails() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [userId, setUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const flatListRef = useRef<FlatList<ChatMessage>>(null)

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null
    ;(async () => {
      const { data: au } = await supabase.auth.getUser()
      const uid = au.user?.id || null
      setUserId(uid)

      if (!id) return

      // Charger les messages existants
      const { data, error } = await supabase
        .from('messages')
        .select('id, sender_id, content, created_at')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true })
      if (!error) setMessages(data ?? [])

      // Marquer comme lu
      await supabase.rpc('mark_conversation_read', { p_conversation_id: id as string })

      // Realtime sur cette conversation
      channel = supabase
        .channel(`messages-${id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` }, (payload) => {
          const m = payload.new as any
          setMessages((prev) => [...prev, { id: m.id, sender_id: m.sender_id, content: m.content, created_at: m.created_at }])
          flatListRef.current?.scrollToEnd({ animated: true })
        })
        .subscribe()
    })()
    return () => {
      channel?.unsubscribe()
    }
  }, [id])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed) return
    if (!userId) {
      Alert.alert('Session requise', 'Veuillez vous reconnecter')
      return
    }
    const { error } = await supabase.from('messages').insert([
      { conversation_id: id, sender_id: userId, content: trimmed },
    ])
    if (error) {
      Alert.alert('Erreur', error.message)
      return
    }
    setInput('')
  }

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isMe = item.sender_id === userId
    const time = useFormattedDate(new Date(item.created_at).getTime(), 'time')
    return (
      <View
        className={`mb-2 px-3 py-2 rounded-2xl max-w-[80%] ${
          isMe ? 'self-end bg-amber-500/20 border border-amber-700' : 'self-start bg-zinc-900 border border-zinc-800'
        }`}
      >
        <Text className="text-white">{item.content}</Text>
        <Text className="text-zinc-400 text-[10px] mt-1 self-end">{time}</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-black"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View className="px-5 pt-6">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} className="p-2 rounded-full" style={{ backgroundColor: '#111827' }}>
            <Ionicons name="arrow-back" size={18} color="#E5E7EB" />
          </Pressable>
          <Text className="text-white text-lg font-extrabold">Conversation</Text>
          <View style={{ width: 32 }} />
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        className="flex-1 px-5 mt-4"
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      <View className="px-5 pb-5">
        <View className="flex-row items-center bg-zinc-900 border border-zinc-800 rounded-2xl px-3 py-2">
          <TextInput
            className="flex-1 text-white px-2"
            placeholder="Votre message..."
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <Pressable
            onPress={handleSend}
            className="ml-2 px-3 py-2 rounded-xl"
            style={{ backgroundColor: '#EAB308' }}
          >
            <Ionicons name="send" size={18} color="#111827" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}


