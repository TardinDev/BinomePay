/**
 * Notification service for BinomePay
 * - Configure le handler foreground
 * - Crée les canaux Android
 * - Expose des helpers pour les notifications locales (fallback si push indisponible)
 * - Gère la navigation lors du tap sur une notif
 *
 * L'enregistrement du token Expo Push est géré dans `pushTokenService.ts`.
 */

import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import Constants from 'expo-constants'
import { requestPushPermissions } from '@/services/pushTokenService'

const isExpoGo = Constants.appOwnership === 'expo'

// Handler foreground: affiche la notif même quand l'app est ouverte
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () =>
      ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }) as any,
  })
}

export type NotificationType =
  | 'match_accepted'
  | 'new_message'
  | 'match_expired'
  | 'kyc_update'
  | 'new_suggestion'

export interface NotificationData {
  type: NotificationType
  title: string
  body: string
  data?: Record<string, any>
}

const createNotificationChannels = async (): Promise<void> => {
  if (Platform.OS !== 'android') return

  try {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notifications générales',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#EAB308',
    } as any)

    await Notifications.setNotificationChannelAsync('match_accepted', {
      name: 'Nouveaux matches',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#22C55E',
    } as any)

    await Notifications.setNotificationChannelAsync('new_message', {
      name: 'Nouveaux messages',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 125, 250],
      lightColor: '#3B82F6',
    } as any)

    await Notifications.setNotificationChannelAsync('new_suggestion', {
      name: 'Nouvelles propositions',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#FDE68A',
    } as any)

    await Notifications.setNotificationChannelAsync('kyc_update', {
      name: 'Vérification KYC',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#EAB308',
    } as any)
  } catch (error) {
    if (__DEV__) console.error('[notif] création canaux Android:', error)
  }
}

/**
 * Initialise l'infrastructure de notifications (canaux + permissions).
 * À appeler au démarrage de la session authentifiée, avant `registerPushTokenForUser`.
 */
export const initializeNotifications = async (): Promise<boolean> => {
  if (isExpoGo) {
    if (__DEV__) console.warn('[notif] Expo Go — notifications désactivées')
    return false
  }

  try {
    await createNotificationChannels()
    const granted = await requestPushPermissions()
    if (!granted && __DEV__) console.warn('[notif] Permission non accordée')
    return granted
  } catch (error) {
    if (__DEV__) console.error('[notif] init échouée:', error)
    return false
  }
}

/**
 * Planifie une notification locale (fallback si le push serveur échoue ou pour tests).
 */
export const scheduleLocalNotification = async (
  notification: NotificationData,
  delaySeconds: number = 0
): Promise<string | null> => {
  if (isExpoGo) return null

  try {
    const content: any = {
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      sound: 'default',
    }

    if (Platform.OS === 'android') {
      content.priority = Notifications.AndroidNotificationPriority.HIGH
      content.channelId = notification.type
    }

    return await Notifications.scheduleNotificationAsync({
      content,
      trigger: delaySeconds > 0 ? ({ seconds: delaySeconds } as any) : null,
    })
  } catch (error) {
    if (__DEV__) console.error('[notif] schedule échouée:', error)
    return null
  }
}

// ============================================================================
// Helpers de notifications locales (fallback côté client)
// Les événements déclenchés par d'autres users passent par les triggers DB +
// l'Edge Function. Ces helpers servent pour les actions locales de l'user courant
// ou en fallback si le push serveur n'est pas disponible.
// ============================================================================

export const notifyMatchAccepted = async (
  counterpartName: string,
  amount: number,
  currency: string,
  corridor: string
): Promise<void> => {
  await scheduleLocalNotification({
    type: 'match_accepted',
    title: '🎉 Nouveau match !',
    body: `${counterpartName} a accepté votre proposition de ${amount} ${currency} (${corridor})`,
    data: { type: 'match_accepted', counterpartName, amount, currency, corridor },
  })
}

export const notifyNewMessage = async (
  senderName: string,
  message: string,
  conversationId: string
): Promise<void> => {
  await scheduleLocalNotification({
    type: 'new_message',
    title: `💬 ${senderName}`,
    body: message.length > 50 ? message.substring(0, 50) + '...' : message,
    data: { type: 'new_message', conversationId, senderName },
  })
}

export const notifyMatchExpiring = async (
  counterpartName: string,
  hoursRemaining: number
): Promise<void> => {
  await scheduleLocalNotification({
    type: 'match_expired',
    title: '⏰ Match expire bientôt',
    body: `Votre match avec ${counterpartName} expire dans ${hoursRemaining}h`,
    data: { type: 'match_expired', counterpartName, hoursRemaining },
  })
}

export const notifyNewSuggestion = async (count: number): Promise<void> => {
  await scheduleLocalNotification({
    type: 'new_suggestion',
    title: '💡 Nouvelles propositions',
    body: `${count} nouvelle${count > 1 ? 's' : ''} proposition${count > 1 ? 's' : ''} pour vous`,
    data: { type: 'new_suggestion', count },
  })
}

export const notifyKycUpdate = async (
  status: 'verified' | 'rejected',
  reason?: string
): Promise<void> => {
  const isVerified = status === 'verified'
  await scheduleLocalNotification({
    type: 'kyc_update',
    title: isVerified ? '✅ Vérification réussie' : '❌ Vérification échouée',
    body: isVerified
      ? 'Votre identité a été vérifiée avec succès !'
      : `Vérification échouée: ${reason || 'Raison non spécifiée'}`,
    data: { type: 'kyc_update', status, reason },
  })
}

/**
 * Gère le tap sur une notification (foreground, background ou app fermée).
 * Route l'utilisateur vers le bon écran selon `data.type`.
 */
export const handleNotificationResponse = (
  response: Notifications.NotificationResponse,
  router: any
): void => {
  const data = response.notification.request.content.data as
    | { type?: NotificationType; conversationId?: string; matchId?: string }
    | undefined

  if (!data?.type) return

  switch (data.type) {
    case 'new_message':
      if (data.conversationId) {
        router.push(`/(Protected)/messages/${data.conversationId}`)
      } else {
        router.push('/(Protected)/(tabs)/messages')
      }
      break

    case 'match_accepted':
      router.push('/(Protected)/(tabs)/messages')
      break

    case 'match_expired':
    case 'new_suggestion':
      router.push('/(Protected)/(tabs)')
      break

    case 'kyc_update':
      router.push('/(Protected)/profile')
      break
  }
}

export const clearAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.dismissAllNotificationsAsync()
  } catch (error) {
    if (__DEV__) console.error('[notif] clear échouée:', error)
  }
}

export const getBadgeCount = async (): Promise<number> => {
  try {
    return await Notifications.getBadgeCountAsync()
  } catch {
    return 0
  }
}

export const setBadgeCount = async (count: number): Promise<void> => {
  try {
    await Notifications.setBadgeCountAsync(count)
  } catch (error) {
    if (__DEV__) console.error('[notif] setBadgeCount échouée:', error)
  }
}
