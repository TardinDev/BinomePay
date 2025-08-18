import React from 'react'
import { View, Text, Pressable, ScrollView, Alert, Image } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import useAppStore from '@/store/useAppStore'
import { useAuth, useUser } from '@clerk/clerk-expo'
import * as ImagePicker from 'expo-image-picker'

export default function ProfileScreen() {
  const user = useAppStore((s) => s.user)
  const { signOut } = useAuth()
  const { user: clerkUser, isLoaded } = useUser()

  return (
    <ScrollView className="flex-1 bg-black px-5 pt-6">
      <View className="flex-row items-center justify-between">
        <Pressable onPress={() => router.back()} className="p-2 rounded-full" style={{ backgroundColor: '#111827' }}>
          <Ionicons name="arrow-back" size={18} color="#E5E7EB" />
        </Pressable>
        <Text className="text-white text-lg font-extrabold">Profil</Text>
        <View style={{ width: 32 }} />
      </View>

      <View className="mt-6 bg-neutral-900 rounded-2xl p-5 border" style={{ borderColor: '#334155' }}>
        <View className="flex-row items-center">
          {clerkUser?.imageUrl ? (
            <Image
              source={{ uri: clerkUser.imageUrl }}
              style={{ width: 56, height: 56, borderRadius: 9999, borderWidth: 1, borderColor: '#1F2937', backgroundColor: '#0B1220' }}
            />
          ) : (
            <View style={{ backgroundColor: '#0B1220', padding: 14, borderRadius: 9999, borderWidth: 1, borderColor: '#1F2937' }}>
              <Ionicons name="person" color="#EAB308" size={24} />
            </View>
          )}
          <View className="ml-3">
            <Text className="text-white text-xl font-extrabold">{clerkUser?.firstName || user?.name || 'Utilisateur'}</Text>
            <Text className="text-gray-400">KYC: {user?.kycStatus ?? 'inconnu'}</Text>
          </View>
        </View>

        <View className="h-[1px] bg-gray-800 my-4" />
        <View className="flex-row justify-between">
          <View>
            <Text className="text-gray-400 text-xs">Note moyenne</Text>
            <Text className="text-white text-lg font-bold">{user?.ratingAvg ?? '—'}</Text>
          </View>
          <View>
            <Text className="text-gray-400 text-xs">Transactions</Text>
            <Text className="text-white text-lg font-bold">—</Text>
          </View>
          <View>
            <Text className="text-gray-400 text-xs">Membre depuis</Text>
            <Text className="text-white text-lg font-bold">—</Text>
          </View>
        </View>
        <View className="mt-4">
          <Pressable
            onPress={async () => {
              if (!isLoaded || !clerkUser) return
              // Restriction 3 mois
              const last = (clerkUser.publicMetadata as any)?.avatarUpdatedAt as string | undefined
              if (last) {
                const lastTs = new Date(last).getTime()
                const now = Date.now()
                const threeMonthsMs = 90 * 24 * 60 * 60 * 1000
                const remain = threeMonthsMs - (now - lastTs)
                if (remain > 0) {
                  const nextDate = new Date(lastTs + threeMonthsMs)
                  Alert.alert('Non autorisé', `Vous pourrez changer la photo après le ${nextDate.toLocaleDateString()}.`)
                  return
                }
              }

              const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
              if (!perm.granted) {
                Alert.alert('Permission requise', "Activez l'accès aux photos pour changer votre image de profil.")
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
                const current = (clerkUser.publicMetadata || {}) as any
                await clerkUser.update({ publicMetadata: { ...current, avatarUpdatedAt: new Date().toISOString() } })
                Alert.alert('Succès', 'Votre photo de profil a été mise à jour.')
              } catch (e: any) {
                Alert.alert('Erreur', e?.message ?? "Impossible de mettre à jour l'image")
              }
            }}
            className="rounded-xl items-center"
            style={{ backgroundColor: '#1F2937', paddingVertical: 12 }}
          >
            <Text className="text-white font-extrabold">Changer la photo</Text>
          </Pressable>
        </View>
      </View>

      <View className="mt-6">
        <Pressable
          onPress={async () => {
            try {
              await signOut()
            } catch (e: any) {
              Alert.alert('Erreur', e?.message ?? 'Une erreur est survenue')
            }
          }}
          className="rounded-xl items-center"
          style={{ backgroundColor: '#EF4444', paddingVertical: 12 }}
        >
          <Text className="text-white font-extrabold">Se déconnecter</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}


