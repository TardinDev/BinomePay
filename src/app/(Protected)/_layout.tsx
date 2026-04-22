import { useEffect, useRef } from 'react'
import { Stack, useRouter } from 'expo-router'
import { useAuth, useUser, useSession } from '@clerk/clerk-expo'
import { View } from 'react-native'
import useAppStore from '@/store/useAppStore'
import ConnectionStatus from '@/components/ConnectionStatus'
import { LoadingScreen } from '@/components/LoadingSpinner'
import { setClerkTokenGetter } from '@/lib/supabase'
import { initializeNotifications } from '@/services/notificationService'
import { registerPushTokenForUser } from '@/services/pushTokenService'
import { useNotificationListener } from '@/hooks/useNotificationListener'

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

  // Listeners foreground + tap + cold start
  useNotificationListener(Boolean(isSignedIn))

  // Initialise canaux/permissions puis enregistre le token Expo Push dans Supabase.
  // Dépend de clerkUser.id (pour user_id) + session (pour que le JWT Supabase soit prêt
  // avant l'upsert dans push_tokens, sinon la policy RLS bloque l'insertion).
  useEffect(() => {
    if (!isSignedIn || !clerkUser?.id || !session || notificationsInitialized.current) return

    notificationsInitialized.current = true
    ;(async () => {
      const granted = await initializeNotifications()
      if (granted) {
        await registerPushTokenForUser(clerkUser.id)
      }
    })()
  }, [isSignedIn, clerkUser?.id, session])

  useEffect(() => {
    if (!isSignedIn) {
      notificationsInitialized.current = false
    }
  }, [isSignedIn])

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
