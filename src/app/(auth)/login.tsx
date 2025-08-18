import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, Alert, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useSignIn } from '@clerk/clerk-expo'

export default function LoginScreen() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const isValid = () => email.includes('@') && password.trim().length >= 6

  const handleLogin = async () => {
    if (!isValid()) {
      setError("Email ou mot de passe invalide.")
      return
    }
    try {
      setLoading(true)
      setError(null)
      if (!isLoaded) return
      const res = await signIn.create({ identifier: email, password })
      if (res.status === 'complete') {
        await setActive({ session: res.createdSessionId })
        router.replace('/(Protected)/(tabs)')
      } else {
        setError('Connexion incomplète')
      }
    } catch (e: any) {
      setError(e?.message ?? 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  

  return (
    <ScrollView className="flex-1 bg-black px-5 pt-10" contentContainerStyle={{ paddingBottom: 36 }}>
      <View className="items-center mb-6">
        <Text className="text-white text-5xl font-extrabold">Binome Pay</Text>
        <Text className="text-gray-400 mt-1">Connexion</Text>
      </View>

      <View className="bg-neutral-900 rounded-2xl p-5 border" style={{ borderColor: '#334155' }}>
        <Text className="text-gray-300 mb-2">Email</Text>
        <View className="flex-row items-center bg-black/30 rounded-xl border border-gray-700 px-4 py-3">
          <Ionicons name="mail-outline" color="#9CA3AF" size={18} />
          <TextInput
            placeholder="vous@exemple.com"
            placeholderTextColor="#6B7280"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            keyboardType="email-address"
            className="text-white ml-3 flex-1"
          />
        </View>

        <Text className="text-gray-300 mb-2 mt-4">Mot de passe</Text>
        <View className="flex-row items-center bg-black/30 rounded-xl border border-gray-700 px-4 py-3">
          <Ionicons name="lock-closed-outline" color="#9CA3AF" size={18} />
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#6B7280"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={() => {
              if (isValid() && !loading) {
                handleLogin()
              }
            }}
            className="text-white ml-3 flex-1"
          />
          <Pressable onPress={() => setShowPassword((v) => !v)} accessibilityLabel="Afficher/masquer le mot de passe">
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} color="#9CA3AF" size={18} />
          </Pressable>
        </View>

        {error && (
          <Text className="text-rose-400 mt-3" accessibilityLiveRegion="polite">{error}</Text>
        )}

        <Pressable
          onPress={handleLogin}
          disabled={loading || !isValid()}
          className="rounded-xl mt-6 items-center"
          style={{ backgroundColor: isValid() && !loading ? '#FDE68A' : '#6B7280', paddingVertical: 14 }}
        >
          <Text className="text-black font-extrabold text-base">{loading ? 'Connexion…' : 'Se connecter'}</Text>
        </Pressable>
      </View>

      <View className="items-center mt-5">
        <Pressable onPress={() => router.replace('/(auth)/register')}>
          <Text className="text-gray-300">
            Pas de compte ? <Text className="text-yellow-400 font-bold">Créer un compte</Text>
          </Text>
        </Pressable>
        <Pressable onPress={() => Alert.alert('Mot de passe', 'Réinitialisation à configurer dans Clerk (magic link).')} className="mt-3">
          <Text className="text-gray-300 underline">Mot de passe oublié ?</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}


