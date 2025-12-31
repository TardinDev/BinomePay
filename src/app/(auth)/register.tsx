import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useSignUp } from '@clerk/clerk-expo'

export default function RegisterScreen() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Log when component mounts
  React.useEffect(() => {
    if (__DEV__) console.log('[Register] Component mounted, isLoaded:', isLoaded, 'signUp:', !!signUp)
  }, [isLoaded, signUp])

  const isValid = () => firstName.trim().length > 0 && email.includes('@') && password.trim().length >= 6 && password === confirm && accepted

  const handleRegister = async () => {
    if (!isValid()) {
      setError('Vérifiez vos informations (prénom requis, email valide, 6 caractères minimum, mots de passe identiques).')
      return
    }

    if (__DEV__) console.log('[Register] Starting registration process...')

    try {
      setLoading(true)
      setError(null)

      if (!isLoaded) {
        if (__DEV__) console.log('[Register] Clerk not loaded yet')
        setError('Authentification en cours de chargement...')
        return
      }

      if (!signUp) {
        if (__DEV__) console.error('[Register] signUp object is null')
        setError('Service d\'inscription non disponible')
        return
      }

      if (__DEV__) console.log('[Register] Creating account for:', email)

      // Create the account with email and password only
      const res = await signUp.create({
        emailAddress: email,
        password
      })

      // Update the user's first name after creation
      if (res && firstName.trim()) {
        try {
          await signUp.update({
            firstName: firstName.trim()
          })
        } catch (updateError) {
          if (__DEV__) console.log('[Register] Could not update firstName, continuing anyway')
        }
      }

      if (__DEV__) console.log('[Register] Sign up response:', res.status)

      if (res.status === 'complete') {
        if (__DEV__) console.log('[Register] Registration complete, activating session')
        await setActive({ session: res.createdSessionId })
        router.replace('/(Protected)/(tabs)')
      } else if (res.status === 'missing_requirements') {
        if (__DEV__) console.log('[Register] Email verification required')
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
        router.replace({ pathname: '/(auth)/verify', params: { email } })
      } else {
        if (__DEV__) console.log('[Register] Unexpected status:', res.status)
        setError('Statut inattendu. Veuillez réessayer.')
      }
    } catch (e: unknown) {
      const error = e as { message?: string; errors?: Array<{ code?: string; message?: string }>; clerkError?: boolean; status?: number }
      if (__DEV__) {
        console.error('[Register] Registration error:', e)
        console.error('[Register] Error details:', {
          message: error?.message,
          errors: error?.errors,
          clerkError: error?.clerkError,
          status: error?.status,
        })
      }

      // Handle specific Clerk errors
      if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
        const clerkError = error.errors[0]
        if (clerkError.code === 'form_identifier_exists') {
          setError('Cet email est déjà utilisé')
        } else if (clerkError.code === 'form_password_pwned') {
          setError('Ce mot de passe est trop commun. Choisissez-en un plus sécurisé.')
        } else if (clerkError.code === 'form_password_length_too_short') {
          setError('Le mot de passe doit contenir au moins 8 caractères')
        } else {
          setError(clerkError.message || 'Erreur lors de l\'inscription')
        }
      } else {
        setError(error?.message ?? 'Erreur lors de l\'inscription. Veuillez réessayer.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-white">Chargement...</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-black px-5 pt-10" contentContainerStyle={{ paddingBottom: 36 }}>
      <View className="items-center mb-6">
        <Text className="text-white text-5xl font-extrabold">Binome Pay</Text>
        <Text className="text-gray-400 mt-1">Créer un compte</Text>
      </View>

      <View className="bg-neutral-900 rounded-2xl p-5 border" style={{ borderColor: '#334155' }}>
        <Text className="text-gray-300 mb-2">Prénom</Text>
        <View className="flex-row items-center bg-black/30 rounded-xl border border-gray-700 px-4 py-3">
          <Ionicons name="person-outline" color="#9CA3AF" size={18} />
          <TextInput
            placeholder="Ex: Jean"
            placeholderTextColor="#6B7280"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            className="text-white ml-3 flex-1"
          />
        </View>

        <Text className="text-gray-300 mb-2 mt-4">Email</Text>
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
            autoComplete="new-password"
            textContentType="newPassword"
            className="text-white ml-3 flex-1"
          />
          <Pressable onPress={() => setShowPassword((v) => !v)} accessibilityLabel="Afficher/masquer le mot de passe">
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} color="#9CA3AF" size={18} />
          </Pressable>
        </View>

        <Text className="text-gray-300 mb-2 mt-4">Confirmer le mot de passe</Text>
        <View className="flex-row items-center bg-black/30 rounded-xl border border-gray-700 px-4 py-3">
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
            className="text-white ml-3 flex-1"
          />
          <Pressable onPress={() => setShowConfirm((v) => !v)} accessibilityLabel="Afficher/masquer la confirmation">
            <Ionicons name={showConfirm ? 'eye-off' : 'eye'} color="#9CA3AF" size={18} />
          </Pressable>
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


