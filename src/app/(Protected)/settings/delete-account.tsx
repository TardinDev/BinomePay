import React, { useState } from 'react'
import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useUser, useAuth } from '@clerk/clerk-expo'
import useAppStore from '@/store/useAppStore'
import { supabase } from '@/lib/supabase'

const CONFIRM_PHRASE = 'SUPPRIMER'

export default function DeleteAccountScreen() {
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut } = useAuth()
  const setLoggingOut = useAppStore((s) => s.setLoggingOut)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  const canDelete = confirmText.trim().toUpperCase() === CONFIRM_PHRASE

  const handleDelete = async () => {
    if (!clerkUser || !canDelete) return

    Alert.alert(
      'Confirmation finale',
      'Cette action est irréversible. Toutes vos données seront supprimées définitivement. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true)
            setLoggingOut(true)
            try {
              const userId = clerkUser.id

              // 1. Supprimer les données Supabase (RLS permet l'effacement par le propriétaire)
              // On supprime en cascade logique : push_tokens -> intents -> user
              try {
                await supabase.from('push_tokens').delete().eq('user_id', userId)
              } catch (e) {
                if (__DEV__) console.warn('delete push_tokens', e)
              }
              try {
                await supabase.from('intents').delete().eq('user_id', userId)
              } catch (e) {
                if (__DEV__) console.warn('delete intents', e)
              }
              try {
                await supabase.from('users').delete().eq('clerk_id', userId)
              } catch (e) {
                if (__DEV__) console.warn('delete user row', e)
              }

              // 2. Supprimer le compte Clerk (déclenche aussi la déconnexion)
              await clerkUser.delete()

              // 3. Sign out de sécurité si signature Clerk persiste
              try {
                await signOut()
              } catch (e) {
                if (__DEV__) console.warn('signOut après delete', e)
              }

              // Redirection auto par ProtectedLayout
            } catch (e) {
              setDeleting(false)
              setLoggingOut(false)
              const msg = e instanceof Error ? e.message : 'Suppression impossible. Réessayez.'
              Alert.alert('Erreur', msg)
            }
          },
        },
      ]
    )
  }

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#EAB308" />
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-black px-5 pt-6" contentContainerStyle={{ paddingBottom: 60 }}>
      <View className="mb-6 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="mr-3 rounded-full p-2"
          style={{ backgroundColor: '#111827' }}
        >
          <Ionicons name="arrow-back" color="#E5E7EB" size={20} />
        </Pressable>
        <Text className="text-2xl font-extrabold text-white">Supprimer le compte</Text>
      </View>

      <View
        className="mb-4 rounded-2xl border p-5"
        style={{ borderColor: '#7F1D1D', backgroundColor: '#1F0A0A' }}
      >
        <View className="mb-3 flex-row items-center">
          <Ionicons name="warning" color="#EF4444" size={22} />
          <Text className="ml-2 text-lg font-extrabold text-red-400">Action irréversible</Text>
        </View>
        <Text className="mb-2 text-gray-200">La suppression de votre compte entraîne :</Text>
        <Text className="mb-1 text-gray-300">• Effacement de votre profil et de votre photo</Text>
        <Text className="mb-1 text-gray-300">• Suppression de toutes vos intentions d'échange</Text>
        <Text className="mb-1 text-gray-300">• Perte de votre historique et de vos notes</Text>
        <Text className="mb-1 text-gray-300">• Fermeture de vos conversations</Text>
        <Text className="text-gray-300">• Déconnexion immédiate et définitive</Text>
      </View>

      <View
        className="mb-4 rounded-2xl border bg-neutral-900 p-5"
        style={{ borderColor: '#334155' }}
      >
        <Text className="mb-3 text-gray-300">
          Pour confirmer, tapez{' '}
          <Text className="font-extrabold text-red-400">{CONFIRM_PHRASE}</Text> ci-dessous :
        </Text>
        <TextInput
          value={confirmText}
          onChangeText={setConfirmText}
          placeholder={CONFIRM_PHRASE}
          placeholderTextColor="#6B7280"
          autoCapitalize="characters"
          autoCorrect={false}
          className="rounded-xl px-3 py-3 text-white"
          style={{ backgroundColor: '#0B1220', borderWidth: 1, borderColor: '#1F2937' }}
        />
      </View>

      <Pressable
        onPress={handleDelete}
        disabled={!canDelete || deleting}
        className="items-center rounded-xl"
        style={{
          backgroundColor: canDelete && !deleting ? '#EF4444' : '#6B7280',
          paddingVertical: 14,
        }}
      >
        {deleting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text className="font-extrabold text-white">Supprimer définitivement mon compte</Text>
        )}
      </Pressable>

      <Text className="mt-4 text-center text-xs text-gray-500">
        Si vous avez des questions, contactez support@binomepay.com avant la suppression.
      </Text>
    </ScrollView>
  )
}
