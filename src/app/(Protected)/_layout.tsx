import React, { useEffect, useRef } from 'react'
import { Stack, useRouter } from 'expo-router'
import { useAuth, useUser } from '@clerk/clerk-expo'
import { View } from 'react-native'
import useAppStore from '@/store/useAppStore'
import ConnectionStatus from '@/components/ConnectionStatus'
import { LoadingScreen } from '@/components/LoadingSpinner'

export default function ProtectedLayout() {
  if (__DEV__) console.log('ProtectedLayout rendering...')
  const router = useRouter()
  const hasRedirected = useRef(false)

  // Vérification de la disponibilité des hooks Clerk
  let authData
  try {
    authData = useAuth()
  } catch (error) {
    if (__DEV__) console.error('Erreur useAuth:', error)
    return <LoadingScreen message="Initialisation de l'authentification..." />
  }

  const { isLoaded, isSignedIn } = authData
  const { user: clerkUser } = useUser()
  const user = useAppStore((s) => s.user)
  const isLoading = useAppStore((s) => s.isLoading)
  const isLoggingOut = useAppStore((s) => s.isLoggingOut)
  const initializeUserData = useAppStore((s) => s.initializeUserData)
  const reset = useAppStore((s) => s.reset)

  // Gérer les changements d'état de connexion
  useEffect(() => {
    if (__DEV__) console.log('ProtectedLayout useEffect - isLoaded:', isLoaded, 'isSignedIn:', isSignedIn, 'user:', user?.id, 'clerkUser:', clerkUser?.id, 'isLoggingOut:', isLoggingOut)

    if (!isLoaded) return

    // Si l'utilisateur n'est pas connecté
    if (!isSignedIn) {
      // Nettoyer le store si nécessaire
      if (user) {
        if (__DEV__) console.log('Utilisateur non connecté - reset du store')
        reset()
      }

      // Rediriger une seule fois
      if (!isLoggingOut && !hasRedirected.current) {
        if (__DEV__) console.log('Redirection vers login')
        hasRedirected.current = true
        router.replace('/(auth)/login')
      }
      return
    }

    // Réinitialiser le flag de redirection si l'utilisateur est connecté
    hasRedirected.current = false

    // Ne pas traiter si on est en train de se déconnecter
    if (isLoggingOut) return

    if (isSignedIn && clerkUser?.id && !user) {
      if (__DEV__) console.log('Initialisation des données pour:', clerkUser.id)
      initializeUserData(clerkUser.id)
    }
  }, [isLoaded, isSignedIn, clerkUser?.id, isLoggingOut])

  if (!isLoaded) return <LoadingScreen message="Vérification de l'authentification..." />

  // Si l'utilisateur n'est pas connecté, afficher un écran de chargement
  // pendant que la redirection se fait dans le useEffect
  if (!isSignedIn) return <LoadingScreen message="Redirection..." />
  
  // Afficher l'écran de chargement pendant l'initialisation des données
  if (isLoading && !user) {
    return <LoadingScreen message="Chargement de vos données..." />
  }
  
  return (
    <View className="flex-1 bg-black">
      {/* Status de connexion global */}
      <ConnectionStatus />
      
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  )
}

