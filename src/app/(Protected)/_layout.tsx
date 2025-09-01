import React from 'react'
import { Stack, Redirect } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function ProtectedLayout() {
  console.log('ProtectedLayout rendering...')
  
  const { isLoaded, isSignedIn } = useAuth()
  
  if (!isLoaded) return null
  if (!isSignedIn) return <Redirect href='/index' />
  
  return <Stack screenOptions={{ headerShown: false }} />
}


