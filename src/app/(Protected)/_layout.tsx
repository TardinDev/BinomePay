import React from 'react'
import { Stack, Redirect } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function ProtectedLayout() {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return null
  if (!isSignedIn) return <Redirect href='/(auth)/login' />
  return <Stack screenOptions={{ headerShown: false }} />
}


