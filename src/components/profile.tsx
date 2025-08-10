import React from 'react'
import { View, Text, Pressable } from 'react-native'
import useAppStore from '@/store/useAppStore'

export default function ProfilePage() {
  const user = useAppStore((s) => s.user)
  const clearNotifications = useAppStore((s) => s.clearNotifications)
  const notifications = useAppStore((s) => s.notifications)

  return (
    <View className="flex-1 bg-black px-5 pt-6">
      <Text className="text-white text-xl font-extrabold">Profil</Text>
      <View className="mt-5 bg-neutral-900 rounded-xl p-5 border border-gray-800">
        <Text className="text-white font-bold">{user?.name ?? 'Utilisateur'}</Text>
        <Text className="text-gray-400 mt-1">KYC: {user?.kycStatus ?? 'inconnu'}</Text>
        <Text className="text-gray-400 mt-1">Note moyenne: {user?.ratingAvg ?? '—'}</Text>
        <View className="h-[1px] bg-gray-800 my-4" />
        <Text className="text-white">Notifications: {notifications}</Text>
        <Pressable onPress={clearNotifications} className="mt-3 bg-yellow-400 rounded-xl px-4 py-2 items-center">
          <Text className="text-black font-extrabold">Reinitialiser</Text>
        </Pressable>
      </View>
    </View>
  )
}


