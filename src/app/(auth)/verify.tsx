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
      <Text className="text-white text-3xl font-extrabold mb-4">Vérification email</Text>
      <Text className="text-gray-400 mb-6">Un code a été envoyé à {email ?? 'votre email'}.</Text>
      <View className="bg-neutral-900 rounded-2xl p-5 border" style={{ borderColor: '#334155' }}>
        <Text className="text-gray-300 mb-2">Code</Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="123456"
          placeholderTextColor="#6B7280"
          keyboardType="number-pad"
          className="text-white bg-black/30 rounded-xl border border-gray-700 px-4 py-3"
        />
        {error && <Text className="text-rose-400 mt-3">{error}</Text>}
        <Pressable onPress={handleVerify} disabled={loading || !code} className="rounded-xl mt-6 items-center" style={{ backgroundColor: code && !loading ? '#FDE68A' : '#6B7280', paddingVertical: 14 }}>
          <Text className="text-black font-extrabold text-base">{loading ? 'Vérification…' : 'Vérifier'}</Text>
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
          <Text className="text-gray-300 underline">{resending ? 'Renvoi…' : 'Renvoyer le code'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}


