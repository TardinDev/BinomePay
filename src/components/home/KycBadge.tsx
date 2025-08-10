import React from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { KycStatus } from '@/store/useAppStore'

type Props = { status: KycStatus | undefined | null }

export default function KycBadge({ status }: Props) {
  return (
    <View className="mt-3 flex-row items-center">
      <View className="px-3 py-1 rounded-full flex-row items-center border border-zinc-700 bg-yellow-500/15">
        <Ionicons name="shield-checkmark" size={12} color="#EAB308" />
        <Text className="text-yellow-400 font-semibold text-xs ml-1">
          KYC: {status ?? 'inconnu'}
        </Text>
      </View>
    </View>
  )
}


