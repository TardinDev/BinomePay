import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)

  const isValid = () => email.includes('@') && password.trim().length >= 6 && password === confirm && accepted

  const handleRegister = async () => {
    if (!isValid()) {
      setError("Vérifiez vos informations (email valide, 6 caractères minimum, mots de passe identiques).")
      return
    }
    try {
      setLoading(true)
      setError(null)
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { terms_accepted_at: new Date().toISOString() },
        },
      })
      if (signUpError) {
        setError(signUpError.message)
        return
      }
      // Selon la configuration Supabase, un email de confirmation peut être requis
      router.replace('/(auth)/login')
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
        <Text className="text-gray-400 mt-1">Créer un compte</Text>
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
            secureTextEntry
            className="text-white ml-3 flex-1"
          />
        </View>

        <Text className="text-gray-300 mb-2 mt-4">Confirmer le mot de passe</Text>
        <View className="flex-row items-center bg-black/30 rounded-xl border border-gray-700 px-4 py-3">
          <Ionicons name="lock-closed-outline" color="#9CA3AF" size={18} />
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#6B7280"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            className="text-white ml-3 flex-1"
          />
        </View>

        {error && (
          <Text className="text-rose-400 mt-3" accessibilityLiveRegion="polite">{error}</Text>
        )}

        <View className="flex-row items-start mt-4">
          <Pressable onPress={() => setAccepted((v) => !v)} className="mr-2 mt-0.5">
            <Ionicons name={accepted ? 'checkbox' : 'square-outline'} size={20} color={accepted ? '#EAB308' : '#9CA3AF'} />
          </Pressable>
          <Text className="text-gray-300 flex-1">
            J’accepte les <Text onPress={() => router.push('/(auth)/terms')} className="text-yellow-400 underline">conditions d’utilisation</Text> et la politique de confidentialité.
          </Text>
        </View>

        <Pressable
          onPress={handleRegister}
          disabled={loading || !isValid()}
          className="rounded-xl mt-6 items-center"
          style={{ backgroundColor: isValid() && !loading ? '#FDE68A' : '#6B7280', paddingVertical: 14 }}
        >
          <Text className="text-black font-extrabold text-base">{loading ? 'Création…' : 'Créer le compte'}</Text>
        </Pressable>
      </View>

      <View className="items-center mt-5">
        <Pressable onPress={() => router.replace('/(auth)/login')}>
          <Text className="text-gray-300">
            Déjà inscrit ? <Text className="text-yellow-400 font-bold">Se connecter</Text>
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}


