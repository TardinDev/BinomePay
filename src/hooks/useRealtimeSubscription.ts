import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'
import useAppStore from '@/store/useAppStore'

type SubscriptionEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface SubscriptionConfig {
  table: string
  event?: SubscriptionEvent
  filter?: string
  schema?: string
}

interface PostgresPayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T
  old: T
}

export function useRealtimeSubscription<T extends Record<string, unknown>>(
  config: SubscriptionConfig,
  onPayload: (payload: PostgresPayload<T>) => void,
  enabled: boolean = true
) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!enabled || !supabase) return

    const { table, event = '*', filter, schema = 'public' } = config

    const channelName = `${table}_${event}_${filter || 'all'}_${Date.now()}`

    try {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes' as any,
          {
            event,
            schema,
            table,
            filter,
          } as any,
          (payload: any) => {
            if (__DEV__) {
              console.log(`Realtime update on ${table}:`, payload.eventType)
            }
            onPayload(payload as PostgresPayload<T>)
          }
        )
        .subscribe((status: string) => {
          if (__DEV__) {
            console.log(`Subscription status for ${table}:`, status)
          }
        })

      channelRef.current = channel
    } catch (error) {
      if (__DEV__) {
        console.error('Error setting up realtime subscription:', error)
      }
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [config.table, config.event, config.filter, config.schema, enabled, onPayload])

  return channelRef.current
}

// Pre-built subscription hooks for common use cases

export function useConversationsSubscription(userId: string | undefined) {
  const addMessageToConversation = useAppStore((s) => s.addMessageToConversation)

  const handlePayload = useCallback(
    (payload: PostgresPayload<{ id: string; conversation_id: string; content: string; sender_id: string; created_at: string }>) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        const message = payload.new
        // Don't add our own messages (they're added optimistically)
        if (message.sender_id !== userId) {
          // addMessageToConversation expects (conversationId, message, isFromMe)
          addMessageToConversation(message.conversation_id, message.content, false)
        }
      }
    },
    [userId, addMessageToConversation]
  )

  useRealtimeSubscription(
    {
      table: 'messages',
      event: 'INSERT',
      filter: userId ? `recipient_id=eq.${userId}` : undefined,
    },
    handlePayload,
    !!userId
  )
}

export function useMatchesSubscription(userId: string | undefined) {
  const loadMatches = useAppStore((s) => s.loadMatches)

  const handlePayload = useCallback(
    (payload: PostgresPayload<{ id: string; status: string }>) => {
      if (__DEV__) {
        console.log('Match update received:', payload.eventType)
      }
      // Refetch matches when there's any change
      if (userId) {
        loadMatches(userId)
      }
    },
    [userId, loadMatches]
  )

  useRealtimeSubscription(
    {
      table: 'matches',
      event: '*',
      filter: userId ? `user_id=eq.${userId}` : undefined,
    },
    handlePayload,
    !!userId
  )
}

export function useSuggestionsSubscription(userId: string | undefined) {
  const loadSuggested = useAppStore((s) => s.loadSuggested)

  const handlePayload = useCallback(
    (payload: PostgresPayload<{ id: string }>) => {
      if (__DEV__) {
        console.log('Suggestion update received:', payload.eventType)
      }
      // Refetch suggestions when there's any change
      if (userId) {
        loadSuggested(userId)
      }
    },
    [userId, loadSuggested]
  )

  useRealtimeSubscription(
    {
      table: 'suggestions',
      event: '*',
      filter: userId ? `target_user_id=eq.${userId}` : undefined,
    },
    handlePayload,
    !!userId
  )
}

export function useNotificationsSubscription(userId: string | undefined) {
  const incrementNotifications = useAppStore((s) => s.incrementNotifications)
  const clearNotifications = useAppStore((s) => s.clearNotifications)

  const handlePayload = useCallback(
    (payload: PostgresPayload<{ id: string; read: boolean }>) => {
      if (payload.eventType === 'INSERT') {
        // Increment notification count
        incrementNotifications()
      } else if (payload.eventType === 'UPDATE' && payload.new?.read) {
        // Note: We don't have a decrementNotifications, so we'd need to refetch
        // For now, just log it
        if (__DEV__) {
          console.log('Notification marked as read')
        }
      }
    },
    [incrementNotifications]
  )

  useRealtimeSubscription(
    {
      table: 'notifications',
      event: '*',
      filter: userId ? `user_id=eq.${userId}` : undefined,
    },
    handlePayload,
    !!userId
  )
}

// Combined hook for all subscriptions
export function useAllRealtimeSubscriptions(userId: string | undefined) {
  useConversationsSubscription(userId)
  useMatchesSubscription(userId)
  useSuggestionsSubscription(userId)
  useNotificationsSubscription(userId)
}

export default useRealtimeSubscription
