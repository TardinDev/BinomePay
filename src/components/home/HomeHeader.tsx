import React, { useState, useMemo, useCallback } from 'react'
import { View, Text, Pressable, Modal, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { User } from '@/store/useAppStore'
import { useUser as useClerkUser } from '@clerk/clerk-expo'

type Props = {
  user: User | null
}

const HowItWorksModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View className="flex-1 items-center justify-center bg-black/60 px-5">
      <View className="w-full rounded-2xl border border-gray-800 bg-[#0B0F1A] p-5">
        <Text className="text-xl font-extrabold text-white">Comment ça marche ?</Text>
        <Text className="mt-2 text-gray-300">
          Binome Pay met en relation deux personnes qui veulent échanger de l'argent localement,
          pour éviter les frais de change et aller plus vite.
        </Text>
        <View className="my-4 h-[1px] bg-gray-800" />
        <View className="gap-3">
          <View className="flex-row items-start">
            <Ionicons name="pencil" size={16} color="#EAB308" />
            <Text className="ml-2 text-sm text-gray-200">
              Créez une intention: montant, devise et pays de destination.
            </Text>
          </View>
          <View className="flex-row items-start">
            <Ionicons name="search" size={16} color="#EAB308" />
            <Text className="ml-2 text-sm text-gray-200">
              Recevez des propositions compatibles et choisissez un binôme.
            </Text>
          </View>
          <View className="flex-row items-start">
            <Ionicons name="swap-horizontal" size={16} color="#EAB308" />
            <Text className="ml-2 text-sm text-gray-200">
              Match: vous échangez local contre local sur le corridor (ex: FR → SN).
            </Text>
          </View>
          <View className="flex-row items-start">
            <Ionicons name="chatbubbles" size={16} color="#EAB308" />
            <Text className="ml-2 text-sm text-gray-200">
              Discutez pour convenir du lieu/heure. Profils vérifiés (KYC) et notes pour la
              confiance.
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row justify-end gap-3">
          <Pressable onPress={onClose} className="rounded-full bg-gray-800 px-4 py-2">
            <Text className="font-semibold text-white">J'ai compris</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              onClose()
              router.push('/(Protected)/new-intention')
            }}
            className="rounded-full bg-yellow-400 px-4 py-2"
          >
            <Text className="font-extrabold text-black">Créer une intention</Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
)

export default function HomeHeader({ user }: Props) {
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const { user: clerkUser } = useClerkUser()
  const displayName = clerkUser?.firstName || user?.name || ''

  const closeModal = useCallback(() => setShowHowItWorks(false), [])

  const modalContent = useMemo(
    () =>
      showHowItWorks ? <HowItWorksModal visible={showHowItWorks} onClose={closeModal} /> : null,
    [showHowItWorks, closeModal]
  )

  return (
    <View className="rounded-2xl border border-gray-800 bg-[#0B0F1A] p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Image
            source={require('../../../assets/icon.png')}
            style={{ width: 40, height: 40, borderRadius: 10 }}
            resizeMode="contain"
          />
          <View className="ml-3">
            <Text className="text-xl font-extrabold text-white">
              Bonjour{displayName ? `, ${displayName}` : ''} 👋
            </Text>
            <Text className="text-xs text-gray-400">Prêt à échanger en toute confiance</Text>
            <Pressable
              onPress={() => setShowHowItWorks(true)}
              className="mt-1 flex-row items-center"
            >
              <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
              <Text className="ml-1 text-xs text-gray-300">Comprendre le principe</Text>
            </Pressable>
          </View>
        </View>
        <Pressable
          onPress={() => router.navigate('/(Protected)/profile')}
          className="rounded-full bg-gray-800 px-3 py-2"
        >
          <Ionicons name="person" color="#EAB308" size={20} />
        </Pressable>
      </View>

      {modalContent}
    </View>
  )
}
