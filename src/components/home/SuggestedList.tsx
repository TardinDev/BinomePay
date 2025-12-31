import React, { useCallback } from 'react'
import { FlatList, View } from 'react-native'
import { router } from 'expo-router'
import { SuggestedItem } from '@/store/useAppStore'
import SuggestedCard from './SuggestedCard'
import { NoSuggestionsEmpty } from '@/components/EmptyState'
import { SuggestionsListSkeleton } from '@/components/SkeletonLoader'

type Props = {
  data: SuggestedItem[]
  isLoading?: boolean
}

export default function SuggestedList({ data, isLoading = false }: Props) {
  const handleCreateIntention = useCallback(() => {
    router.push('/(Protected)/new-intention')
  }, [])

  if (isLoading) {
    return (
      <View className="flex-1 px-4">
        <SuggestionsListSkeleton count={4} />
      </View>
    )
  }

  return (
    <View className="flex-1">
      <FlatList
        className="flex-1"
        data={data}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <NoSuggestionsEmpty onCreateIntention={handleCreateIntention} />
        )}
        ListFooterComponent={() => <View className="h-24" />}
        renderItem={({ item }) => <SuggestedCard item={item} />}
        removeClippedSubviews={true}
        maxToRenderPerBatch={8}
        windowSize={15}
        initialNumToRender={6}
        getItemLayout={(_, index) => ({
          length: 100,
          offset: 100 * index + (index > 0 ? 12 * index : 0),
          index,
        })}
        contentContainerStyle={data.length === 0 ? { flex: 1 } : undefined}
      />
    </View>
  )
}


