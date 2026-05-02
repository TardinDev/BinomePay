import { useEffect, useRef } from 'react'
import { useRouter } from 'expo-router'
import type * as NotificationsType from 'expo-notifications'
import Constants from 'expo-constants'
import { handleNotificationResponse } from '@/services/notificationService'

const isExpoGo = Constants.appOwnership === 'expo'

const Notifications: typeof NotificationsType | null = isExpoGo
  ? null
  : (require('expo-notifications') as typeof NotificationsType)

/**
 * Installe les listeners de notifications pour la session authentifiée.
 * - Listener foreground: reçoit les notifs pendant que l'app est ouverte
 * - Listener de response: gère le tap sur une notif (foreground ou background)
 * - Cold start: si l'app a été ouverte depuis une notif, on route immédiatement
 */
export const useNotificationListener = (enabled: boolean) => {
  const router = useRouter()
  const coldStartHandled = useRef(false)

  useEffect(() => {
    if (!enabled || isExpoGo || !Notifications) return

    // Cold start: app ouverte depuis une notification (tap alors qu'elle était fermée)
    if (!coldStartHandled.current) {
      coldStartHandled.current = true
      Notifications.getLastNotificationResponseAsync()
        .then((response) => {
          if (response) handleNotificationResponse(response, router)
        })
        .catch((error) => {
          if (__DEV__) console.warn('[notif] getLastNotificationResponse a échoué:', error)
        })
    }

    // Tap sur une notification (foreground ou background)
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotificationResponse(response, router)
    })

    return () => {
      responseSub.remove()
    }
  }, [enabled, router])
}
