import React from 'react'
import { View, Text } from 'react-native'
import { MatchItem } from '@/store/useAppStore'

type Props = { item: MatchItem }

export default function RecentMatchCard({ item }: Props) {
  const status = String(item.status ?? '').toLowerCase()
  const statusContainerClass = status.includes('accept')
    ? 'bg-emerald-500/20 border-emerald-900'
    : status.includes('expire')
    ? 'bg-rose-500/20 border-rose-900'
    : 'bg-yellow-500/20 border-amber-900'
  const statusTextClass = status.includes('accept')
    ? 'text-emerald-400'
    : status.includes('expire')
    ? 'text-rose-400'
    : 'text-yellow-400'
  const statusLabel = status.includes('accept') ? 'Accepté' : status.includes('expire') ? 'Expiré' : 'En attente'

  return (
    <View className="rounded-2xl flex-row gap-10 px-4 py-2 w-[228px] bg-[#0B0F1A] border border-[#273244] shadow-lg shadow-black/50">

        <View className="flex-1">
          <Text className="text-white font-semibold">{item.counterpartName}</Text>
          <Text className="text-gray-300 mt-2">{item.corridor}</Text>
        </View>
      
        <View className="items-end">
          <View className="bg-yellow-500/15 border border-yellow-500 rounded-full py-1/2 px-2.5">
            <Text className="text-black font-extrabold text-xs" style={{ color: '#FDE68A' }}>
              {item.amount} {item.currency}
            </Text>
          </View>
          <View className={`rounded-full border py-1 px-2 mt-4 ${statusContainerClass}`}>
            <Text className={`text-[10px] font-bold ${statusTextClass}`}>{statusLabel}</Text>
          </View>
        </View>
      
     
    </View>
  )
}


