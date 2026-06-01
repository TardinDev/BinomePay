import React, { useEffect } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Stack, router, usePathname } from 'expo-router'
import { useAuth } from '@/lib/auth'

function AuthSwitcher() {
  const pathname = usePathname()
  const onLogin = () => router.replace('/(auth)/login')
  const onRegister = () => router.replace('/(auth)/register')

  const isLogin = pathname?.endsWith('/login')

  return (
    <View className="flex-row items-center overflow-hidden rounded-full border border-gray-800 bg-neutral-900">
      <Pressable onPress={onLogin} className={`px-4 py-1.5 ${isLogin ? 'bg-yellow-400' : ''}`}>
        <Text
          className={`${isLogin ? 'font-extrabold text-black' : 'font-semibold text-zinc-200'}`}
        >
          Connexion
        </Text>
      </Pressable>
      <Pressable onPress={onRegister} className={`px-4 py-1.5 ${!isLogin ? 'bg-yellow-400' : ''}`}>
        <Text
          className={`${!isLogin ? 'font-extrabold text-black' : 'font-semibold text-zinc-200'}`}
        >
          Créer un compte
        </Text>
      </Pressable>
    </View>
  )
}

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/(Protected)/(tabs)')
    }
  }, [isLoaded, isSignedIn])

  if (!isLoaded) return null
  if (isSignedIn) return null
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#000000' },
        headerTintColor: '#FFFFFF',
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen name="login" options={{ headerTitle: () => <AuthSwitcher /> }} />
      <Stack.Screen name="register" options={{ headerTitle: () => <AuthSwitcher /> }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="terms" options={{ headerShown: false }} />
      <Stack.Screen
        name="verify"
        options={{ headerTitle: () => <Text className="font-bold text-white">Vérification</Text> }}
      />
    </Stack>
  )
}
