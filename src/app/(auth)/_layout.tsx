import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Stack, router, usePathname } from 'expo-router'

function AuthSwitcher() {
  const pathname = usePathname()
  const onLogin = () => router.replace('/(auth)/login')
  const onRegister = () => router.replace('/(auth)/register')

  const isLogin = pathname?.endsWith('/login')

  return (
    <View className="flex-row items-center bg-neutral-900 border border-gray-800 rounded-full overflow-hidden">
      <Pressable
        onPress={onLogin}
        className={`px-4 py-1.5 ${isLogin ? 'bg-yellow-400' : ''}`}
      >
        <Text className={`${isLogin ? 'text-black font-extrabold' : 'text-zinc-200 font-semibold'}`}>Connexion</Text>
      </Pressable>
      <Pressable
        onPress={onRegister}
        className={`px-4 py-1.5 ${!isLogin ? 'bg-yellow-400' : ''}`}
      >
        <Text className={`${!isLogin ? 'text-black font-extrabold' : 'text-zinc-200 font-semibold'}`}>Créer un compte</Text>
      </Pressable>
    </View>
  )
}

export default function AuthLayout() {
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
    </Stack>
  )
}


