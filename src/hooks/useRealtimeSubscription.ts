import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  RealtimeChannel,
  REALTIME_LISTEN_TYPES,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js'
import useAppStore from '@/store/useAppStore'
import { logger } from '@/utils/logger'

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
  onPayload: (_payload: PostgresPayload<T>) => void,
  enabled: boolean = true
) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Conserver le dernier callback dans une ref pour éviter de recréer le canal
  // à chaque rendu si l'appelant passe une fonction non mémoïsée.
  const onPayloadRef = useRef(onPayload)
  onPayloadRef.current = onPayload

  // Extraire les primitives hors de l'effet : les dépendances restent stables
  // (et non l'objet `config` qui est recréé à chaque rendu).
  const { table, event = '*', filter, schema = 'public' } = config

  useEffect(() => {
    if (!enabled || !supabase) return

    const channelName = `${table}_${event}_${filter || 'all'}_${Date.now()}`

    try {
      const channel = supabase
        .channel(channelName)
        .on(
          REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
          { event, schema, table, filter } as {
            event: SubscriptionEvent
            schema: string
            table: string
            filter?: string
          },
          (payload: RealtimePostgresChangesPayload<T>) => {
            logger.debug(`Realtime update on ${table}:`, payload.eventType)
            onPayloadRef.current(payload as unknown as PostgresPayload<T>)
          }
        )
        .subscribe((status: string) => {
          logger.debug(`Subscription status for ${table}:`, status)
        })

      channelRef.current = channel
    } catch (error) {
      logger.error('Error setting up realtime subscription:', error)
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [table, event, filter, schema, enabled])

  return channelRef.current
}

// Pre-built subscription hooks for common use cases

export function useConversationsSubscription(userId: string | undefined) {
  const addMessageToConversation = useAppStore((s) => s.addMessageToConversation)

  const handlePayload = useCallback(
    (
      payload: PostgresPayload<{
        id: string
        conversation_id: string
        content: string
        sender_id: string
        created_at: string
      }>
    ) => {
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
      logger.debug('Match update received:', payload.eventType)
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
      logger.debug('Suggestion update received:', payload.eventType)
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
  const handlePayload = useCallback(
    (payload: PostgresPayload<{ id: string; read: boolean }>) => {
      if (payload.eventType === 'INSERT') {
        // Increment notification count
        incrementNotifications()
      } else if (payload.eventType === 'UPDATE' && payload.new?.read) {
        // Note: We don't have a decrementNotifications, so we'd need to refetch
        // For now, just log it
        logger.debug('Notification marked as read')
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
