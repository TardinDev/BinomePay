import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/Logo'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const isValid = () => email.includes('@') && password.trim().length >= 6

  const handleLogin = async () => {
    if (!isValid()) {
      setError('Email ou mot de passe invalide.')
      return
    }
    try {
      setLoading(true)
      setError(null)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        if (signInError.message.toLowerCase().includes('invalid login')) {
          setError('Email ou mot de passe incorrect.')
        } else if (signInError.message.toLowerCase().includes('email not confirmed')) {
          setError('Email non vérifié. Vérifiez votre boîte mail.')
        } else {
          setError(signInError.message)
        }
        return
      }

      if (data.session) {
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
    <ScrollView
      className="flex-1 bg-black px-5 pt-10"
      contentContainerStyle={{ paddingBottom: 36 }}
    >
      <View className="mb-6 items-center">
        <Logo size={88} showWordmark wordmarkSize={32} tagline="Connexion" />
      </View>

      <View className="rounded-2xl border bg-neutral-900 p-5" style={{ borderColor: '#334155' }}>
        <Text className="mb-2 text-gray-300">Email</Text>
        <View className="flex-row items-center rounded-xl border border-gray-700 bg-black/30 px-4 py-3">
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
            className="ml-3 flex-1 text-white"
          />
        </View>

        <Text className="mb-2 mt-4 text-gray-300">Mot de passe</Text>
        <View className="flex-row items-center rounded-xl border border-gray-700 bg-black/30 px-4 py-3">
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
            className="ml-3 flex-1 text-white"
          />
          <Pressable
            onPress={() => setShowPassword((v) => !v)}
            accessibilityLabel="Afficher/masquer le mot de passe"
          >
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} color="#9CA3AF" size={18} />
          </Pressable>
        </View>

        {error && (
          <Text className="mt-3 text-rose-400" accessibilityLiveRegion="polite">
            {error}
          </Text>
        )}

        <Pressable
          onPress={handleLogin}
          disabled={loading || !isValid()}
          className="mt-6 items-center rounded-xl"
          style={{
            backgroundColor: isValid() && !loading ? '#FDE68A' : '#6B7280',
            paddingVertical: 14,
          }}
        >
          <Text className="text-base font-extrabold text-black">
            {loading ? 'Connexion…' : 'Se connecter'}
          </Text>
        </Pressable>
      </View>

      <View className="mt-5 items-center">
        <Pressable onPress={() => router.replace('/(auth)/register')}>
          <Text className="text-gray-300">
            Pas de compte ? <Text className="font-bold text-yellow-400">Créer un compte</Text>
          </Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(auth)/forgot-password')} className="mt-3">
          <Text className="text-gray-300 underline">Mot de passe oublié ?</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}
