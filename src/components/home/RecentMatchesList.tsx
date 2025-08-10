import React from 'react'
import { FlatList, Text, View } from 'react-native'
import { MatchItem } from '@/store/useAppStore'
import RecentMatchCard from './RecentMatchCard'

type Props = { data: MatchItem[] }

export default function RecentMatchesList({ data }: Props) {
  return (
    <>
      <Text className="text-white text-xl font-extrabold mt-8 mb-3">Matches récents</Text>
      <View className="pr-3 pb-2">
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="w-3.5" />}
          ListEmptyComponent={() => (
            <Text className="text-gray-400">Aucun match pour le moment.</Text>
          )}
          ListFooterComponent={() => <View className="w-3" />}
          renderItem={({ item }) => <RecentMatchCard item={item} />}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={10}
          initialNumToRender={3}
          getItemLayout={(data, index) => ({
            length: 228,
            offset: 228 * index + (index > 0 ? 14 * index : 0),
            index,
          })}
        />
      </View>
    </>
  )
}


