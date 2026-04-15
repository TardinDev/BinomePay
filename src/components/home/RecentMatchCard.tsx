import React, { useMemo } from 'react'
import { View, Text } from 'react-native'
import { MatchItem } from '@/store/useAppStore'

type Props = { item: MatchItem }

const getStatusStyle = (status: string) => {
  const normalizedStatus = status.toLowerCase()

  if (normalizedStatus.includes('accept')) {
    return {
      containerClass: 'bg-emerald-500/20 border-emerald-900',
      textClass: 'text-emerald-400',
      label: 'Accepté',
    }
  }

  if (normalizedStatus.includes('expire')) {
    return {
      containerClass: 'bg-rose-500/20 border-rose-900',
      textClass: 'text-rose-400',
      label: 'Expiré',
    }
  }

  return {
    containerClass: 'bg-yellow-500/20 border-amber-900',
    textClass: 'text-yellow-400',
    label: 'En attente',
  }
}

export default function RecentMatchCard({ item }: Props) {
  const { containerClass, textClass, label } = useMemo(
    () => getStatusStyle(String(item.status ?? '')),
    [item.status]
  )

  return (
    <View className="w-[228px] flex-row gap-10 rounded-2xl border border-[#273244] bg-[#0B0F1A] px-4 py-2 shadow-lg shadow-black/50">
      <View className="flex-1">
        <Text className="font-semibold text-white">{item.counterpartName}</Text>
        <Text className="mt-2 text-gray-300">{item.corridor}</Text>
      </View>

      <View className="items-end">
        <View className="rounded-full border border-yellow-500 bg-yellow-500/15 px-2.5 py-0.5">
          <Text className="text-xs font-extrabold text-black" style={{ color: '#FDE68A' }}>
            {item.amount} {item.currency}
          </Text>
        </View>
        <View className={`mt-4 rounded-full border px-2 py-1 ${containerClass}`}>
          <Text className={`text-[10px] font-bold ${textClass}`}>{label}</Text>
        </View>
      </View>
    </View>
  )
}
