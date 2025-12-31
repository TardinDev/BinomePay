import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'

export const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY as string

export const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key)
    } catch {
      return null
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value)
    } catch (error) {
      if (__DEV__) console.error('Erreur sauvegarde token Clerk:', error)
    }
  },
}


