import React from 'react'
import { Redirect } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function RootIndex() {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return null
  if (isSignedIn) return <Redirect href='/(Protected)/(tabs)' />
  return <Redirect href='/(auth)/login' />
}


