import React, { useState, useRef, useEffect } from 'react'
import { View, Text, Pressable, ScrollView, Alert, Image, Modal } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import useAppStore from '@/store/useAppStore'
import { useAuth, useUser } from '@clerk/clerk-expo'
import * as ImagePicker from 'expo-image-picker'
import * as Linking from 'expo-linking'

type UnsafeMeta = Record<string, unknown> & { avatarUpdatedAt?: string }

export default function ProfileScreen() {
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

    // Marquer qu'on est en train de se déconnecter
    setLoggingOut(true)
    setShowLogoutModal(true)

    try {
      console.log('🔴 Début déconnexion - Bouton cliqué')

      // Attendre un peu pour que l'utilisateur voie le message avant de déconnecter
      setTimeout(async () => {
        try {
          console.log('🔄 Appel signOut()...')

          // Polyfill pour window.location si nécessaire (fix pour Clerk en React Native)
          if (typeof window !== 'undefined' && !window.location) {
            (window as any).location = { origin: 'app://binomepay' }
          }

          // Appeler signOut() - Clerk va maintenant trouver window.location.origin
          await signOut()
          console.log('✅ signOut() réussi')
          // Le reset sera fait automatiquement par le ProtectedLayout
          // Pas besoin de fermer le modal, la navigation va changer
        } catch (e: any) {
          console.error('❌ Erreur lors de la déconnexion:', e)
          const msg = e instanceof Error ? e.message : String(e ?? 'Erreur inconnue')
          if (isMounted.current) {
            setLoggingOut(false) // Reset le flag en cas d'erreur
            setShowLogoutModal(false)
            Alert.alert('Erreur', msg || 'Déconnexion impossible, réessayez')
          }
        }
      }, 1500)

    } catch (e: any) {
      console.error('❌ Erreur lors de la déconnexion:', e)
      const msg = e instanceof Error ? e.message : String(e ?? 'Erreur inconnue')
      if (isMounted.current) {
        setLoggingOut(false) // Reset le flag en cas d'erreur
        setShowLogoutModal(false)
        Alert.alert('Erreur', msg || 'Déconnexion impossible, réessayez')
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
      const current = (clerkUser.unsafeMetadata ?? {}) as UnsafeMeta
      const nextMeta: UnsafeMeta = { ...current, avatarUpdatedAt: new Date().toISOString() }
      await clerkUser.update({ unsafeMetadata: nextMeta })
      Alert.alert('Succès', 'Votre photo de profil a été mise à jour.')
    } catch (e: any) {
      Alert.alert('Erreur', e?.message ?? "Impossible de mettre à jour l'image")
    }
  }

  return (
    <ScrollView className="flex-1 bg-black px-5 pt-6">
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() => {
            try {
              // Sécuriser le retour: si aucun historique, revenir aux tabs
              const canGoBack = (router as any)?.canGoBack?.()
              if (canGoBack) router.back()
              else router.replace('/(Protected)/(tabs)')
            } catch {
              router.replace('/(Protected)/(tabs)')
            }
          }}
          className="p-2 rounded-full"
          style={{ backgroundColor: '#111827' }}
        >
          <Ionicons name="arrow-back" size={18} color="#E5E7EB" />
        </Pressable>
        <Text className="text-white text-lg font-extrabold">Profil</Text>
        <View style={{ width: 32 }} />
      </View>

      <View className="mt-6 bg-neutral-900 rounded-2xl p-5 border" style={{ borderColor: '#334155' }}>
        <View className="flex-row items-center">
          <Pressable onPress={handleChangePhoto} accessibilityLabel="Changer la photo de profil">
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
          </Pressable>
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
        {/* Bouton supprimé: changement via tap sur la photo */}
      </View>

      <View className="mt-6">
        <Pressable
          onPress={handleLogout}
          className="rounded-xl items-center"
          style={{ backgroundColor: '#EF4444', paddingVertical: 12 }}
        >
          <Text className="text-white font-extrabold">Se déconnecter</Text>
        </Pressable>
      </View>

      {/* Modal de déconnexion */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          <View className="bg-neutral-900 rounded-3xl p-8 mx-8 border" style={{ borderColor: '#334155' }}>
            <View className="items-center">
              <View className="mb-6 p-4 rounded-full" style={{ backgroundColor: '#1E293B' }}>
                <Ionicons name="sad-outline" size={60} color="#EAB308" />
              </View>
              <Text className="text-white text-2xl font-extrabold mb-2 text-center">
                Vous êtes déconnecté
              </Text>
              <Text className="text-gray-400 text-center">
                À bientôt sur BinomePay !
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}
