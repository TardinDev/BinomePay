import React from 'react'
import { View, Text, Pressable, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import useAppStore from '@/store/useAppStore'
import { supabase } from '@/lib/supabase'

export default function ProfileScreen() {
  const user = useAppStore((s) => s.user)

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
          <View style={{ backgroundColor: '#0B1220', padding: 14, borderRadius: 9999, borderWidth: 1, borderColor: '#1F2937' }}>
            <Ionicons name="person" color="#EAB308" size={24} />
          </View>
          <View className="ml-3">
            <Text className="text-white text-xl font-extrabold">{user?.name ?? 'Utilisateur'}</Text>
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
      </View>

      <View className="mt-6">
        <Pressable
          onPress={async () => {
            const { error } = await supabase.auth.signOut()
            if (error) {
              Alert.alert('Erreur', error.message)
            }
            // La redirection est gérée par _layout via l'état de session
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


