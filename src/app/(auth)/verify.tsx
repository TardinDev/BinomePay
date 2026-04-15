import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useSignUp } from '@clerk/clerk-expo'

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>()
  const { signUp, setActive, isLoaded } = useSignUp()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)

  const handleVerify = async () => {
    if (!code.trim()) return
    try {
      setLoading(true)
      setError(null)
      if (!isLoaded) return
      const res = await signUp.attemptEmailAddressVerification({ code })
      if (res.status === 'complete') {
        await setActive({ session: res.createdSessionId })
        router.replace('/(Protected)/(tabs)')
      } else {
        setError('Code invalide ou expiré')
      }
    } catch (e: any) {
      setError(e?.message ?? 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-black px-5 pt-10">
      <Text className="mb-4 text-3xl font-extrabold text-white">Vérification email</Text>
      <Text className="mb-6 text-gray-400">Un code a été envoyé à {email ?? 'votre email'}.</Text>
      <View className="rounded-2xl border bg-neutral-900 p-5" style={{ borderColor: '#334155' }}>
        <Text className="mb-2 text-gray-300">Code</Text>
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
        <Pressable
          onPress={async () => {
            try {
              setResending(true)
              setError(null)
              if (!isLoaded) return
              await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
              Alert.alert('Renvoi', 'Nouveau code envoyé par email.')
            } catch (e: any) {
              setError(e?.message ?? 'Erreur lors du renvoi du code')
            } finally {
              setResending(false)
            }
          }}
          className="mt-4 items-center"
        >
          <Text className="text-gray-300 underline">
            {resending ? 'Renvoi…' : 'Renvoyer le code'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}
