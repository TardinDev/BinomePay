/**
 * Local storage service for BinomePay
 * Handles data persistence with AsyncStorage and security measures
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { Conversation, MatchItem, RequestItem, SuggestedItem, User } from '@/store/useAppStore'

// Storage keys
const STORAGE_KEYS = {
  USER_DATA: '@binomepay:user_data',
  CONVERSATIONS: '@binomepay:conversations',
  MATCHES: '@binomepay:matches',
  REQUESTS: '@binomepay:requests',
  SUGGESTED: '@binomepay:suggested',
  APP_STATE: '@binomepay:app_state',
  LAST_SYNC: '@binomepay:last_sync',
  NOTIFICATION_TOKEN: '@binomepay:notification_token'
} as const

interface AppStateStorage {
  notifications: number
  lastSyncTimestamp: number
  appVersion: string
}

/**
 * Generic storage operations with error handling
 */
class StorageManager {
  private async safeStore<T>(key: string, data: T): Promise<boolean> {
    try {
      const jsonData = JSON.stringify(data)
      await AsyncStorage.setItem(key, jsonData)
      return true
    } catch (error) {
      console.error(`Failed to store ${key}:`, error)
      return false
    }
  }

  private async safeRetrieve<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const jsonData = await AsyncStorage.getItem(key)
      return jsonData ? JSON.parse(jsonData) : defaultValue
    } catch (error) {
      console.error(`Failed to retrieve ${key}:`, error)
      return defaultValue
    }
  }

  private async safeRemove(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error)
      return false
    }
  }

  // User data operations
  async storeUserData(user: User): Promise<boolean> {
    return this.safeStore(STORAGE_KEYS.USER_DATA, {
      ...user,
      lastUpdated: Date.now()
    })
  }

  async getUserData(): Promise<User | null> {
    const userData = await this.safeRetrieve(STORAGE_KEYS.USER_DATA, null)
    if (!userData) return null

    // Check if data is older than 24 hours
    const isStale = Date.now() - ((userData as any).lastUpdated || 0) > 24 * 60 * 60 * 1000
    if (isStale) {
      console.log('User data is stale, should refresh from server')
    }

    return userData
  }

  // Conversations operations
  async storeConversations(conversations: Conversation[]): Promise<boolean> {
    return this.safeStore(STORAGE_KEYS.CONVERSATIONS, {
      data: conversations,
      timestamp: Date.now()
    })
  }

  async getConversations(): Promise<Conversation[]> {
    const result = await this.safeRetrieve(STORAGE_KEYS.CONVERSATIONS, { data: [], timestamp: 0 })
    return result.data || []
  }

  // Matches operations
  async storeMatches(matches: MatchItem[]): Promise<boolean> {
    return this.safeStore(STORAGE_KEYS.MATCHES, {
      data: matches,
      timestamp: Date.now()
    })
  }

  async getMatches(): Promise<MatchItem[]> {
    const result = await this.safeRetrieve(STORAGE_KEYS.MATCHES, { data: [], timestamp: 0 })
    return result.data || []
  }

  // Requests operations
  async storeRequests(requests: RequestItem[]): Promise<boolean> {
    return this.safeStore(STORAGE_KEYS.REQUESTS, {
      data: requests,
      timestamp: Date.now()
    })
  }

  async getRequests(): Promise<RequestItem[]> {
    const result = await this.safeRetrieve(STORAGE_KEYS.REQUESTS, { data: [], timestamp: 0 })
    return result.data || []
  }

  // Suggested operations (short-lived cache)
  async storeSuggested(suggested: SuggestedItem[]): Promise<boolean> {
    return this.safeStore(STORAGE_KEYS.SUGGESTED, {
      data: suggested,
      timestamp: Date.now()
    })
  }

  async getSuggested(): Promise<SuggestedItem[]> {
    const result = await this.safeRetrieve(STORAGE_KEYS.SUGGESTED, { data: [], timestamp: 0 })
    
    // Suggestions expire after 30 minutes
    const isExpired = Date.now() - result.timestamp > 30 * 60 * 1000
    if (isExpired) {
      await this.safeRemove(STORAGE_KEYS.SUGGESTED)
      return []
    }

    return result.data || []
  }

  // App state operations
  async storeAppState(state: Partial<AppStateStorage>): Promise<boolean> {
    const currentState = await this.getAppState()
    const newState = { ...currentState, ...state }
    return this.safeStore(STORAGE_KEYS.APP_STATE, newState)
  }

  async getAppState(): Promise<AppStateStorage> {
    return this.safeRetrieve(STORAGE_KEYS.APP_STATE, {
      notifications: 0,
      lastSyncTimestamp: 0,
      appVersion: '1.0.0'
    })
  }

  // Notification token operations
  async storeNotificationToken(token: string): Promise<boolean> {
    return this.safeStore(STORAGE_KEYS.NOTIFICATION_TOKEN, token)
  }

  async getNotificationToken(): Promise<string | null> {
    return this.safeRetrieve(STORAGE_KEYS.NOTIFICATION_TOKEN, null)
  }

  // Sync operations
  async updateLastSync(): Promise<boolean> {
    return this.safeStore(STORAGE_KEYS.LAST_SYNC, Date.now())
  }

  async getLastSync(): Promise<number> {
    return this.safeRetrieve(STORAGE_KEYS.LAST_SYNC, 0)
  }

  async isDataStale(maxAgeMinutes: number = 30): Promise<boolean> {
    const lastSync = await this.getLastSync()
    return Date.now() - lastSync > maxAgeMinutes * 60 * 1000
  }

  // Cleanup operations
  async clearUserData(): Promise<boolean> {
    const keys = [
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.CONVERSATIONS,
      STORAGE_KEYS.MATCHES,
      STORAGE_KEYS.REQUESTS,
      STORAGE_KEYS.SUGGESTED
    ]

    const results = await Promise.all(keys.map(key => this.safeRemove(key)))
    return results.every(result => result)
  }

  async clearCache(): Promise<boolean> {
    const cacheKeys = [
      STORAGE_KEYS.SUGGESTED,
      STORAGE_KEYS.LAST_SYNC
    ]

    const results = await Promise.all(cacheKeys.map(key => this.safeRemove(key)))
    return results.every(result => result)
  }

  async clearAll(): Promise<boolean> {
    try {
      await AsyncStorage.clear()
      return true
    } catch (error) {
      console.error('Failed to clear all storage:', error)
      return false
    }
  }

  // Diagnostic operations
  async getStorageInfo(): Promise<{ keys: string[], totalSize: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const binomeKeys = keys.filter(key => key.startsWith('@binomepay:'))
      
      let totalSize = 0
      for (const key of binomeKeys) {
        const data = await AsyncStorage.getItem(key)
        if (data) {
          totalSize += data.length
        }
      }

      return {
        keys: binomeKeys,
        totalSize
      }
    } catch (error) {
      console.error('Failed to get storage info:', error)
      return { keys: [], totalSize: 0 }
    }
  }
}

// Export singleton instance
export const storageService = new StorageManager()

// Convenience functions for the store
export const persistAppData = async (data: {
  user: User | null
  conversations: Conversation[]
  matches: MatchItem[]
  requests: RequestItem[]
  notifications: number
}): Promise<boolean> => {
  const results = await Promise.all([
    data.user ? storageService.storeUserData(data.user) : Promise.resolve(true),
    storageService.storeConversations(data.conversations),
    storageService.storeMatches(data.matches),
    storageService.storeRequests(data.requests),
    storageService.storeAppState({ notifications: data.notifications })
  ])

  const success = results.every(result => result)
  if (success) {
    await storageService.updateLastSync()
  }

  return success
}

export const loadAppData = async () => {
  try {
    const [user, conversations, matches, requests, appState] = await Promise.all([
      storageService.getUserData(),
      storageService.getConversations(),
      storageService.getMatches(),
      storageService.getRequests(),
      storageService.getAppState()
    ])

    return {
      user,
      conversations,
      matches,
      requests,
      notifications: appState.notifications,
      isStale: await storageService.isDataStale()
    }
  } catch (error) {
    console.error('Failed to load app data:', error)
    return null
  }
}