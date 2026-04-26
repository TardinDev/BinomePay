import React, { useState } from 'react'
import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function EditProfileScreen() {
  const { user: authUser, isLoaded } = useAuth()
  const [firstName, setFirstName] = useState((authUser?.user_metadata?.firstName as string) ?? '')
  const [lastName, setLastName] = useState((authUser?.user_metadata?.lastName as string) ?? '')
  const [saving, setSaving] = useState(false)

  const primaryEmail = authUser?.email ?? '—'

  const handleSave = async () => {
    if (!authUser) return
    const trimmedFirst = firstName.trim()
    if (trimmedFirst.length < 2) {
      Alert.alert('Nom invalide', 'Le prénom doit contenir au moins 2 caractères.')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          ...authUser.user_metadata,
          firstName: trimmedFirst,
          lastName: lastName.trim(),
        },
      })
      if (error) throw error

      Alert.alert('Enregistré', 'Vos informations ont été mises à jour.', [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Mise à jour impossible'
      Alert.alert('Erreur', msg)
    } finally {
      setSaving(false)
    }
  }

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#EAB308" />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#000' }}
    >
      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="mb-6 flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 rounded-full p-2"
            style={{ backgroundColor: '#111827' }}
          >
            <Ionicons name="arrow-back" color="#E5E7EB" size={20} />
          </Pressable>
          <Text className="text-2xl font-extrabold text-white">Modifier le profil</Text>
        </View>

        <View
          className="mb-4 rounded-2xl border bg-neutral-900 p-5"
          style={{ borderColor: '#334155' }}
        >
          <Text className="mb-1 text-xs text-gray-400">Prénom</Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Votre prénom"
            placeholderTextColor="#6B7280"
            autoCapitalize="words"
            className="mb-4 rounded-xl px-3 py-3 text-white"
            style={{ backgroundColor: '#0B1220', borderWidth: 1, borderColor: '#1F2937' }}
          />

          <Text className="mb-1 text-xs text-gray-400">Nom</Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Votre nom"
            placeholderTextColor="#6B7280"
            autoCapitalize="words"
            className="mb-4 rounded-xl px-3 py-3 text-white"
            style={{ backgroundColor: '#0B1220', borderWidth: 1, borderColor: '#1F2937' }}
          />

          <Text className="mb-1 text-xs text-gray-400">Email</Text>
          <View
            className="rounded-xl px-3 py-3"
            style={{ backgroundColor: '#0B1220', borderWidth: 1, borderColor: '#1F2937' }}
          >
            <Text className="text-gray-300">{primaryEmail}</Text>
          </View>
          <Text className="mt-2 text-xs text-gray-500">
            L'email ne peut pas être modifié depuis l'application.
          </Text>
        </View>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          className="items-center rounded-xl"
          style={{ backgroundColor: saving ? '#6B7280' : '#EAB308', paddingVertical: 14 }}
        >
          {saving ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text className="font-extrabold text-black">Enregistrer</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
