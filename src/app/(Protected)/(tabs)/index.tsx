import React, { useCallback, useMemo, useState } from 'react'
import { Text, View, ScrollView, FlatList, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import useAppStore from '@/store/useAppStore'
import HomeHeader from '@/components/home/HomeHeader'
import KycBadge from '@/components/home/KycBadge'
import CreateIntentionButton from '@/components/home/CreateIntentionButton'
import RecentMatchesList from '@/components/home/RecentMatchesList'
import SuggestedCard from '@/components/home/SuggestedCard'
import CountryFilter from '@/components/home/CountryFilter'
import { NoSuggestionsEmpty } from '@/components/EmptyState'
import { SuggestionsListSkeleton } from '@/components/SkeletonLoader'
import { syncService } from '@/services/syncService'
import type { RequestItem, MatchItem, SuggestedItem } from '@/lib/schemas'

type HomeSection =
  | { type: 'matches'; data: MatchItem[] }
  | { type: 'intentions'; data: RequestItem[] }
  | { type: 'suggestions-header'; data: never[] }
  | { type: 'suggestions-skeleton'; data: never[] }
  | { type: 'suggestions-empty'; data: never[] }
  | { type: 'suggestion'; data: SuggestedItem }

export default function HomePage() {
  const user = useAppStore((s) => s.user)
  const matches = useAppStore((s) => s.matches)
  const storeSuggested = useAppStore((s) => s.suggested)
  const requests = useAppStore((s) => s.requests)
  const isLoadingSuggested = useAppStore((s) => s.isLoadingSuggested)
  const [countryFilter, setCountryFilter] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await syncService.forceSync()
    } finally {
      setRefreshing(false)
    }
  }, [])

  const countries = useMemo(() => {
    const names = storeSuggested.map((s) => s.destCountryName)
    return Array.from(new Set(names))
  }, [storeSuggested])

  const filteredSuggested = useMemo(() => {
    const list = countryFilter
      ? storeSuggested.filter((s) => s.destCountryName === countryFilter)
      : storeSuggested
    return list
  }, [storeSuggested, countryFilter])

  // Skeleton uniquement au tout premier chargement (pas de données encore en cache)
  const showSkeleton = isLoadingSuggested && storeSuggested.length === 0

  // Créer les sections pour la FlatList
  const sections: HomeSection[] = [
    { type: 'matches', data: matches },
    ...(requests.length > 0 ? [{ type: 'intentions' as const, data: requests }] : []),
    { type: 'suggestions-header', data: [] },
    ...(showSkeleton
      ? [{ type: 'suggestions-skeleton' as const, data: [] }]
      : filteredSuggested.length === 0
        ? [{ type: 'suggestions-empty' as const, data: [] }]
        : filteredSuggested.map((item) => ({ type: 'suggestion' as const, data: item }))),
  ]

  const renderSectionItem = ({ item }: { item: HomeSection }) => {
    switch (item.type) {
      case 'matches':
        return (
          <View className="px-5">
            <RecentMatchesList data={item.data} />
          </View>
        )

      case 'intentions':
        return (
          <View className="px-5">
            <View className="mb-2 mt-3">
              <Text className="text-lg font-bold text-white">Mes intentions</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
              contentContainerStyle={{ paddingHorizontal: 0 }}
            >
              {item.data.map((req: RequestItem, index: number) => {
                const isSend = req.type === 'SEND'
                const matched = req.status === 'MATCHED'
                return (
                  <View
                    key={req.id}
                    className="rounded-xl border bg-neutral-900 p-3"
                    style={{
                      width: 158,
                      borderColor: isSend ? '#F59E0B55' : '#3B82F655',
                      marginRight: index === item.data.length - 1 ? 0 : 10,
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text
                        className="text-[11px] font-extrabold"
                        style={{ color: isSend ? '#F59E0B' : '#60A5FA' }}
                      >
                        {isSend ? 'ENVOYER' : 'RECEVOIR'}
                      </Text>
                      <View
                        className="rounded-full px-2 py-0.5"
                        style={{ backgroundColor: matched ? '#064E3B' : '#1F2937' }}
                      >
                        <Text
                          className="text-[10px] font-bold"
                          style={{ color: matched ? '#34D399' : '#9CA3AF' }}
                        >
                          {matched ? 'MATCHÉ' : 'OUVERT'}
                        </Text>
                      </View>
                    </View>
                    <Text className="mt-2 text-lg font-extrabold text-white">
                      {req.amount} {req.currency}
                    </Text>
                    <Text className="mt-1 text-xs text-gray-400" numberOfLines={1}>
                      {req.originCountry} → {req.destCountry}
                    </Text>
                  </View>
                )
              })}
            </ScrollView>
          </View>
        )

      case 'suggestions-header':
        return (
          <View className="bg-black px-5 py-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-white">Propositions pour vous</Text>
              <CountryFilter
                countries={countries}
                selectedCountry={countryFilter}
                onChange={setCountryFilter}
              />
            </View>
          </View>
        )

      case 'suggestions-skeleton':
        return (
          <View className="px-5">
            <SuggestionsListSkeleton count={3} />
          </View>
        )

      case 'suggestions-empty':
        return (
          <NoSuggestionsEmpty onCreateIntention={() => router.push('/(Protected)/new-intention')} />
        )

      case 'suggestion':
        return (
          <View className="px-5">
            <SuggestedCard item={item.data} />
          </View>
        )

      default:
        return null
    }
  }

  return (
    <View className="flex-1 bg-black">
      {/* En-tête compact */}
      <View className="bg-black px-5 pt-6">
        <View className="mb-3 flex-row items-center justify-center">
          <Text className="text-2xl font-extrabold text-white">Binôme</Text>
          <Text className="text-2xl font-extrabold" style={{ color: '#EAB308' }}>
            Pay
          </Text>
        </View>
        <HomeHeader user={user} />
        <KycBadge status={user?.kycStatus} />
        <CreateIntentionButton />
      </View>

      {/* Section scrollable avec FlatList */}
      <FlatList
        data={sections}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        renderItem={renderSectionItem}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EAB308"
            colors={['#EAB308']}
            progressBackgroundColor="#0B1220"
          />
        }
        stickyHeaderIndices={
          sections.findIndex((s) => s.type === 'suggestions-header') >= 0
            ? [sections.findIndex((s) => s.type === 'suggestions-header')]
            : []
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  )
}
