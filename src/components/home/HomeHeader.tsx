import React, { useState } from 'react'
import { View, Text, Pressable, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { User } from '@/store/useAppStore'

type Props = {
  user: User | null
}

export default function HomeHeader({ user }: Props) {
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  return (
    <View className="rounded-2xl p-4 border bg-[#0B0F1A] border-gray-800">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="bg-[#0B1220] p-2 rounded-full border border-gray-800">
            <Ionicons name="globe-outline" color="#EAB308" size={18} />
          </View>
          <View className="ml-3">
            <Text className="text-white text-xl font-extrabold">Bonjour{user?.name ? `, ${user.name}` : ''} 👋</Text>
            <Text className="text-gray-400 text-xs">Prêt à échanger en toute confiance</Text>
            <Pressable onPress={() => setShowHowItWorks(true)} className="flex-row items-center mt-1">
              <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
              <Text className="text-gray-300 text-xs ml-1">Comprendre le principe</Text>
            </Pressable>
          </View>
        </View>
        <Pressable onPress={() => router.navigate('/(Protected)/profile')} className="bg-gray-800 py-2 px-3 rounded-full">
          <Ionicons name="person" color="#EAB308" size={20} />
        </Pressable>
      </View>

      <Modal visible={showHowItWorks} transparent animationType="fade" onRequestClose={() => setShowHowItWorks(false)}>
        <View className="flex-1 bg-black/60 items-center justify-center px-5">
          <View className="w-full rounded-2xl border border-gray-800 bg-[#0B0F1A] p-5">
            <Text className="text-white text-xl font-extrabold">Comment ça marche ?</Text>
            <Text className="text-gray-300 mt-2">
              Binome Pay met en relation deux personnes qui veulent échanger de l’argent localement, pour éviter les frais de change et aller plus vite.
            </Text>
            <View className="h-[1px] bg-gray-800 my-4" />
            <View className="gap-3">
              <View className="flex-row items-start">
                <Ionicons name="pencil" size={16} color="#EAB308" />
                <Text className="text-gray-200 text-sm ml-2">Créez une intention: montant, devise et pays de destination.</Text>
              </View>
              <View className="flex-row items-start">
                <Ionicons name="search" size={16} color="#EAB308" />
                <Text className="text-gray-200 text-sm ml-2">Recevez des propositions compatibles et choisissez un binôme.</Text>
              </View>
              <View className="flex-row items-start">
                <Ionicons name="swap-horizontal" size={16} color="#EAB308" />
                <Text className="text-gray-200 text-sm ml-2">Match: vous échangez local contre local sur le corridor (ex: FR → SN).</Text>
              </View>
              <View className="flex-row items-start">
                <Ionicons name="chatbubbles" size={16} color="#EAB308" />
                <Text className="text-gray-200 text-sm ml-2">Discutez pour convenir du lieu/heure. Profils vérifiés (KYC) et notes pour la confiance.</Text>
              </View>
            </View>

            <View className="flex-row justify-end gap-3 mt-5">
              <Pressable onPress={() => setShowHowItWorks(false)} className="px-4 py-2 rounded-full bg-gray-800">
                <Text className="text-white font-semibold">J’ai compris</Text>
              </Pressable>
              <Pressable onPress={() => { setShowHowItWorks(false); router.push('/(Protected)/new-intention') }} className="px-4 py-2 rounded-full bg-yellow-400">
                <Text className="text-black font-extrabold">Créer une intention</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}


