import React, { useMemo, useState } from "react";
import { Text, View, ScrollView } from "react-native";
import useAppStore from "@/store/useAppStore";
import HomeHeader from "@/components/home/HomeHeader";
import KycBadge from "@/components/home/KycBadge";
import CreateIntentionButton from "@/components/home/CreateIntentionButton";
import RecentMatchesList from "@/components/home/RecentMatchesList";
import SuggestedList from "@/components/home/SuggestedList";
import CountryFilter from "@/components/home/CountryFilter";
import "../../../../global.css";

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

  // Pour production: chargement depuis Supabase
  // useEffect(() => {
  //   let channel: ReturnType<typeof supabase.channel> | null = null
  //   ;(async () => {
  //     const { data: authData } = await supabase.auth.getUser()
  //     const currentUserId = authData.user?.id
  //     if (!currentUserId) return

  //     // chargement initial: propositions ouvertes opposées (exemple basique: RECEIVE)
  //     const { data } = await supabase
  //       .from('intents')
  //       .select('id, amount, currency, origin_country, dest_country, user_id, created_at')
  //       .eq('status', 'OPEN')
  //       .eq('direction', 'RECEIVE')
  //       .neq('user_id', currentUserId)
  //       .order('created_at', { ascending: false })
  //     setSuggested(data ?? [])

  //     // realtime sur INSERT/UPDATE/DELETE
  //     channel = supabase
  //       .channel('intents-realtime')
  //       .on('postgres_changes', { event: '*', schema: 'public', table: 'intents' }, async (_payload) => {
  //         const { data } = await supabase
  //           .from('intents')
  //           .select('id, amount, currency, origin_country, dest_country, user_id, created_at')
  //           .eq('status', 'OPEN')
  //           .eq('direction', 'RECEIVE')
  //           .neq('user_id', currentUserId)
  //           .order('created_at', { ascending: false })
  //         setSuggested(data ?? [])
  //       })
  //       .subscribe()
  //   })()
  //   return () => {
  //     channel?.unsubscribe()
  //   }
  // }, [])

  return (
    <View className="flex-1 bg-black px-5 pt-6">

      <View className="w-full items-center mb-4">
        <Text className="text-white text-5xl font-extrabold">Binome Pay</Text>
      </View>
      <HomeHeader user={user} />
      <KycBadge status={user?.kycStatus} />
      <CreateIntentionButton />

      <RecentMatchesList data={matches} />

      {/* Mes intentions */}
      {requests.length > 0 && (
        <>
          <View className="mt-3 mb-2">
            <Text className="text-white text-lg font-bold">Mes intentions</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-0"
            contentContainerStyle={{ paddingHorizontal: 0 }}
          >
            {requests.map((req, index) => (
              <View 
                key={req.id} 
                className="border border-gray-800 rounded-lg p-2 bg-neutral-900"
                style={{ 
                  width: 140,
                  height: 80,
                  marginRight: index === requests.length - 1 ? 0 : 10
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
        </>
      )}

      {/* Propositions pour vous */}
      <View className="flex-row items-center justify-between -mt-80 mb-2">
        <Text className="text-white text-lg font-bold">Propositions pour vous</Text>
        <CountryFilter countries={countries} selectedCountry={countryFilter} onChange={setCountryFilter} />
      </View>

      { /* Liste des propositions - Scroll vertical */}
      <View className="flex-1">
        <SuggestedList data={filteredSuggested} />
      </View>
    </View>
  )
}

