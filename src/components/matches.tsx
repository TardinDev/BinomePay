import React from 'react'
import { View, Text, FlatList } from 'react-native'
import useAppStore from '@/store/useAppStore'

export default function MatchesPage() {
  const matches = useAppStore((s) => s.matches)

  return (
    <View className="flex-1 bg-black px-5 pt-6">
      <Text className="text-2xl font-extrabold text-white">Mes matches</Text>
      <FlatList
        className="mt-5"
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 16 }}
        ListEmptyComponent={() => <Text className="text-gray-400">Aucun match actif.</Text>}
        renderItem={({ item }) => {
          const status = String(item.status ?? '').toLowerCase()
          const statusStyles =
            status.includes('confirm') || status.includes('valid')
              ? {
                  bg: 'rgba(34,197,94,0.18)',
                  text: '#22C55E',
                  border: '#14532D',
                  label: 'Confirmé',
                }
              : status.includes('annul') || status.includes('cancel')
                ? {
                    bg: 'rgba(248,113,113,0.18)',
                    text: '#F87171',
                    border: '#7F1D1D',
                    label: 'Annulé',
                  }
                : {
                    bg: 'rgba(234,179,8,0.18)',
                    text: '#EAB308',
                    border: '#854D0E',
                    label: 'En attente',
                  }

          return (
            <View
              className="mb-3 rounded-2xl p-4"
              style={{
                backgroundColor: '#0B0F1A',
                borderWidth: 1,
                borderColor: '#273244',
                shadowColor: '#000',
                shadowOpacity: 0.35,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
                elevation: 10,
              }}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold text-white">{item.counterpartName}</Text>
                <View
                  style={{
                    backgroundColor: 'rgba(234,179,8,0.16)',
                    borderColor: '#EAB308',
                    borderWidth: 1,
                    borderRadius: 9999,
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text className="text-xs font-extrabold text-black" style={{ color: '#FDE68A' }}>
                    {item.amount} {item.currency}
                  </Text>
                </View>
              </View>
              <Text className="mt-1 text-gray-300">{item.corridor}</Text>
              <View className="mt-2 flex-row justify-end">
                <View
                  style={{
                    backgroundColor: statusStyles.bg,
                    borderColor: statusStyles.border,
                    borderWidth: 1,
                    borderRadius: 9999,
                    paddingVertical: 3,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text className="text-xs font-bold" style={{ color: statusStyles.text }}>
                    {statusStyles.label}
                  </Text>
                </View>
              </View>
            </View>
          )
        }}
      />
    </View>
  )
}
