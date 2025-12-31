import { create } from 'zustand'
import { nanoid } from 'nanoid/non-secure'
import ApiService from '@/services/apiService'
import { notifyNewMessage } from '@/services/notificationService'

export interface Message {
  id: string
  senderId: string
  content: string
  createdAt: number
}

export interface Conversation {
  id: string
  counterpartName: string
  counterpartId?: string
  lastMessage: string
  updatedAt: number
  unreadCount: number
  messages?: Message[]
  matchDetails?: {
    amount: number
    currency: string
    corridor: string
  }
}

interface ConversationState {
  conversations: Conversation[]
  activeConversationId: string | null
  isLoading: boolean
  isSending: boolean

  // Actions
  setConversations: (conversations: Conversation[]) => void
  loadConversations: (userId: string) => Promise<void>
  addConversation: (conversation: Omit<Conversation, 'id'>) => string
  markAsRead: (conversationId: string, userId: string) => Promise<void>
  sendMessage: (conversationId: string, message: string, userId: string) => Promise<void>
  receiveMessage: (conversationId: string, message: Message) => void
  setActiveConversation: (conversationId: string | null) => void
  getUnreadCount: () => number
  reset: () => void
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  isLoading: false,
  isSending: false,

  setConversations: (conversations) => set({ conversations }),

  loadConversations: async (userId) => {
    set({ isLoading: true })
    try {
      const conversations = await ApiService.fetchUserConversations(userId)
      set({ conversations, isLoading: false })
    } catch (error) {
      if (__DEV__) console.warn('Error loading conversations:', error)
      set({ isLoading: false })
    }
  },

  addConversation: (conversation) => {
    const conversationId = 'conv_' + nanoid(8)
    const newConversation: Conversation = {
      id: conversationId,
      ...conversation,
    }

    set((state) => ({
      conversations: [newConversation, ...state.conversations],
    }))

    return conversationId
  },

  markAsRead: async (conversationId, userId) => {
    // Optimistic update
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
    }))

    try {
      await ApiService.markConversationAsRead(conversationId, userId)
    } catch (error) {
      if (__DEV__) console.error('Error marking conversation as read:', error)
    }
  },

  sendMessage: async (conversationId, message, userId) => {
    set({ isSending: true })

    // Optimistic update
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessage: message, updatedAt: Date.now() }
          : c
      ),
    }))

    try {
      await ApiService.sendMessage(conversationId, message, userId)
    } catch (error) {
      // Queue for offline
      await ApiService.queueOfflineAction({
        type: 'SEND_MESSAGE',
        payload: { conversationId, message },
        userId,
        timestamp: Date.now(),
      })
      if (__DEV__) console.error('Error sending message:', error)
    } finally {
      set({ isSending: false })
    }
  },

  receiveMessage: (conversationId, message) => {
    const { activeConversationId } = get()
    const isActive = activeConversationId === conversationId

    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: message.content,
              updatedAt: message.createdAt,
              unreadCount: isActive ? c.unreadCount : c.unreadCount + 1,
              messages: c.messages ? [...c.messages, message] : [message],
            }
          : c
      ),
    }))

    // Send notification if not active
    if (!isActive) {
      const conversation = get().conversations.find((c) => c.id === conversationId)
      if (conversation) {
        notifyNewMessage(conversation.counterpartName, message.content, conversationId)
      }
    }
  },

  setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),

  getUnreadCount: () => {
    return get().conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
  },

  reset: () =>
    set({
      conversations: [],
      activeConversationId: null,
      isLoading: false,
      isSending: false,
    }),
}))

export default useConversationStore
