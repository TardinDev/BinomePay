import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import * as Linking from 'expo-linking'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/Logo'

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const isValid = () =>
    firstName.trim().length > 0 &&
    email.includes('@') &&
    password.trim().length >= 6 &&
    password === confirm &&
    accepted

  const handleRegister = async () => {
    if (!isValid()) {
      setError(
        'Vérifiez vos informations (prénom requis, email valide, 6 caractères minimum, mots de passe identiques).'
      )
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            firstName: firstName.trim(),
          },
          emailRedirectTo: Linking.createURL('auth-callback'),
        },
      })

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes('already registered')) {
          setError('Cet email est déjà utilisé')
        } else if (signUpError.message.toLowerCase().includes('password')) {
          setError(signUpError.message)
        } else {
          setError(signUpError.message)
        }
        return
      }

      // Si "Confirm email" est activé dans Supabase, data.session est null
      // et l'user reçoit un email avec un OTP code → écran de vérification
      if (data.session) {
        router.replace('/(Protected)/(tabs)')
      } else if (data.user) {
        router.replace({ pathname: '/(auth)/verify', params: { email: email.trim() } })
      } else {
        setError('Inscription incomplète. Veuillez réessayer.')
      }
    } catch (e: any) {
      setError(e?.message ?? "Erreur lors de l'inscription. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#000' }}
    >
      <ScrollView
        className="flex-1 bg-black px-5 pt-10"
        contentContainerStyle={{ paddingBottom: 36 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-6 items-center">
          <Logo size={88} showWordmark wordmarkSize={32} tagline="Créer un compte" />
        </View>

        <View className="rounded-2xl border bg-neutral-900 p-5" style={{ borderColor: '#334155' }}>
          <Text className="mb-2 text-gray-300">Prénom</Text>
          <View className="flex-row items-center rounded-xl border border-gray-700 bg-black/30 px-4 py-3">
            <Ionicons name="person-outline" color="#9CA3AF" size={18} />
            <TextInput
              placeholder="Ex: Jean"
              placeholderTextColor="#6B7280"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              className="ml-3 flex-1 text-white"
            />
          </View>

          <Text className="mb-2 mt-4 text-gray-300">Email</Text>
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
              autoComplete="new-password"
              textContentType="newPassword"
              className="ml-3 flex-1 text-white"
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              accessibilityLabel="Afficher/masquer le mot de passe"
            >
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} color="#9CA3AF" size={18} />
            </Pressable>
          </View>

          <Text className="mb-2 mt-4 text-gray-300">Confirmer le mot de passe</Text>
          <View className="flex-row items-center rounded-xl border border-gray-700 bg-black/30 px-4 py-3">
            <Ionicons name="lock-closed-outline" color="#9CA3AF" size={18} />
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#6B7280"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={() => {}}
              className="ml-3 flex-1 text-white"
            />
            <Pressable
              onPress={() => setShowConfirm((v) => !v)}
              accessibilityLabel="Afficher/masquer la confirmation"
            >
              <Ionicons name={showConfirm ? 'eye-off' : 'eye'} color="#9CA3AF" size={18} />
            </Pressable>
          </View>

          {error && (
            <Text className="mt-3 text-rose-400" accessibilityLiveRegion="polite">
              {error}
            </Text>
          )}

          <View className="mt-4 flex-row items-start">
            <Pressable onPress={() => setAccepted((v) => !v)} className="mr-2 mt-0.5">
              <Ionicons
                name={accepted ? 'checkbox' : 'square-outline'}
                size={20}
                color={accepted ? '#EAB308' : '#9CA3AF'}
              />
            </Pressable>
            <Text className="flex-1 text-gray-300">
              J’accepte les{' '}
              <Text
                onPress={() => router.push('/(auth)/terms')}
                className="text-yellow-400 underline"
              >
                conditions d’utilisation
              </Text>{' '}
              et la politique de confidentialité.
            </Text>
          </View>

          <Pressable
            onPress={handleRegister}
            disabled={loading || !isValid()}
            className="mt-6 items-center rounded-xl"
            style={{
              backgroundColor: isValid() && !loading ? '#FDE68A' : '#6B7280',
              paddingVertical: 14,
            }}
          >
            <Text className="text-base font-extrabold text-black">
              {loading ? 'Création…' : 'Créer le compte'}
            </Text>
          </Pressable>
        </View>

        <View className="mt-5 items-center">
          <Pressable onPress={() => router.replace('/(auth)/login')}>
            <Text className="text-gray-300">
              Déjà inscrit ? <Text className="font-bold text-yellow-400">Se connecter</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
