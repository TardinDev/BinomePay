import React, { useState } from 'react'
import {
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)

  const handleVerify = async () => {
    if (!code.trim() || !email) return
    try {
      setLoading(true)
      setError(null)

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code.trim(),
        type: 'signup',
      })

      if (verifyError) {
        setError(
          verifyError.message.toLowerCase().includes('expired') ? 'Code expiré' : 'Code invalide'
        )
        return
      }

      if (data.session) {
        router.replace('/(Protected)/(tabs)')
      } else {
        setError('Vérification incomplète')
      }
    } catch (e: any) {
      setError(e?.message ?? 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) return
    try {
      setResending(true)
      setError(null)

      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (resendError) {
        setError(resendError.message)
        return
      }

      Alert.alert('Renvoi', 'Nouveau code envoyé par email.')
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors du renvoi du code')
    } finally {
      setResending(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#000' }}
    >
      <ScrollView className="flex-1 bg-black px-5 pt-10" keyboardShouldPersistTaps="handled">
        <Text className="mb-4 text-3xl font-extrabold text-white">Vérification email</Text>
        <Text className="mb-6 text-gray-400">Un code a été envoyé à {email ?? 'votre email'}.</Text>
        <Pressable onPress={handleResend} disabled={resending} className="mt-4 items-center">
          <Text className="text-gray-300 underline">
            {resending ? 'Renvoi…' : 'Renvoyer le code'}
          </Text>
        </Pressable>
        <Text className="mb-2 mt-6 text-gray-300">Code</Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="123456"
          placeholderTextColor="#6B7280"
          keyboardType="number-pad"
          className="rounded-xl border border-gray-700 bg-black/30 px-4 py-3 text-white"
        />
        {error && <Text className="mt-3 text-rose-400">{error}</Text>}
        <Pressable
          onPress={handleVerify}
          disabled={loading || !code}
          className="mt-6 items-center rounded-xl"
          style={{ backgroundColor: code && !loading ? '#FDE68A' : '#6B7280', paddingVertical: 14 }}
        >
          <Text className="text-base font-extrabold text-black">
            {loading ? 'Vérification…' : 'Vérifier'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
