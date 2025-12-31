import React from 'react'
import { Redirect } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { View, Text } from 'react-native'

export default function RootIndex() {
  if (__DEV__) console.log('RootIndex rendering...')
  
  const { isLoaded, isSignedIn } = useAuth()
  
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
        <Text style={{ color: 'white' }}>Loading...</Text>
      </View>
    )
  }
  
  if (isSignedIn) {
    return <Redirect href='/(Protected)/(tabs)' />
  }
  
  return <Redirect href='/(auth)/login' />
}


