/**
 * Push Token Service
 * Persiste le token Expo Push de l'appareil dans Supabase (table push_tokens).
 * Appelé après authentification et au logout.
 */

import { Platform } from 'react-native'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { supabase } from '@/lib/supabase'

const isExpoGo = Constants.appOwnership === 'expo'

const getProjectId = (): string | undefined => {
  return (
    (Constants.expoConfig?.extra as any)?.eas?.projectId ||
    (Constants.easConfig as any)?.projectId ||
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID
  )
}

export const requestPushPermissions = async (): Promise<boolean> => {
  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === 'granted') return true

  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

/**
 * Récupère le token Expo Push du device (nécessite un device physique + build dev/prod).
 * Retourne null si on est dans Expo Go, sur un simulateur/émulateur, ou si les permissions sont refusées.
 */
export const getExpoPushToken = async (): Promise<string | null> => {
  if (isExpoGo) {
    if (__DEV__) console.warn('[push] Expo Go détecté — push désactivé')
    return null
  }

  if (!Device.isDevice) {
    if (__DEV__) console.warn('[push] Simulateur/émulateur détecté — push désactivé')
    return null
  }

  const granted = await requestPushPermissions()
  if (!granted) {
    if (__DEV__) console.warn('[push] Permission refusée')
    return null
  }

  const projectId = getProjectId()
  if (!projectId) {
    if (__DEV__) console.error('[push] EAS projectId absent — impossible de récupérer le token')
    return null
  }

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId })
    return data
  } catch (error) {
    if (__DEV__) console.error('[push] getExpoPushTokenAsync a échoué:', error)
    return null
  }
}

/**
 * Enregistre le token dans Supabase pour l'utilisateur courant.
 * Idempotent: ON CONFLICT(token) met à jour user_id/platform/updated_at.
 */
export const registerPushTokenForUser = async (userId: string): Promise<string | null> => {
  const token = await getExpoPushToken()
  if (!token) return null

  const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web'
  const deviceName =
    Device.deviceName || `${Device.manufacturer ?? ''} ${Device.modelName ?? ''}`.trim()

  const { error } = await supabase.from('push_tokens').upsert(
    {
      user_id: userId,
      token,
      platform,
      device_name: deviceName || null,
      app_version: Constants.expoConfig?.version ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'token' }
  )

  if (error) {
    if (__DEV__) console.error('[push] upsert push_tokens échoué:', error)
    return null
  }

  return token
}

/**
 * Supprime le token Expo Push du device courant de Supabase.
 * À appeler AVANT reset/logout de Clerk (sinon le JWT est perdu et la policy RLS bloque la suppression).
 */
export const unregisterPushTokenForUser = async (): Promise<void> => {
  try {
    const token = await getExpoPushToken().catch(() => null)
    if (!token) return

    const { error } = await supabase.from('push_tokens').delete().eq('token', token)
    if (error && __DEV__) console.warn('[push] delete push_tokens échoué:', error)
  } catch (error) {
    if (__DEV__) console.warn('[push] unregister a échoué:', error)
  }
}
