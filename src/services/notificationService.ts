/**
 * Notification service for BinomePay
 * Handles push notifications for matches, messages, and other events
 */

import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export interface NotificationData {
  type: 'match_accepted' | 'new_message' | 'match_expired' | 'kyc_update'
  title: string
  body: string
  data?: Record<string, any>
}

/**
 * Initialize notification permissions
 */
export const initializeNotifications = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.warn('Push notification permission not granted')
      return false
    }

    // Get push token for production use
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PROJECT_ID || 'your-project-id'
      })
      console.log('Push token:', token.data)
      
      // In production, send this token to your backend
      // await sendTokenToBackend(token.data)
    }

    return true
  } catch (error) {
    console.error('Failed to initialize notifications:', error)
    return false
  }
}

/**
 * Schedule a local notification
 */
export const scheduleLocalNotification = async (
  notificationData: NotificationData,
  delaySeconds: number = 0
): Promise<string | null> => {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data || {},
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: delaySeconds > 0 ? { seconds: delaySeconds } : null,
    })

    return identifier
  } catch (error) {
    console.error('Failed to schedule notification:', error)
    return null
  }
}

/**
 * Send notification when a match is accepted
 */
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
    data: {
      type: 'match_accepted',
      counterpartName,
      amount,
      currency,
      corridor
    }
  })
}

/**
 * Send notification for new message
 */
export const notifyNewMessage = async (
  senderName: string,
  message: string,
  conversationId: string
): Promise<void> => {
  await scheduleLocalNotification({
    type: 'new_message',
    title: `💬 ${senderName}`,
    body: message.length > 50 ? message.substring(0, 50) + '...' : message,
    data: {
      type: 'new_message',
      conversationId,
      senderName
    }
  })
}

/**
 * Send notification when match is about to expire
 */
export const notifyMatchExpiring = async (
  counterpartName: string,
  hoursRemaining: number
): Promise<void> => {
  await scheduleLocalNotification({
    type: 'match_expired',
    title: '⏰ Match expire bientôt',
    body: `Votre match avec ${counterpartName} expire dans ${hoursRemaining}h`,
    data: {
      type: 'match_expired',
      counterpartName,
      hoursRemaining
    }
  })
}

/**
 * Send notification for KYC status update
 */
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
    data: {
      type: 'kyc_update',
      status,
      reason
    }
  })
}

/**
 * Handle notification response (when user taps notification)
 */
export const handleNotificationResponse = (
  response: Notifications.NotificationResponse,
  navigation: any
) => {
  const data = response.notification.request.content.data

  switch (data.type) {
    case 'match_accepted':
      // Navigate to matches or conversations
      navigation.navigate('(Protected)', {
        screen: '(tabs)',
        params: { screen: 'messages' }
      })
      break
    
    case 'new_message':
      // Navigate directly to conversation
      if (data.conversationId) {
        navigation.navigate('(Protected)', {
          screen: 'messages',
          params: { screen: data.conversationId }
        })
      }
      break
    
    case 'match_expired':
      // Navigate to matches screen
      navigation.navigate('(Protected)', {
        screen: '(tabs)',
        params: { screen: 'index' }
      })
      break
    
    case 'kyc_update':
      // Navigate to profile
      navigation.navigate('(Protected)', {
        screen: 'profile'
      })
      break
  }
}

/**
 * Clear all notifications
 */
export const clearAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.dismissAllNotificationsAsync()
  } catch (error) {
    console.error('Failed to clear notifications:', error)
  }
}

/**
 * Get badge count
 */
export const getBadgeCount = async (): Promise<number> => {
  try {
    return await Notifications.getBadgeCountAsync()
  } catch (error) {
    console.error('Failed to get badge count:', error)
    return 0
  }
}

/**
 * Set badge count
 */
export const setBadgeCount = async (count: number): Promise<void> => {
  try {
    await Notifications.setBadgeCountAsync(count)
  } catch (error) {
    console.error('Failed to set badge count:', error)
  }
}