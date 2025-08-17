import React, { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import useAppStore from "@/store/useAppStore";
import HomeHeader from "@/components/home/HomeHeader";
import KycBadge from "@/components/home/KycBadge";
import CreateIntentionButton from "@/components/home/CreateIntentionButton";
import RecentMatchesList from "@/components/home/RecentMatchesList";
import SuggestedList from "@/components/home/SuggestedList";
import CountryFilter from "@/components/home/CountryFilter";
import "../../../../global.css";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const user = useAppStore((s) => s.user)
  const matches = useAppStore((s) => s.matches)
  const [suggested, setSuggested] = useState<any[]>([])
  const [countryFilter, setCountryFilter] = useState<string | null>(null)
  
  const countries = useMemo(() => {
    const names = suggested.map((s) => s.dest_country ?? s.destCountryName)
    return Array.from(new Set(names))
  }, [suggested])
  
  const filteredSuggested = useMemo(() => {
    const list = countryFilter
      ? suggested.filter((s) => (s.dest_country ?? s.destCountryName) === countryFilter)
      : suggested
    return list
  }, [suggested, countryFilter])

  // Chargement initial + realtime des intentions "ouvertes" des autres (RECEIVE) inversées
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null
    ;(async () => {
      const { data: authData } = await supabase.auth.getUser()
      const currentUserId = authData.user?.id
      if (!currentUserId) return

      // chargement initial: propositions ouvertes opposées (exemple basique: RECEIVE)
      const { data } = await supabase
        .from('intents')
        .select('id, amount, currency, origin_country, dest_country, user_id, created_at')
        .eq('status', 'OPEN')
        .eq('direction', 'RECEIVE')
        .neq('user_id', currentUserId)
        .order('created_at', { ascending: false })
      setSuggested(data ?? [])

      // realtime sur INSERT/UPDATE/DELETE
      channel = supabase
        .channel('intents-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'intents' }, async (_payload) => {
          const { data } = await supabase
            .from('intents')
            .select('id, amount, currency, origin_country, dest_country, user_id, created_at')
            .eq('status', 'OPEN')
            .eq('direction', 'RECEIVE')
            .neq('user_id', currentUserId)
            .order('created_at', { ascending: false })
          setSuggested(data ?? [])
        })
        .subscribe()
    })()
    return () => {
      channel?.unsubscribe()
    }
  }, [])

  return (
    <View className="flex-1 bg-black px-5 pt-6 pb-2">

      <View className="w-full items-center mb-4">
        <Text className="text-white text-5xl font-extrabold">Binome Pay</Text>
      </View>
      <HomeHeader user={user} />
      <KycBadge status={user?.kycStatus} />
      <CreateIntentionButton />

      <RecentMatchesList data={matches} />

      {/* Propositions pour vous */}
      <View className="flex-row items-center justify-between mt-4 mb-2">
        <Text className="text-white text-lg font-bold">Propositions pour vous</Text>
        <CountryFilter countries={countries} selectedCountry={countryFilter} onChange={setCountryFilter} />
      </View>

      { /* Liste des propositions */}
      <SuggestedList data={filteredSuggested.map((s) => ({
        id: s.id,
        amount: Number(s.amount ?? 0),
        currency: s.currency,
        destCountryName: s.dest_country ?? s.destCountryName,
        senderName: s.user_id?.slice(0, 8) ?? 'Utilisateur',
        createdAt: new Date(s.created_at ?? Date.now()).getTime(),
      }))} />
    </View>
  )
}

