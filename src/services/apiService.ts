import AsyncStorage from '@react-native-async-storage/async-storage'
import { User, RequestItem, MatchItem, Conversation, SuggestedItem } from '@/store/useAppStore'

// Types pour les messages
export type Message = {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: number
}

// Types pour les actions hors ligne - discriminated union
export type CreateRequestAction = {
  type: 'CREATE_REQUEST'
  payload: Omit<RequestItem, 'id' | 'status'>
  userId: string
  timestamp: number
}

export type SendMessageAction = {
  type: 'SEND_MESSAGE'
  payload: { conversationId: string; message: string }
  userId: string
  timestamp: number
}

export type AcceptSuggestionAction = {
  type: 'ACCEPT_SUGGESTION'
  payload: { suggestionId: string }
  userId: string
  timestamp: number
}

export type UpdateProfileAction = {
  type: 'UPDATE_PROFILE'
  payload: Partial<User>
  userId: string
  timestamp: number
}

export type OfflineAction = CreateRequestAction | SendMessageAction | AcceptSuggestionAction | UpdateProfileAction

// Configuration de l'API
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
const USE_MOCK_API = process.env.EXPO_PUBLIC_MOCK_API === 'true'

// Headers de base pour les requêtes API
const getAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await AsyncStorage.getItem('auth_token')
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  }
}

// Gestion des erreurs API
class ApiError extends Error {
  status: number
  
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Erreur réseau' }))
    throw new ApiError(errorData.message || 'Erreur API', response.status)
  }
  return response.json()
}

// Mock data pour le mode développement
const createMockError = (message: string) => {
  throw new ApiError(`Mode mock activé: ${message}`, 503)
}

export class ApiService {
  
  // Vérification du mode mock
  private static shouldUseMockData(): boolean {
    return USE_MOCK_API
  }
  // ================================
  // GESTION UTILISATEUR
  // ================================
  
  static async fetchUserProfile(userId: string): Promise<User> {
    if (this.shouldUseMockData()) {
      if (__DEV__) console.log('Mode mock: retour de données utilisateur mock')
      return Promise.resolve({
        id: userId,
        name: 'Utilisateur Mock',
        kycStatus: 'verified',
        ratingAvg: 4.8,
      })
    }

    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, { headers })
      return await handleApiResponse(response)
    } catch (error) {
      if (__DEV__) console.error('Erreur récupération profil:', error)
      throw error
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates)
      })
      return await handleApiResponse(response)
    } catch (error) {
      if (__DEV__) console.error('Erreur mise à jour profil:', error)
      throw error
    }
  }

  static async updateKycStatus(userId: string, status: User['kycStatus']): Promise<void> {
    try {
      await this.updateUserProfile(userId, { kycStatus: status })
    } catch (error) {
      if (__DEV__) console.error('Erreur mise à jour KYC:', error)
      throw error
    }
  }

  // ================================
  // GESTION DES INTENTIONS (REQUESTS)
  // ================================

  static async fetchUserRequests(userId: string): Promise<RequestItem[]> {
    if (this.shouldUseMockData()) {
      if (__DEV__) console.log('Mode mock: retour de données intentions mock')
      return Promise.resolve([])
    }

    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/users/${userId}/requests`, { headers })
      return await handleApiResponse(response)
    } catch (error) {
      if (__DEV__) console.error('Erreur récupération intentions:', error)
      throw error
    }
  }

  static async createRequest(userId: string, request: Omit<RequestItem, 'id' | 'status'>): Promise<RequestItem> {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/users/${userId}/requests`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      })
      return await handleApiResponse(response)
    } catch (error) {
      if (__DEV__) console.error('Erreur création intention:', error)
      throw error
    }
  }

  static async updateRequestStatus(requestId: string, status: RequestItem['status']): Promise<void> {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      })
      await handleApiResponse(response)
    } catch (error) {
      if (__DEV__) console.error('Erreur mise à jour statut intention:', error)
      throw error
    }
  }

  // ================================
  // GESTION DES SUGGESTIONS
  // ================================

  static async fetchSuggestionsForUser(userId: string): Promise<SuggestedItem[]> {
    if (this.shouldUseMockData()) {
      if (__DEV__) console.log('Mode mock: retour de données suggestions mock')
      return Promise.resolve([])
    }

    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/users/${userId}/suggestions`, { headers })
      return await handleApiResponse(response)
    } catch (error) {
      if (__DEV__) console.error('Erreur récupération suggestions:', error)
      throw error
    }
  }

  static async acceptSuggestion(suggestionId: string, userId: string): Promise<{ conversationId: string; matchId: string }> {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/suggestions/${suggestionId}/accept`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId })
      })
      return await handleApiResponse(response)
    } catch (error) {
      if (__DEV__) console.error('Erreur acceptation suggestion:', error)
      throw error
    }
  }

  // ================================
  // GESTION DES MATCHES
  // ================================

  static async fetchUserMatches(userId: string): Promise<MatchItem[]> {
    if (this.shouldUseMockData()) {
      if (__DEV__) console.log('Mode mock: retour de données matches mock')
      return Promise.resolve([])
    }

    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/users/${userId}/matches`, { headers })
      return await handleApiResponse(response)
    } catch (error) {
      if (__DEV__) console.error('Erreur récupération matches:', error)
      throw error
    }
  }

  static async updateMatchStatus(matchId: string, status: MatchItem['status']): Promise<void> {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/matches/${matchId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      })
      await handleApiResponse(response)
    } catch (error) {
      if (__DEV__) console.error('Erreur mise à jour statut match:', error)
      throw error
    }
  }

  // ================================
  // GESTION DES CONVERSATIONS
  // ================================

  static async fetchUserConversations(userId: string): Promise<Conversation[]> {
    if (this.shouldUseMockData()) {
      if (__DEV__) console.log('Mode mock: retour de données conversations mock')
      return Promise.resolve([])
    }

    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/users/${userId}/conversations`, { headers })
      return await handleApiResponse(response)
    } catch (error) {
      if (__DEV__) console.error('Erreur récupération conversations:', error)
      throw error
    }
  }

  static async fetchConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, { headers })
      return await handleApiResponse(response)
    } catch (error) {
      if (__DEV__) console.error('Erreur récupération messages:', error)
      throw error
    }
  }

  static async sendMessage(conversationId: string, message: string, senderId: string): Promise<Message> {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message, senderId })
      })
      return await handleApiResponse(response)
    } catch (error) {
      if (__DEV__) console.error('Erreur envoi message:', error)
      throw error
    }
  }

  static async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/read`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId })
      })
      await handleApiResponse(response)
    } catch (error) {
      if (__DEV__) console.error('Erreur marquage conversation lue:', error)
      throw error
    }
  }

  // ================================
  // GESTION DE LA SYNCHRONISATION
  // ================================

  static async syncUserData(userId: string): Promise<{
    user: User
    requests: RequestItem[]
    matches: MatchItem[]
    suggestions: SuggestedItem[]
    conversations: Conversation[]
  }> {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/users/${userId}/sync`, { headers })
      return await handleApiResponse(response)
    } catch (error) {
      if (__DEV__) console.error('Erreur synchronisation:', error)
      throw error
    }
  }

  // ================================
  // GESTION HORS LIGNE
  // ================================

  static async queueOfflineAction(action: OfflineAction): Promise<void> {
    try {
      const offlineQueue = await AsyncStorage.getItem('offline_queue')
      const queue: OfflineAction[] = offlineQueue ? JSON.parse(offlineQueue) : []
      queue.push(action)
      await AsyncStorage.setItem('offline_queue', JSON.stringify(queue))
    } catch (error) {
      if (__DEV__) console.error('Erreur ajout queue hors ligne:', error)
    }
  }

  static async processOfflineQueue(): Promise<void> {
    try {
      const offlineQueue = await AsyncStorage.getItem('offline_queue')
      if (!offlineQueue) return

      const queue: OfflineAction[] = JSON.parse(offlineQueue)
      const processedActions: string[] = []

      for (const action of queue) {
        try {
          await this.processOfflineAction(action)
          processedActions.push(action.timestamp.toString())
        } catch (error) {
          if (__DEV__) console.error('Erreur traitement action hors ligne:', error)
        }
      }

      // Supprimer les actions traitées
      const remainingQueue = queue.filter((action) =>
        !processedActions.includes(action.timestamp.toString())
      )

      await AsyncStorage.setItem('offline_queue', JSON.stringify(remainingQueue))
    } catch (error) {
      if (__DEV__) console.error('Erreur traitement queue hors ligne:', error)
    }
  }

  private static async processOfflineAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'CREATE_REQUEST':
        await this.createRequest(action.userId, action.payload)
        break
      case 'SEND_MESSAGE':
        await this.sendMessage(action.payload.conversationId, action.payload.message, action.userId)
        break
      case 'ACCEPT_SUGGESTION':
        await this.acceptSuggestion(action.payload.suggestionId, action.userId)
        break
      case 'UPDATE_PROFILE':
        await this.updateUserProfile(action.userId, action.payload)
        break
    }
  }

  // ================================
  // UTILITAIRES
  // ================================

  static async checkApiHealth(): Promise<boolean> {
    if (this.shouldUseMockData()) {
      if (__DEV__) console.log('Mode mock: API considérée comme disponible')
      return Promise.resolve(true)
    }

    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        timeout: 5000
      } as RequestInit & { timeout: number })
      return response.ok
    } catch (error) {
      if (__DEV__) console.error('API non disponible:', error)
      return false
    }
  }

  static async uploadAvatar(userId: string, imageUri: string): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('avatar', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'avatar.jpg'
      } as unknown as Blob)

      const headers = await getAuthHeaders()
      delete (headers as Record<string, string>)['Content-Type']

      const response = await fetch(`${API_BASE_URL}/users/${userId}/avatar`, {
        method: 'POST',
        headers,
        body: formData
      })

      const result = await handleApiResponse(response)
      return result.avatarUrl
    } catch (error) {
      if (__DEV__) console.error('Erreur upload avatar:', error)
      throw error
    }
  }
}

export default ApiService