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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'email' | 'code'>('email')

  const handleSendCode = async () => {
    if (!email.includes('@')) {
      setError('Veuillez entrer un email valide.')
      return
    }
    try {
      setLoading(true)
      setError(null)

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: Linking.createURL('reset-password'),
      })

      if (resetError) {
        setError(resetError.message)
        return
      }

      setStep('code')
    } catch (e: any) {
      setError(e?.message ?? "Erreur lors de l'envoi du code.")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!code.trim()) {
      setError('Veuillez entrer le code reçu par email.')
      return
    }
    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    try {
      setLoading(true)
      setError(null)

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: 'recovery',
      })

      if (verifyError) {
        setError(
          verifyError.message.toLowerCase().includes('expired') ? 'Code expiré.' : 'Code invalide.'
        )
        return
      }

      if (!data.session) {
        setError('Vérification incomplète. Veuillez réessayer.')
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

      if (updateError) {
        if (
          updateError.message.toLowerCase().includes('weak') ||
          updateError.message.toLowerCase().includes('password')
        ) {
          setError('Mot de passe trop faible. Choisissez-en un plus sécurisé.')
        } else {
          setError(updateError.message)
        }
        return
      }

      router.replace('/(Protected)/(tabs)')
    } catch (e: any) {
      setError(e?.message ?? 'Erreur lors de la réinitialisation.')
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
        <View className="mb-6 flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 rounded-full p-2"
            style={{ backgroundColor: '#111827' }}
          >
            <Ionicons name="arrow-back" color="#E5E7EB" size={20} />
          </Pressable>
          <Text className="text-2xl font-extrabold text-white">Mot de passe oublié</Text>
        </View>

        {step === 'email' ? (
          <View
            className="rounded-2xl border bg-neutral-900 p-5"
            style={{ borderColor: '#334155' }}
          >
            <Text className="mb-4 text-gray-300">
              Entrez votre adresse email. Nous vous enverrons un code pour réinitialiser votre mot
              de passe.
            </Text>

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

            {error && (
              <Text className="mt-3 text-rose-400" accessibilityLiveRegion="polite">
                {error}
              </Text>
            )}

            <Pressable
              onPress={handleSendCode}
              disabled={loading || !email.includes('@')}
              className="mt-6 items-center rounded-xl"
              style={{
                backgroundColor: email.includes('@') && !loading ? '#FDE68A' : '#6B7280',
                paddingVertical: 14,
              }}
            >
              <Text className="text-base font-extrabold text-black">
                {loading ? 'Envoi...' : 'Envoyer le code'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View
            className="rounded-2xl border bg-neutral-900 p-5"
            style={{ borderColor: '#334155' }}
          >
            <Text className="mb-4 text-gray-300">
              Un code a été envoyé à {email}. Entrez-le ci-dessous avec votre nouveau mot de passe.
            </Text>

            <Text className="mb-2 text-gray-300">Code de vérification</Text>
            <View className="flex-row items-center rounded-xl border border-gray-700 bg-black/30 px-4 py-3">
              <Ionicons name="key-outline" color="#9CA3AF" size={18} />
              <TextInput
                placeholder="123456"
                placeholderTextColor="#6B7280"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                className="ml-3 flex-1 text-white"
              />
            </View>

            <Text className="mb-2 mt-4 text-gray-300">Nouveau mot de passe</Text>
            <View className="flex-row items-center rounded-xl border border-gray-700 bg-black/30 px-4 py-3">
              <Ionicons name="lock-closed-outline" color="#9CA3AF" size={18} />
              <TextInput
                placeholder="Min. 6 caractères"
                placeholderTextColor="#6B7280"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                className="ml-3 flex-1 text-white"
              />
              <Pressable onPress={() => setShowPassword((v) => !v)}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} color="#9CA3AF" size={18} />
              </Pressable>
            </View>

            <Text className="mb-2 mt-4 text-gray-300">Confirmer le mot de passe</Text>
            <View className="flex-row items-center rounded-xl border border-gray-700 bg-black/30 px-4 py-3">
              <Ionicons name="lock-closed-outline" color="#9CA3AF" size={18} />
              <TextInput
                placeholder="Confirmez votre mot de passe"
                placeholderTextColor="#6B7280"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                className="ml-3 flex-1 text-white"
              />
            </View>

            {error && (
              <Text className="mt-3 text-rose-400" accessibilityLiveRegion="polite">
                {error}
              </Text>
            )}

            <Pressable
              onPress={handleResetPassword}
              disabled={
                loading || !code || newPassword.length < 6 || newPassword !== confirmPassword
              }
              className="mt-6 items-center rounded-xl"
              style={{
                backgroundColor:
                  code && newPassword.length >= 6 && newPassword === confirmPassword && !loading
                    ? '#FDE68A'
                    : '#6B7280',
                paddingVertical: 14,
              }}
            >
              <Text className="text-base font-extrabold text-black">
                {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setStep('email')
                setError(null)
                setCode('')
              }}
              className="mt-4 items-center"
            >
              <Text className="text-gray-300 underline">Renvoyer le code</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
