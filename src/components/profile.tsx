import React from 'react'
import { View, Text, Pressable } from 'react-native'
import useAppStore from '@/store/useAppStore'

export default function ProfilePage() {
  const user = useAppStore((s) => s.user)
  const clearNotifications = useAppStore((s) => s.clearNotifications)
  const notifications = useAppStore((s) => s.notifications)

  return (
    <View className="flex-1 bg-black px-5 pt-6">
      <Text className="text-xl font-extrabold text-white">Profil</Text>
      <View className="mt-5 rounded-xl border border-gray-800 bg-neutral-900 p-5">
        <Text className="font-bold text-white">{user?.name ?? 'Utilisateur'}</Text>
        <Text className="mt-1 text-gray-400">KYC: {user?.kycStatus ?? 'inconnu'}</Text>
        <Text className="mt-1 text-gray-400">Note moyenne: {user?.ratingAvg ?? '—'}</Text>
        <View className="my-4 h-[1px] bg-gray-800" />
        <Text className="text-white">Notifications: {notifications}</Text>
        <Pressable
          onPress={clearNotifications}
          className="mt-3 items-center rounded-xl bg-yellow-400 px-4 py-2"
        >
          <Text className="font-extrabold text-black">Reinitialiser</Text>
        </Pressable>
      </View>
    </View>
  )
}
