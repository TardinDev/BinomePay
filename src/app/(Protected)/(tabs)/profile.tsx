import React, { useState, useRef, useEffect } from 'react'
import { View, Text, Pressable, ScrollView, Alert, Image, Modal } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import useAppStore from '@/store/useAppStore'
import { useAuth, useUser } from '@clerk/clerk-expo'
import * as ImagePicker from 'expo-image-picker'

type UnsafeMeta = Record<string, unknown> & { avatarUpdatedAt?: string }

export default function ProfileTabScreen() {
  const user = useAppStore((s) => s.user)
  const setLoggingOut = useAppStore((s) => s.setLoggingOut)
  const { signOut } = useAuth()
  const { user: clerkUser, isLoaded } = useUser()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const isMounted = useRef(true)

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  const handleLogout = async () => {
    if (!isMounted.current) return
    setLoggingOut(true)
    setShowLogoutModal(true)

    try {
      setTimeout(async () => {
        try {
          if (typeof window !== 'undefined' && !window.location) {
            ;(window as unknown as { location: { origin: string } }).location = {
              origin: 'app://binomepay',
            }
          }
          await signOut()
        } catch (e) {
          if (__DEV__) console.error('Erreur lors de la deconnexion:', e)
          const msg = e instanceof Error ? e.message : String(e ?? 'Erreur inconnue')
          if (isMounted.current) {
            setLoggingOut(false)
            setShowLogoutModal(false)
            Alert.alert('Erreur', msg || 'Deconnexion impossible, reessayez')
          }
        }
      }, 1500)
    } catch (e) {
      if (__DEV__) console.error('Erreur lors de la deconnexion:', e)
      const msg = e instanceof Error ? e.message : String(e ?? 'Erreur inconnue')
      if (isMounted.current) {
        setLoggingOut(false)
        setShowLogoutModal(false)
        Alert.alert('Erreur', msg || 'Deconnexion impossible, reessayez')
      }
    }
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
          'Non autorise',
          `Vous pourrez changer la photo apres le ${nextDate.toLocaleDateString()}.`
        )
        return
      }
    }

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert(
        'Permission requise',
        "Activez l'acces aux photos pour changer votre image de profil."
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
      Alert.alert('Succes', 'Votre photo de profil a ete mise a jour.')
    } catch (e: any) {
      Alert.alert('Erreur', e?.message ?? "Impossible de mettre a jour l'image")
    }
  }

  return (
    <ScrollView className="flex-1 bg-black px-5 pt-14">
      {/* Header */}
      <Text className="mb-6 text-2xl font-extrabold text-white">Mon Profil</Text>

      {/* Profile Card */}
      <View className="rounded-2xl border bg-neutral-900 p-5" style={{ borderColor: '#334155' }}>
        <View className="flex-row items-center">
          <Pressable onPress={handleChangePhoto} accessibilityLabel="Changer la photo de profil">
            {clerkUser?.imageUrl ? (
              <Image
                source={{ uri: clerkUser.imageUrl }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 9999,
                  borderWidth: 2,
                  borderColor: '#EAB308',
                  backgroundColor: '#0B1220',
                }}
              />
            ) : (
              <View
                style={{
                  backgroundColor: '#0B1220',
                  padding: 16,
                  borderRadius: 9999,
                  borderWidth: 2,
                  borderColor: '#EAB308',
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
            <View className="mt-1 flex-row items-center">
              <View
                className={`rounded-full px-2 py-0.5 ${user?.kycStatus === 'verified' ? 'bg-green-900' : 'bg-yellow-900'}`}
              >
                <Text
                  className={`text-xs font-bold ${user?.kycStatus === 'verified' ? 'text-green-400' : 'text-yellow-400'}`}
                >
                  {user?.kycStatus === 'verified' ? 'Verifie' : 'Non verifie'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="my-4 h-[1px] bg-gray-800" />

        {/* Stats */}
        <View className="flex-row justify-between">
          <View className="flex-1 items-center">
            <Text className="text-xs text-gray-400">Note</Text>
            <View className="mt-1 flex-row items-center">
              <Ionicons name="star" color="#EAB308" size={16} />
              <Text className="ml-1 text-lg font-bold text-white">
                {user?.ratingAvg?.toFixed(1) ?? '—'}
              </Text>
            </View>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-xs text-gray-400">Transactions</Text>
            <Text className="mt-1 text-lg font-bold text-white">—</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-xs text-gray-400">Membre depuis</Text>
            <Text className="mt-1 text-lg font-bold text-white">—</Text>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <View className="mt-6 rounded-2xl border bg-neutral-900" style={{ borderColor: '#334155' }}>
        <Pressable
          onPress={() => router.push('/(Protected)/history')}
          className="flex-row items-center justify-between border-b p-4"
          style={{ borderColor: '#334155' }}
        >
          <View className="flex-row items-center">
            <View
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: '#1E293B' }}
            >
              <Ionicons name="time-outline" color="#60A5FA" size={20} />
            </View>
            <Text className="ml-3 font-semibold text-white">Historique</Text>
          </View>
          <Ionicons name="chevron-forward" color="#6B7280" size={20} />
        </Pressable>

        <Pressable
          className="flex-row items-center justify-between border-b p-4"
          style={{ borderColor: '#334155' }}
        >
          <View className="flex-row items-center">
            <View
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: '#1E293B' }}
            >
              <Ionicons name="notifications-outline" color="#F59E0B" size={20} />
            </View>
            <Text className="ml-3 font-semibold text-white">Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" color="#6B7280" size={20} />
        </Pressable>

        <Pressable
          className="flex-row items-center justify-between border-b p-4"
          style={{ borderColor: '#334155' }}
        >
          <View className="flex-row items-center">
            <View
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: '#1E293B' }}
            >
              <Ionicons name="shield-checkmark-outline" color="#10B981" size={20} />
            </View>
            <Text className="ml-3 font-semibold text-white">Securite</Text>
          </View>
          <Ionicons name="chevron-forward" color="#6B7280" size={20} />
        </Pressable>

        <Pressable className="flex-row items-center justify-between p-4">
          <View className="flex-row items-center">
            <View
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: '#1E293B' }}
            >
              <Ionicons name="help-circle-outline" color="#8B5CF6" size={20} />
            </View>
            <Text className="ml-3 font-semibold text-white">Aide</Text>
          </View>
          <Ionicons name="chevron-forward" color="#6B7280" size={20} />
        </Pressable>
      </View>

      {/* Logout Button */}
      <View className="mb-32 mt-6">
        <Pressable
          onPress={handleLogout}
          className="flex-row items-center justify-center rounded-xl"
          style={{ backgroundColor: '#7F1D1D', paddingVertical: 14 }}
        >
          <Ionicons name="log-out-outline" color="#FCA5A5" size={20} />
          <Text className="ml-2 font-extrabold text-red-300">Se deconnecter</Text>
        </Pressable>
      </View>

      {/* Logout Modal */}
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
                <Ionicons name="sad-outline" size={60} color="#EAB308" />
              </View>
              <Text className="mb-2 text-center text-2xl font-extrabold text-white">
                Vous etes deconnecte
              </Text>
              <Text className="text-center text-gray-400">A bientot sur BinomePay !</Text>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}
