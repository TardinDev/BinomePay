import React from 'react'
import { FlatList, Text, View } from 'react-native'
import { SuggestedItem } from '@/store/useAppStore'
import SuggestedCard from './SuggestedCard'

type Props = { data: SuggestedItem[] }

export default function SuggestedList({ data }: Props) {
  return (
    <View className="flex-1">
      <FlatList
        className="flex-1"
        data={data}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <Text className="text-gray-400">Aucune proposition pour le moment.</Text>
        )}
        ListFooterComponent={() => <View className="h-24" />}
        renderItem={({ item }) => <SuggestedCard item={item} />}
      />
    </View>
  )
}


