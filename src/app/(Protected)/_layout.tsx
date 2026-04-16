import { useEffect, useRef } from 'react'
import { Stack, useRouter } from 'expo-router'
import { useAuth, useUser, useSession } from '@clerk/clerk-expo'
import { View } from 'react-native'
import * as Notifications from 'expo-notifications'
import useAppStore from '@/store/useAppStore'
import ConnectionStatus from '@/components/ConnectionStatus'
import { LoadingScreen } from '@/components/LoadingSpinner'
import { setClerkTokenGetter } from '@/lib/supabase'
import { initializeNotifications, handleNotificationResponse } from '@/services/notificationService'

export default function ProtectedLayout() {
  const router = useRouter()
  const hasRedirected = useRef(false)
  const notificationsInitialized = useRef(false)

  const { isLoaded, isSignedIn } = useAuth()
  const { user: clerkUser } = useUser()
  const { session } = useSession()
  const user = useAppStore((s) => s.user)
  const isLoading = useAppStore((s) => s.isLoading)
  const isLoggingOut = useAppStore((s) => s.isLoggingOut)
  const initializeUserData = useAppStore((s) => s.initializeUserData)
  const reset = useAppStore((s) => s.reset)

  // Connecter le token Clerk à Supabase pour l'auth third-party
  useEffect(() => {
    if (session) {
      setClerkTokenGetter(() => session.getToken({ template: 'supabase' }))
    } else {
      setClerkTokenGetter(null)
    }
    return () => setClerkTokenGetter(null)
  }, [session])

  // Initialiser les notifications push et configurer les listeners
  useEffect(() => {
    if (!isSignedIn || notificationsInitialized.current) return

    notificationsInitialized.current = true
    initializeNotifications()

    // Listener quand l'utilisateur tape sur une notification
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        handleNotificationResponse(response, router)
      }
    )

    return () => {
      responseSubscription.remove()
      notificationsInitialized.current = false
    }
  }, [isSignedIn, router])

  // Initialiser les données utilisateur APRÈS que la session Clerk est disponible
  // La session doit être prête pour que le token getter Supabase fonctionne
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

    // Attendre que la session soit disponible avant d'appeler Supabase
    if (isSignedIn && clerkUser?.id && session && !user) {
      const userName = clerkUser.firstName || clerkUser.username || undefined
      initializeUserData(clerkUser.id, userName)
    }
  }, [isLoaded, isSignedIn, clerkUser?.id, isLoggingOut, session])

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
