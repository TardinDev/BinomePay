import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
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
  const suggested = useAppStore((s) => s.suggested)
  const [countryFilter, setCountryFilter] = useState<string | null>(null)
  const countries = useMemo(() => suggested.map(s => s.destCountryName), [suggested])
  const filteredSuggested = useMemo(
    () => (countryFilter ? suggested.filter(s => s.destCountryName === countryFilter) : suggested),
    [suggested, countryFilter]
  )

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
      <SuggestedList data={filteredSuggested} />
    </View>
  )
}

