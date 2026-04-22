import React, { useState, useRef, useEffect } from 'react'
import { View, Text, Pressable, ScrollView, Alert, Image, Modal, Switch } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import useAppStore from '@/store/useAppStore'
import { useAuth, useUser } from '@clerk/clerk-expo'
import * as ImagePicker from 'expo-image-picker'
import { useBiometricAuth, getBiometricLabel, getBiometricIcon } from '@/hooks/useBiometricAuth'
import { unregisterPushTokenForUser } from '@/services/pushTokenService'

type UnsafeMeta = Record<string, unknown> & { avatarUpdatedAt?: string }

type RowProps = {
  icon: string
  iconColor?: string
  label: string
  value?: string
  onPress?: () => void
  right?: React.ReactNode
  destructive?: boolean
  last?: boolean
}

function SettingsRow({
  icon,
  iconColor = '#EAB308',
  label,
  value,
  onPress,
  right,
  destructive,
  last,
}: RowProps) {
  const content = (
    <View
      className="flex-row items-center p-4"
      style={{ borderBottomWidth: last ? 0 : 1, borderBottomColor: '#1F2937' }}
    >
      <View
        className="mr-3 rounded-full p-2"
        style={{ backgroundColor: '#0B1220', borderWidth: 1, borderColor: '#1F2937' }}
      >
        <Ionicons name={icon as any} color={destructive ? '#EF4444' : iconColor} size={18} />
      </View>
      <Text className={`flex-1 ${destructive ? 'text-red-400' : 'text-white'}`}>{label}</Text>
      {right ?? (
        <>
          {value ? <Text className="mr-2 text-gray-400">{value}</Text> : null}
          {onPress ? <Ionicons name="chevron-forward" color="#6B7280" size={18} /> : null}
        </>
      )}
    </View>
  )
  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content
}

export default function ProfileScreen() {
  const user = useAppStore((s) => s.user)
  const setLoggingOut = useAppStore((s) => s.setLoggingOut)
  const { signOut } = useAuth()
  const { user: clerkUser, isLoaded } = useUser()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const isMounted = useRef(true)

  const {
    isAvailable: bioAvailable,
    isEnabled: bioEnabled,
    biometricType,
    enableBiometric,
    disableBiometric,
  } = useBiometricAuth()

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  const appVersion = Constants.expoConfig?.version ?? '1.0.1'

  const memberSince = clerkUser?.createdAt
    ? new Date(clerkUser.createdAt).toLocaleDateString('fr-FR', {
        month: 'short',
        year: 'numeric',
      })
    : '—'

  const handleLogout = async () => {
    if (!isMounted.current) return
    setLoggingOut(true)
    setShowLogoutModal(true)

    setTimeout(async () => {
      try {
        if (typeof window !== 'undefined' && !window.location) {
          ;(window as unknown as { location: { origin: string } }).location = {
            origin: 'app://binomepay',
          }
        }
        // Supprime le token push AVANT signOut (sinon le JWT est invalidé et la RLS bloque)
        await unregisterPushTokenForUser()
        await signOut()
      } catch (e) {
        if (__DEV__) console.error('Erreur déconnexion:', e)
        const msg = e instanceof Error ? e.message : String(e ?? 'Erreur inconnue')
        if (isMounted.current) {
          setLoggingOut(false)
          setShowLogoutModal(false)
          Alert.alert('Erreur', msg || 'Déconnexion impossible, réessayez')
        }
      }
    }, 1500)
  }

  const confirmLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', style: 'destructive', onPress: handleLogout },
    ])
  }

  const handleChangePhoto = async () => {
    if (!isLoaded || !clerkUser) return
    const meta = (clerkUser.unsafeMetadata ?? {}) as UnsafeMeta
    const last = meta.avatarUpdatedAt
    if (last) {
      const lastTs = new Date(last).getTime()
      const now = Date.now()
      const threeMonthsMs = 90 * 24 * 60 * 60 * 1000
      const remain = threeMonthsMs - (now - lastTs)
      if (remain > 0) {
        const nextDate = new Date(lastTs + threeMonthsMs)
        Alert.alert(
          'Non autorisé',
          `Vous pourrez changer la photo après le ${nextDate.toLocaleDateString()}.`
        )
        return
      }
    }

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert(
        'Permission requise',
        "Activez l'accès aux photos pour changer votre image de profil."
      )
      return
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    })
    if (picked.canceled || !picked.assets?.length) return
    const uri = picked.assets[0].uri
    try {
      const resp = await fetch(uri)
      const blob = await resp.blob()
      await clerkUser.setProfileImage({ file: blob as any })
      const current = (clerkUser.unsafeMetadata ?? {}) as UnsafeMeta
      const nextMeta: UnsafeMeta = { ...current, avatarUpdatedAt: new Date().toISOString() }
      await clerkUser.update({ unsafeMetadata: nextMeta })
      Alert.alert('Succès', 'Votre photo de profil a été mise à jour.')
    } catch (e: any) {
      Alert.alert('Erreur', e?.message ?? "Impossible de mettre à jour l'image")
    }
  }

  const handleToggleBiometric = async (next: boolean) => {
    if (next) {
      const ok = await enableBiometric()
      if (!ok) Alert.alert('Échec', "L'authentification biométrique n'a pas pu être activée.")
    } else {
      await disableBiometric()
    }
  }

  const kycLabel =
    user?.kycStatus === 'verified'
      ? 'Vérifié'
      : user?.kycStatus === 'pending'
        ? 'En cours'
        : 'Non vérifié'
  const kycColor =
    user?.kycStatus === 'verified'
      ? '#10B981'
      : user?.kycStatus === 'pending'
        ? '#F59E0B'
        : '#6B7280'

  return (
    <ScrollView className="flex-1 bg-black px-5 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() => {
            try {
              const canGoBack = (router as any)?.canGoBack?.()
              if (canGoBack) router.back()
              else router.replace('/(Protected)/(tabs)')
            } catch {
              router.replace('/(Protected)/(tabs)')
            }
          }}
          className="rounded-full p-2"
          style={{ backgroundColor: '#111827' }}
        >
          <Ionicons name="arrow-back" size={18} color="#E5E7EB" />
        </Pressable>
        <Text className="text-lg font-extrabold text-white">Profil</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Carte profil */}
      <View
        className="mt-6 rounded-2xl border bg-neutral-900 p-5"
        style={{ borderColor: '#334155' }}
      >
        <View className="flex-row items-center">
          <Pressable onPress={handleChangePhoto} accessibilityLabel="Changer la photo de profil">
            {clerkUser?.imageUrl ? (
              <Image
                source={{ uri: clerkUser.imageUrl }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 9999,
                  borderWidth: 1,
                  borderColor: '#1F2937',
                  backgroundColor: '#0B1220',
                }}
              />
            ) : (
              <View
                style={{
                  backgroundColor: '#0B1220',
                  padding: 18,
                  borderRadius: 9999,
                  borderWidth: 1,
                  borderColor: '#1F2937',
                }}
              >
                <Ionicons name="person" color="#EAB308" size={28} />
              </View>
            )}
          </Pressable>
          <View className="ml-4 flex-1">
            <Text className="text-xl font-extrabold text-white">
              {clerkUser?.firstName || user?.name || 'Utilisateur'}
            </Text>
            <Text className="text-xs text-gray-400">
              {clerkUser?.primaryEmailAddress?.emailAddress ?? ''}
            </Text>
            <View className="mt-2 flex-row items-center">
              <View
                className="rounded-full px-2 py-0.5"
                style={{ backgroundColor: kycColor + '20', borderWidth: 1, borderColor: kycColor }}
              >
                <Text className="text-xs font-semibold" style={{ color: kycColor }}>
                  KYC · {kycLabel}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="my-4 h-[1px] bg-gray-800" />
        <View className="flex-row justify-between">
          <View>
            <Text className="text-xs text-gray-400">Note</Text>
            <Text className="text-lg font-bold text-white">
              {user?.ratingAvg ? Number(user.ratingAvg).toFixed(1) : '—'}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-gray-400">Membre depuis</Text>
            <Text className="text-lg font-bold text-white">{memberSince}</Text>
          </View>
        </View>
      </View>

      {/* Section Compte */}
      <Text className="mb-2 mt-6 text-xs font-semibold uppercase text-gray-500">Compte</Text>
      <View className="rounded-2xl border bg-neutral-900" style={{ borderColor: '#334155' }}>
        <SettingsRow
          icon="person"
          label="Modifier le profil"
          onPress={() => router.push('/(Protected)/settings/edit-profile' as any)}
        />
        <SettingsRow
          icon="time"
          label="Historique des transactions"
          onPress={() => router.push('/(Protected)/history' as any)}
          last
        />
      </View>

      {/* Section Préférences */}
      <Text className="mb-2 mt-6 text-xs font-semibold uppercase text-gray-500">Préférences</Text>
      <View className="rounded-2xl border bg-neutral-900" style={{ borderColor: '#334155' }}>
        <SettingsRow
          icon="notifications"
          label="Notifications"
          onPress={() => router.push('/(Protected)/settings/notifications' as any)}
        />
        {bioAvailable ? (
          <SettingsRow
            icon={getBiometricIcon(biometricType)}
            label={getBiometricLabel(biometricType)}
            right={
              <Switch
                value={bioEnabled}
                onValueChange={handleToggleBiometric}
                trackColor={{ false: '#374151', true: '#EAB308' }}
                thumbColor={bioEnabled ? '#FDE68A' : '#9CA3AF'}
              />
            }
            last
          />
        ) : (
          <SettingsRow
            icon="lock-closed-outline"
            label="Biométrie (non disponible)"
            right={<Text className="text-xs text-gray-500">Indispo.</Text>}
            last
          />
        )}
      </View>

      {/* Section Support */}
      <Text className="mb-2 mt-6 text-xs font-semibold uppercase text-gray-500">Support</Text>
      <View className="rounded-2xl border bg-neutral-900" style={{ borderColor: '#334155' }}>
        <SettingsRow
          icon="help-circle"
          label="Aide & Support"
          onPress={() => router.push('/(Protected)/settings/help' as any)}
        />
        <SettingsRow
          icon="information-circle"
          label="À propos"
          value={`v${appVersion}`}
          onPress={() => router.push('/(Protected)/settings/about' as any)}
          last
        />
      </View>

      {/* Section Danger */}
      <Text className="mb-2 mt-6 text-xs font-semibold uppercase text-gray-500">Zone sensible</Text>
      <View className="rounded-2xl border bg-neutral-900" style={{ borderColor: '#334155' }}>
        <SettingsRow
          icon="log-out-outline"
          iconColor="#F59E0B"
          label="Se déconnecter"
          onPress={confirmLogout}
        />
        <SettingsRow
          icon="trash-outline"
          label="Supprimer mon compte"
          destructive
          onPress={() => router.push('/(Protected)/settings/delete-account' as any)}
          last
        />
      </View>

      {/* Modal de déconnexion */}
      <Modal visible={showLogoutModal} transparent={true} animationType="fade">
        <View
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        >
          <View
            className="mx-8 rounded-3xl border bg-neutral-900 p-8"
            style={{ borderColor: '#334155' }}
          >
            <View className="items-center">
              <View className="mb-6 rounded-full p-4" style={{ backgroundColor: '#1E293B' }}>
                <Ionicons name="log-out-outline" size={60} color="#EAB308" />
              </View>
              <Text className="mb-2 text-center text-2xl font-extrabold text-white">
                Vous êtes déconnecté
              </Text>
              <Text className="text-center text-gray-400">À bientôt sur BinomePay !</Text>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}
