/* eslint-disable @typescript-eslint/no-explicit-any */
jest.unmock('@/services/notificationService')

// Override le mock global avec toutes les méthodes nécessaires
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notif-id-123')),
  setNotificationHandler: jest.fn(),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'ExponentPushToken[xxx]' })),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  dismissAllNotificationsAsync: jest.fn(() => Promise.resolve()),
  getBadgeCountAsync: jest.fn(() => Promise.resolve(5)),
  setBadgeCountAsync: jest.fn(() => Promise.resolve()),
  AndroidImportance: { HIGH: 4, DEFAULT: 3 },
  AndroidNotificationPriority: { HIGH: 'high' },
}))

// Mock expo-constants sans appOwnership (= pas Expo Go)
jest.mock('expo-constants', () => ({
  default: { appOwnership: null, expoConfig: { extra: {} } },
}))

import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'

const mockNotifications = Notifications as any

// Import du service (utilise les mocks ci-dessus)
import {
  initializeNotifications,
  scheduleLocalNotification,
  notifyMatchAccepted,
  notifyNewMessage,
  notifyMatchExpiring,
  notifyNewSuggestion,
  notifyKycUpdate,
  handleNotificationResponse,
  clearAllNotifications,
  getBadgeCount,
  setBadgeCount,
} from '../notificationService'

// ─────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────

describe('notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Rétablir les valeurs par défaut après clearAllMocks
    mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' })
    mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' })
    mockNotifications.scheduleNotificationAsync.mockResolvedValue('notif-id-123')
    mockNotifications.getExpoPushTokenAsync.mockResolvedValue({
      data: 'ExponentPushToken[xxx]',
    })
    mockNotifications.setNotificationChannelAsync.mockResolvedValue(undefined)
    mockNotifications.dismissAllNotificationsAsync.mockResolvedValue(undefined)
    mockNotifications.getBadgeCountAsync.mockResolvedValue(5)
    mockNotifications.setBadgeCountAsync.mockResolvedValue(undefined)
  })

  // ─── scheduleLocalNotification ───

  describe('scheduleLocalNotification', () => {
    it('programme une notification et retourne un identifiant', async () => {
      const result = await scheduleLocalNotification({
        type: 'match_accepted',
        title: 'Test',
        body: 'Body test',
        data: { foo: 'bar' },
      })

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: expect.objectContaining({
          title: 'Test',
          body: 'Body test',
          data: { foo: 'bar' },
          sound: 'default',
        }),
        trigger: null,
      })
      expect(result).toBe('notif-id-123')
    })

    it('utilise un délai si spécifié', async () => {
      await scheduleLocalNotification({ type: 'new_message', title: 'Delayed', body: 'Test' }, 10)

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: { seconds: 10 },
        })
      )
    })

    it("retourne null en cas d'erreur", async () => {
      mockNotifications.scheduleNotificationAsync.mockRejectedValue(new Error('fail'))

      const result = await scheduleLocalNotification({
        type: 'match_accepted',
        title: 'Test',
        body: 'Body',
      })

      expect(result).toBeNull()
    })
  })

  // ─── initializeNotifications ───

  describe('initializeNotifications', () => {
    it('retourne true si les permissions sont déjà accordées', async () => {
      const result = await initializeNotifications()

      expect(result).toBe(true)
      expect(mockNotifications.getPermissionsAsync).toHaveBeenCalled()
    })

    it('demande les permissions si non accordées', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' })
      mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' })

      const result = await initializeNotifications()

      expect(result).toBe(true)
      expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled()
    })

    it('retourne false si les permissions sont refusées', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' })
      mockNotifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' })

      const result = await initializeNotifications()

      expect(result).toBe(false)
    })

    it('retourne true même si le push token échoue', async () => {
      mockNotifications.getExpoPushTokenAsync.mockRejectedValue(new Error('no device'))

      const result = await initializeNotifications()

      expect(result).toBe(true)
    })
  })

  // ─── notifyMatchAccepted ───

  describe('notifyMatchAccepted', () => {
    it('programme une notification avec les bonnes données', async () => {
      await notifyMatchAccepted('Alice', 100, 'EUR', 'FR → SN')

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: '🎉 Nouveau match !',
            body: 'Alice a accepté votre proposition de 100 EUR (FR → SN)',
          }),
        })
      )
    })
  })

  // ─── notifyNewMessage ───

  describe('notifyNewMessage', () => {
    it('programme une notification message', async () => {
      await notifyNewMessage('Bob', 'Salut !', 'conv_123')

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: '💬 Bob',
            body: 'Salut !',
          }),
        })
      )
    })

    it('tronque les messages longs à 50 caractères', async () => {
      const longMessage = 'A'.repeat(80)

      await notifyNewMessage('Bob', longMessage, 'conv_123')

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            body: 'A'.repeat(50) + '...',
          }),
        })
      )
    })

    it('inclut le conversationId dans les data', async () => {
      await notifyNewMessage('Bob', 'Hey', 'conv_456')

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            data: expect.objectContaining({
              conversationId: 'conv_456',
              type: 'new_message',
            }),
          }),
        })
      )
    })
  })

  // ─── notifyMatchExpiring ───

  describe('notifyMatchExpiring', () => {
    it('affiche les heures restantes', async () => {
      await notifyMatchExpiring('Charlie', 2)

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: '⏰ Match expire bientôt',
            body: 'Votre match avec Charlie expire dans 2h',
          }),
        })
      )
    })
  })

  // ─── notifyNewSuggestion ───

  describe('notifyNewSuggestion', () => {
    it('affiche le singulier pour 1 suggestion', async () => {
      await notifyNewSuggestion(1)

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            body: '1 nouvelle proposition pour vous',
          }),
        })
      )
    })

    it('affiche le pluriel pour plusieurs suggestions', async () => {
      await notifyNewSuggestion(5)

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            body: '5 nouvelles propositions pour vous',
          }),
        })
      )
    })
  })

  // ─── notifyKycUpdate ───

  describe('notifyKycUpdate', () => {
    it('affiche succès pour verified', async () => {
      await notifyKycUpdate('verified')

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: '✅ Vérification réussie',
            body: 'Votre identité a été vérifiée avec succès !',
          }),
        })
      )
    })

    it('affiche échec avec raison pour rejected', async () => {
      await notifyKycUpdate('rejected', 'Document illisible')

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: '❌ Vérification échouée',
            body: 'Vérification échouée: Document illisible',
          }),
        })
      )
    })

    it('affiche raison par défaut si non spécifiée', async () => {
      await notifyKycUpdate('rejected')

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            body: 'Vérification échouée: Raison non spécifiée',
          }),
        })
      )
    })
  })

  // ─── handleNotificationResponse ───

  describe('handleNotificationResponse', () => {
    const makeResponse = (data: Record<string, any>) => ({
      notification: { request: { content: { data } } },
    })

    it('navigue vers messages pour match_accepted', () => {
      const navigation = { navigate: jest.fn() }

      handleNotificationResponse(makeResponse({ type: 'match_accepted' }) as any, navigation)

      expect(navigation.navigate).toHaveBeenCalledWith('(Protected)', {
        screen: '(tabs)',
        params: { screen: 'messages' },
      })
    })

    it('navigue vers la conversation pour new_message', () => {
      const navigation = { navigate: jest.fn() }

      handleNotificationResponse(
        makeResponse({ type: 'new_message', conversationId: 'conv_99' }) as any,
        navigation
      )

      expect(navigation.navigate).toHaveBeenCalledWith('(Protected)', {
        screen: 'messages',
        params: { screen: 'conv_99' },
      })
    })

    it('navigue vers home pour match_expired', () => {
      const navigation = { navigate: jest.fn() }

      handleNotificationResponse(makeResponse({ type: 'match_expired' }) as any, navigation)

      expect(navigation.navigate).toHaveBeenCalledWith('(Protected)', {
        screen: '(tabs)',
        params: { screen: 'index' },
      })
    })

    it('navigue vers profile pour kyc_update', () => {
      const navigation = { navigate: jest.fn() }

      handleNotificationResponse(makeResponse({ type: 'kyc_update' }) as any, navigation)

      expect(navigation.navigate).toHaveBeenCalledWith('(Protected)', {
        screen: 'profile',
      })
    })

    it('navigue vers home pour new_suggestion', () => {
      const navigation = { navigate: jest.fn() }

      handleNotificationResponse(makeResponse({ type: 'new_suggestion' }) as any, navigation)

      expect(navigation.navigate).toHaveBeenCalledWith('(Protected)', {
        screen: '(tabs)',
        params: { screen: 'index' },
      })
    })

    it('ne navigue pas pour new_message sans conversationId', () => {
      const navigation = { navigate: jest.fn() }

      handleNotificationResponse(makeResponse({ type: 'new_message' }) as any, navigation)

      expect(navigation.navigate).not.toHaveBeenCalled()
    })
  })

  // ─── clearAllNotifications ───

  describe('clearAllNotifications', () => {
    it('appelle dismissAllNotificationsAsync', async () => {
      await clearAllNotifications()

      expect(mockNotifications.dismissAllNotificationsAsync).toHaveBeenCalled()
    })

    it("ne throw pas en cas d'erreur", async () => {
      mockNotifications.dismissAllNotificationsAsync.mockRejectedValue(new Error('fail'))

      await expect(clearAllNotifications()).resolves.toBeUndefined()
    })
  })

  // ─── getBadgeCount ───

  describe('getBadgeCount', () => {
    it('retourne le nombre de badges', async () => {
      const count = await getBadgeCount()

      expect(count).toBe(5)
    })

    it("retourne 0 en cas d'erreur", async () => {
      mockNotifications.getBadgeCountAsync.mockRejectedValue(new Error('fail'))

      const count = await getBadgeCount()

      expect(count).toBe(0)
    })
  })

  // ─── setBadgeCount ───

  describe('setBadgeCount', () => {
    it('définit le nombre de badges', async () => {
      await setBadgeCount(3)

      expect(mockNotifications.setBadgeCountAsync).toHaveBeenCalledWith(3)
    })

    it("ne throw pas en cas d'erreur", async () => {
      mockNotifications.setBadgeCountAsync.mockRejectedValue(new Error('fail'))

      await expect(setBadgeCount(3)).resolves.toBeUndefined()
    })
  })
})
