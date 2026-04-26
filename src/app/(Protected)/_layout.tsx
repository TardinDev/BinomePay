import { useEffect, useRef } from 'react'
import { Stack, useRouter } from 'expo-router'
import { View } from 'react-native'
import { useAuth } from '@/lib/auth'
import useAppStore from '@/store/useAppStore'
import ConnectionStatus from '@/components/ConnectionStatus'
import { LoadingScreen } from '@/components/LoadingSpinner'
import { initializeNotifications } from '@/services/notificationService'
import { registerPushTokenForUser } from '@/services/pushTokenService'
import { useNotificationListener } from '@/hooks/useNotificationListener'

export default function ProtectedLayout() {
  const router = useRouter()
  const hasRedirected = useRef(false)
  const notificationsInitialized = useRef(false)

  const { isLoaded, isSignedIn, user: authUser, session } = useAuth()
  const user = useAppStore((s) => s.user)
  const isLoading = useAppStore((s) => s.isLoading)
  const isLoggingOut = useAppStore((s) => s.isLoggingOut)
  const initializeUserData = useAppStore((s) => s.initializeUserData)
  const reset = useAppStore((s) => s.reset)

  useNotificationListener(Boolean(isSignedIn))

  useEffect(() => {
    if (!isSignedIn || !authUser?.id || !session || notificationsInitialized.current) return

    notificationsInitialized.current = true
    ;(async () => {
      const granted = await initializeNotifications()
      if (granted) {
        await registerPushTokenForUser(authUser.id)
      }
    })()
  }, [isSignedIn, authUser?.id, session])

  useEffect(() => {
    if (!isSignedIn) {
      notificationsInitialized.current = false
    }
  }, [isSignedIn])

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      if (user) {
        reset()
      }

      if (!isLoggingOut && !hasRedirected.current) {
        hasRedirected.current = true
        router.replace('/(auth)/login')
      }
      return
    }

    hasRedirected.current = false

    if (isLoggingOut) return

    if (isSignedIn && authUser?.id && session && !user) {
      const userName = (authUser.user_metadata?.firstName as string) || undefined
      initializeUserData(authUser.id, userName)
    }
  }, [isLoaded, isSignedIn, authUser?.id, isLoggingOut, session])

  if (!isLoaded) return <LoadingScreen message="Vérification de l'authentification..." />

  if (!isSignedIn) return <LoadingScreen message="Redirection..." />

  if (isLoading && !user) {
    return <LoadingScreen message="Chargement de vos données..." />
  }

  return (
    <View className="flex-1 bg-black">
      <ConnectionStatus />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  )
}
