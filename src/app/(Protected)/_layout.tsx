import React, { useEffect } from 'react'
import { Stack, Redirect } from 'expo-router'
import { useAuth, useUser } from '@clerk/clerk-expo'
import { View } from 'react-native'
import useAppStore from '@/store/useAppStore'
import ConnectionStatus from '@/components/ConnectionStatus'
import { LoadingScreen } from '@/components/LoadingSpinner'

export default function ProtectedLayout() {
  console.log('ProtectedLayout rendering...')
  
  const { isLoaded, isSignedIn } = useAuth()
  const { user: clerkUser } = useUser()
  const user = useAppStore((s) => s.user)
  const isLoading = useAppStore((s) => s.isLoading)
  const initializeUserData = useAppStore((s) => s.initializeUserData)
  
  // Initialiser les données utilisateur dès la connexion
  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser?.id && !user) {
      console.log('Initialisation des données pour:', clerkUser.id)
      initializeUserData(clerkUser.id)
    }
  }, [isLoaded, isSignedIn, clerkUser?.id, user, initializeUserData])
  
  if (!isLoaded) return <LoadingScreen message="Vérification de l'authentification..." />
  if (!isSignedIn) return <Redirect href='/index' />
  
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


