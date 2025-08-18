import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'

export const clerkPublishableKey = (Constants.expoConfig?.extra as any)?.CLERK_PUBLISHABLE_KEY as string

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
    } catch {}
  },
}


