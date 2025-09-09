import React, { useMemo, useState } from "react";
import { Text, View, ScrollView, FlatList } from "react-native";
import useAppStore from "@/store/useAppStore";
import HomeHeader from "@/components/home/HomeHeader";
import KycBadge from "@/components/home/KycBadge";
import CreateIntentionButton from "@/components/home/CreateIntentionButton";
import RecentMatchesList from "@/components/home/RecentMatchesList";
import SuggestedCard from "@/components/home/SuggestedCard";
import CountryFilter from "@/components/home/CountryFilter";

export default function HomePage() {
  const user = useAppStore((s) => s.user)
  const matches = useAppStore((s) => s.matches)
  const storeSuggested = useAppStore((s) => s.suggested)
  const requests = useAppStore((s) => s.requests)
  const [countryFilter, setCountryFilter] = useState<string | null>(null)
  
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



  // Créer les sections pour la FlatList
  const sections = [
    { type: 'matches', data: matches },
    ...(requests.length > 0 ? [{ type: 'intentions', data: requests }] : []),
    { type: 'suggestions-header', data: [] },
    ...filteredSuggested.map(item => ({ type: 'suggestion', data: item }))
  ]

  const renderSectionItem = ({ item }: { item: any }) => {
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
            <View className="mt-3 mb-2">
              <Text className="text-white text-lg font-bold">Mes intentions</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="mb-4"
              contentContainerStyle={{ paddingHorizontal: 0 }}
            >
              {item.data.map((req: any, index: number) => (
                <View 
                  key={req.id} 
                  className="border border-gray-800 rounded-lg p-2 bg-neutral-900"
                  style={{ 
                    width: 140,
                    height: 80,
                    marginRight: index === item.data.length - 1 ? 0 : 10
                  }}
                >
                  <View className="items-center justify-center h-full">
                    <Text className="text-yellow-400 font-bold text-xs">
                      {req.type === 'SEND' ? 'ENVOYER' : 'RECEVOIR'}
                    </Text>
                    <Text className="text-white text-base font-bold">{req.amount} {req.currency}</Text>
                    <Text className="text-gray-400 text-xs text-center" numberOfLines={1}>
                      {req.originCountry} → {req.destCountry}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )

      case 'suggestions-header':
        return (
          <View className="bg-black px-5 py-3 sticky top-0">
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-lg font-bold">Propositions pour vous</Text>
              <CountryFilter countries={countries} selectedCountry={countryFilter} onChange={setCountryFilter} />
            </View>
          </View>
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
      {/* Section fixe en haut */}
      <View className="px-5 pt-6 bg-black">
        <View className="w-full items-center mb-4">
          <Text className="text-white text-5xl font-extrabold">Binome Pay</Text>
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
        stickyHeaderIndices={sections.findIndex(s => s.type === 'suggestions-header') >= 0 ? [sections.findIndex(s => s.type === 'suggestions-header')] : []}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={() => (
          <View className="px-5">
            <Text className="text-gray-400">Aucune proposition pour le moment.</Text>
          </View>
        )}
      />
    </View>
  )
}

