import React, { useState } from 'react'
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Switch,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'
import { useBiometricAuth, getBiometricLabel, getBiometricIcon } from '@/hooks/useBiometricAuth'
import { supabase } from '@/lib/supabase'
import { logger } from '@/utils/logger'

type IconName = ComponentProps<typeof Ionicons>['name']

export default function SecuritySettings() {
  const { isAvailable, isEnabled, biometricType, enableBiometric, disableBiometric } =
    useBiometricAuth()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleToggleBiometric = async (next: boolean) => {
    try {
      if (next) {
        await enableBiometric()
      } else {
        await disableBiometric()
      }
    } catch (e) {
      logger.error('toggle biometric', e)
      Alert.alert('Erreur', 'Impossible de modifier le verrouillage biométrique.')
    }
  }

  const handleChangePassword = async () => {
    if (password.length < 8) {
      Alert.alert('Mot de passe trop court', 'Utilisez au moins 8 caractères.')
      return
    }
    if (password !== confirm) {
      Alert.alert('Les mots de passe ne correspondent pas', 'Vérifiez votre saisie.')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setPassword('')
      setConfirm('')
      Alert.alert('Mot de passe modifié', 'Votre nouveau mot de passe est actif.')
    } catch (e) {
      logger.error('change password', e)
      const msg = e instanceof Error ? e.message : 'Réessayez plus tard.'
      Alert.alert('Erreur', msg)
    } finally {
      setSaving(false)
    }
  }

  const biometricIcon = getBiometricIcon(biometricType) as IconName

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#000' }}
    >
      <ScrollView
        className="flex-1 bg-black px-5 pt-6"
        contentContainerStyle={{ paddingBottom: 60 }}
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
          <Text className="text-2xl font-extrabold text-white">Sécurité</Text>
        </View>

        {/* Verrouillage biométrique */}
        <Text className="mb-2 ml-1 text-xs font-bold uppercase text-gray-500">
          Verrouillage de l'app
        </Text>
        <View className="mb-6 rounded-2xl border bg-neutral-900" style={{ borderColor: '#334155' }}>
          <View className="flex-row items-center p-4">
            <View
              className="mr-3 rounded-full p-2"
              style={{ backgroundColor: '#0B1220', borderWidth: 1, borderColor: '#1F2937' }}
            >
              <Ionicons name={biometricIcon} color="#EAB308" size={18} />
            </View>
            <View className="flex-1 pr-3">
              <Text className="font-semibold text-white">{getBiometricLabel(biometricType)}</Text>
              <Text className="text-xs text-gray-400">
                {isAvailable
                  ? "Demander une authentification à l'ouverture de l'app"
                  : 'Non disponible sur cet appareil'}
              </Text>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={handleToggleBiometric}
              disabled={!isAvailable}
              trackColor={{ false: '#374151', true: '#EAB308' }}
              thumbColor={isEnabled ? '#FDE68A' : '#9CA3AF'}
            />
          </View>
        </View>

        {/* Changement de mot de passe */}
        <Text className="mb-2 ml-1 text-xs font-bold uppercase text-gray-500">Mot de passe</Text>
        <View className="rounded-2xl border bg-neutral-900 p-4" style={{ borderColor: '#334155' }}>
          <Text className="mb-3 text-xs text-gray-400">
            Choisissez un nouveau mot de passe (8 caractères minimum).
          </Text>

          <View
            className="mb-3 flex-row items-center rounded-xl px-3"
            style={{ backgroundColor: '#0B1220', borderWidth: 1, borderColor: '#1F2937' }}
          >
            <Ionicons name="lock-closed-outline" color="#6B7280" size={18} />
            <TextInput
              className="ml-3 flex-1 py-3 text-white"
              placeholder="Nouveau mot de passe"
              placeholderTextColor="#6B7280"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                color="#6B7280"
                size={18}
              />
            </Pressable>
          </View>

          <View
            className="mb-4 flex-row items-center rounded-xl px-3"
            style={{ backgroundColor: '#0B1220', borderWidth: 1, borderColor: '#1F2937' }}
          >
            <Ionicons name="lock-closed-outline" color="#6B7280" size={18} />
            <TextInput
              className="ml-3 flex-1 py-3 text-white"
              placeholder="Confirmer le mot de passe"
              placeholderTextColor="#6B7280"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={confirm}
              onChangeText={setConfirm}
            />
          </View>

          <Pressable
            onPress={handleChangePassword}
            disabled={saving}
            className="flex-row items-center justify-center rounded-xl"
            style={{ backgroundColor: saving ? '#854D0E' : '#EAB308', paddingVertical: 14 }}
          >
            {saving ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Ionicons name="key-outline" color="#000" size={18} />
                <Text className="ml-2 font-extrabold text-black">
                  Mettre à jour le mot de passe
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <Text className="mt-4 text-xs text-gray-500">
          Pour supprimer définitivement votre compte, rendez-vous dans Profil → Supprimer mon
          compte.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
