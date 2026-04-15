/* eslint-disable @typescript-eslint/no-explicit-any */
jest.unmock('@/services/syncService')

import NetInfo from '@react-native-community/netinfo'
import ApiService from '@/services/apiService'
import useAppStore from '@/store/useAppStore'
import {
  notifyMatchAccepted,
  notifyNewMessage,
  notifyNewSuggestion,
} from '@/services/notificationService'
import { syncService } from '../syncService'

const mockNetInfo = NetInfo as any
const mockApiService = ApiService as any

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────

function resetStore(overrides: Record<string, any> = {}) {
  useAppStore.setState({
    user: { id: 'user_1', name: 'Test User', kycStatus: 'verified', ratingAvg: 4.5 },
    requests: [],
    matches: [],
    conversations: [],
    suggested: [],
    notifications: 0,
    isLoading: false,
    error: null,
    ...overrides,
  })
}

// ─────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────

describe('syncService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    resetStore()

    // Reset interne du syncService (accès aux propriétés privées via any)
    ;(syncService as any).syncInProgress = false
    ;(syncService as any).lastSyncTimestamp = 0
    ;(syncService as any).USE_MOCK_API = false

    // Mock API defaults
    mockApiService.checkApiHealth.mockResolvedValue(true)
    mockApiService.processOfflineQueue.mockResolvedValue(undefined)
    mockApiService.syncUserData.mockResolvedValue({
      user: { id: 'user_1', name: 'Test User', kycStatus: 'verified', ratingAvg: 4.5 },
      requests: [],
      matches: [],
      conversations: [],
      suggestions: [],
    })

    // Mock NetInfo
    mockNetInfo.fetch.mockResolvedValue({ isConnected: true })
    mockNetInfo.addEventListener.mockReturnValue(jest.fn())
  })

  afterEach(() => {
    syncService.destroy()
  })

  // ─── performSync ───

  describe('performSync', () => {
    it('synchronise les données quand connecté', async () => {
      const result = await syncService.performSync()

      expect(result).toBe(true)
      expect(mockApiService.checkApiHealth).toHaveBeenCalled()
      expect(mockApiService.processOfflineQueue).toHaveBeenCalled()
      expect(mockApiService.syncUserData).toHaveBeenCalledWith('user_1')
    })

    it('retourne false sans utilisateur connecté', async () => {
      useAppStore.setState({ user: null })

      const result = await syncService.performSync()

      expect(result).toBe(false)
    })

    it('retourne false sans connexion réseau', async () => {
      mockNetInfo.fetch.mockResolvedValue({ isConnected: false })

      const result = await syncService.performSync()

      expect(result).toBe(false)
    })

    it('retourne false si API non disponible', async () => {
      mockApiService.checkApiHealth.mockResolvedValue(false)

      const result = await syncService.performSync()

      expect(result).toBe(false)
    })

    it('respecte le délai minimum entre syncs', async () => {
      await syncService.performSync()

      const result = await syncService.performSync() // Trop tôt

      expect(result).toBe(false)
    })

    it("retourne false en cas d'erreur", async () => {
      mockNetInfo.fetch.mockRejectedValue(new Error('network fail'))

      const result = await syncService.performSync()

      expect(result).toBe(false)
    })
  })

  // ─── Détection des changements et notifications ───

  describe('détection de nouveaux matches → notification', () => {
    it('envoie une notification pour chaque nouveau match', async () => {
      resetStore({
        matches: [
          {
            id: 'match_1',
            counterpartName: 'Alice',
            amount: 100,
            currency: 'EUR',
            corridor: 'FR→SN',
            status: 'ACCEPTED',
          },
        ],
      })

      // syncUserData échoue → fallback qui permet la détection fine
      mockApiService.syncUserData.mockRejectedValue(new Error('fail'))
      mockApiService.fetchUserProfile.mockResolvedValue({
        id: 'user_1',
        name: 'Test',
        kycStatus: 'verified',
        ratingAvg: 4.5,
      })
      mockApiService.fetchUserRequests.mockResolvedValue([])
      mockApiService.fetchUserMatches.mockResolvedValue([
        {
          id: 'match_1',
          counterpartName: 'Alice',
          amount: 100,
          currency: 'EUR',
          corridor: 'FR→SN',
          status: 'ACCEPTED',
        },
        {
          id: 'match_2',
          counterpartName: 'Bob',
          amount: 200,
          currency: 'USD',
          corridor: 'US→MX',
          status: 'ACCEPTED',
        },
      ])
      mockApiService.fetchUserConversations.mockResolvedValue([])
      mockApiService.fetchSuggestionsForUser.mockResolvedValue([])

      await syncService.performSync(true)

      expect(notifyMatchAccepted).toHaveBeenCalledWith('Bob', 200, 'USD', 'US→MX')
      expect(notifyMatchAccepted).toHaveBeenCalledTimes(1)
    })
  })

  describe('détection de nouveaux messages → notification', () => {
    it('envoie une notification quand unreadCount augmente', async () => {
      resetStore({
        conversations: [
          {
            id: 'conv_1',
            counterpartName: 'Alice',
            lastMessage: 'Salut',
            updatedAt: 1000,
            unreadCount: 0,
          },
        ],
      })

      mockApiService.syncUserData.mockRejectedValue(new Error('fail'))
      mockApiService.fetchUserProfile.mockResolvedValue({
        id: 'user_1',
        name: 'Test',
        kycStatus: 'verified',
        ratingAvg: 4.5,
      })
      mockApiService.fetchUserRequests.mockResolvedValue([])
      mockApiService.fetchUserMatches.mockResolvedValue([])
      mockApiService.fetchSuggestionsForUser.mockResolvedValue([])
      mockApiService.fetchUserConversations.mockResolvedValue([
        {
          id: 'conv_1',
          counterpartName: 'Alice',
          lastMessage: 'Nouveau msg',
          updatedAt: 2000,
          unreadCount: 1,
        },
      ])

      await syncService.performSync(true)

      expect(notifyNewMessage).toHaveBeenCalledWith('Alice', 'Nouveau msg', 'conv_1')
    })

    it("ne notifie pas si unreadCount n'augmente pas", async () => {
      resetStore({
        conversations: [
          {
            id: 'conv_1',
            counterpartName: 'Alice',
            lastMessage: 'Salut',
            updatedAt: 1000,
            unreadCount: 2,
          },
        ],
      })

      mockApiService.syncUserData.mockRejectedValue(new Error('fail'))
      mockApiService.fetchUserProfile.mockResolvedValue({
        id: 'user_1',
        name: 'Test',
        kycStatus: 'verified',
        ratingAvg: 4.5,
      })
      mockApiService.fetchUserRequests.mockResolvedValue([])
      mockApiService.fetchUserMatches.mockResolvedValue([])
      mockApiService.fetchSuggestionsForUser.mockResolvedValue([])
      mockApiService.fetchUserConversations.mockResolvedValue([
        {
          id: 'conv_1',
          counterpartName: 'Alice',
          lastMessage: 'Salut',
          updatedAt: 2000,
          unreadCount: 0,
        },
      ])

      await syncService.performSync(true)

      expect(notifyNewMessage).not.toHaveBeenCalled()
    })
  })

  describe('détection de nouvelles suggestions → notification', () => {
    it('envoie une notification avec le bon nombre', async () => {
      resetStore({ suggested: [] })

      mockApiService.syncUserData.mockRejectedValue(new Error('fail'))
      mockApiService.fetchUserProfile.mockResolvedValue({
        id: 'user_1',
        name: 'Test',
        kycStatus: 'verified',
        ratingAvg: 4.5,
      })
      mockApiService.fetchUserRequests.mockResolvedValue([])
      mockApiService.fetchUserMatches.mockResolvedValue([])
      mockApiService.fetchUserConversations.mockResolvedValue([])
      mockApiService.fetchSuggestionsForUser.mockResolvedValue([
        {
          id: 'sug_1',
          amount: 50,
          currency: 'EUR',
          originCountryName: 'France',
          destCountryName: 'Sénégal',
          senderName: 'Alice',
          createdAt: 1000,
        },
        {
          id: 'sug_2',
          amount: 100,
          currency: 'USD',
          originCountryName: 'USA',
          destCountryName: 'Mexique',
          senderName: 'Bob',
          createdAt: 2000,
        },
      ])

      await syncService.performSync(true)

      expect(notifyNewSuggestion).toHaveBeenCalledWith(2)
    })

    it('ne notifie pas si aucune nouvelle suggestion', async () => {
      const existing = [
        {
          id: 'sug_1',
          amount: 50,
          currency: 'EUR',
          originCountryName: 'FR',
          destCountryName: 'SN',
          senderName: 'Alice',
          createdAt: 1000,
        },
      ]
      resetStore({ suggested: existing })

      mockApiService.syncUserData.mockRejectedValue(new Error('fail'))
      mockApiService.fetchUserProfile.mockResolvedValue({
        id: 'user_1',
        name: 'Test',
        kycStatus: 'verified',
        ratingAvg: 4.5,
      })
      mockApiService.fetchUserRequests.mockResolvedValue([])
      mockApiService.fetchUserMatches.mockResolvedValue([])
      mockApiService.fetchUserConversations.mockResolvedValue([])
      mockApiService.fetchSuggestionsForUser.mockResolvedValue(existing)

      await syncService.performSync(true)

      expect(notifyNewSuggestion).not.toHaveBeenCalled()
    })
  })

  // ─── Initialize et destroy ───

  describe('initialize / destroy', () => {
    it('configure les listeners NetInfo', async () => {
      await syncService.initialize()

      expect(mockNetInfo.addEventListener).toHaveBeenCalled()
    })

    it('destroy nettoie les listeners et timers', async () => {
      const mockUnsubscribe = jest.fn()
      mockNetInfo.addEventListener.mockReturnValue(mockUnsubscribe)

      await syncService.initialize()
      syncService.destroy()

      expect(mockUnsubscribe).toHaveBeenCalled()
      expect(syncService.isSyncing).toBe(false)
    })
  })

  // ─── forceSync ───

  describe('forceSync', () => {
    it('force la sync en ignorant le délai', async () => {
      const result = await syncService.forceSync()

      expect(result).toBe(true)
      expect(mockApiService.syncUserData).toHaveBeenCalled()
    })
  })

  // ─── Mode mock ───

  describe('mode mock API', () => {
    it('retourne true sans synchroniser en mode mock', async () => {
      ;(syncService as any).USE_MOCK_API = true

      const result = await syncService.performSync()

      expect(result).toBe(true)
      expect(mockApiService.syncUserData).not.toHaveBeenCalled()
    })
  })
})
