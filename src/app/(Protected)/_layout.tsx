import { useEffect, useRef } from 'react'
import { Stack, useRouter } from 'expo-router'
import { useAuth, useUser } from '@clerk/clerk-expo'
import { View } from 'react-native'
import useAppStore from '@/store/useAppStore'
import ConnectionStatus from '@/components/ConnectionStatus'
import { LoadingScreen } from '@/components/LoadingSpinner'

export default function ProtectedLayout() {
  const router = useRouter()
  const hasRedirected = useRef(false)

  const { isLoaded, isSignedIn } = useAuth()
  const { user: clerkUser } = useUser()
  const user = useAppStore((s) => s.user)
  const isLoading = useAppStore((s) => s.isLoading)
  const isLoggingOut = useAppStore((s) => s.isLoggingOut)
  const initializeUserData = useAppStore((s) => s.initializeUserData)
  const reset = useAppStore((s) => s.reset)

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

    if (isSignedIn && clerkUser?.id && !user) {
      initializeUserData(clerkUser.id)
    }
  }, [isLoaded, isSignedIn, clerkUser?.id, isLoggingOut])

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
