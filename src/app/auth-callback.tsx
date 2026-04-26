import React, { useEffect } from 'react'
import { View, ActivityIndicator, Text } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useAuth } from '@/lib/auth'

// Ce composant gère les callbacks d'authentification (deep link / magic link).
export default function AuthCallback() {
  const params = useLocalSearchParams<{ code?: string; state?: string; error?: string }>()
  const { isLoaded, isSignedIn } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Si on a une erreur OAuth, rediriger vers login
        if (params.error) {
          if (__DEV__) console.warn('Erreur OAuth:', params.error)
          router.replace('/(auth)/login')
          return
        }

        // Si l'utilisateur est déjà connecté, rediriger vers l'app
        if (isLoaded && isSignedIn) {
          router.replace('/(Protected)/(tabs)')
          return
        }

        // Sinon, rediriger vers login après un court délai
        setTimeout(() => {
          router.replace('/(auth)/login')
        }, 2000)
      } catch (error) {
        if (__DEV__) console.error('Erreur callback auth:', error)
        router.replace('/(auth)/login')
      }
    }

    handleCallback()
  }, [params, isLoaded, isSignedIn])

  return (
    <View className="flex-1 items-center justify-center bg-black">
      <ActivityIndicator color="#FDE68A" size="large" />
      <Text className="mt-4 text-white">Finalisation de la connexion...</Text>
    </View>
  )
}
