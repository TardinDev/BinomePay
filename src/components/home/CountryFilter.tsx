import React, { useMemo, useState } from 'react'
import { Modal, Pressable, Text, View, FlatList } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const FRANCOPHONE_COUNTRIES = [
  'Algérie', 'Belgique', 'Bénin', 'Burkina Faso', 'Burundi', 'Cameroun', 'Canada', 'Comores',
  'Congo', 'République Démocratique du Congo', 'Côte d\'Ivoire', 'Djibouti', 'Gabon', 'Guinée',
  'Haïti', 'Luxembourg', 'Madagascar', 'Mali', 'Maroc', 'Monaco', 'Niger', 'Rwanda', 'Sénégal',
  'Seychelles', 'Suisse', 'Tchad', 'Togo', 'Tunisie', 'Vanuatu', 'Liban', 'Mauritanie',
  'République centrafricaine', 'Guinée équatoriale', 'Congo-Brazzaville'
]

const EUROPE_COUNTRIES = [
  'Albanie', 'Allemagne', 'Andorre', 'Autriche', 'Belgique', 'Biélorussie', 'Bosnie-Herzégovine',
  'Bulgarie', 'Chypre', 'Croatie', 'Danemark', 'Espagne', 'Estonie', 'Finlande', 'France', 'Grèce',
  'Hongrie', 'Irlande', 'Islande', 'Italie', 'Kosovo', 'Lettonie', 'Liechtenstein', 'Lituanie',
  'Luxembourg', 'Macédoine du Nord', 'Malte', 'Moldavie', 'Monaco', 'Monténégro', 'Norvège',
  'Pays-Bas', 'Pologne', 'Portugal', 'République tchèque', 'Roumanie', 'Royaume-Uni', 'Russie',
  'Saint-Marin', 'Serbie', 'Slovaquie', 'Slovénie', 'Suisse', 'Ukraine', 'Vatican'
]

const NORTH_AMERICA_COUNTRIES = [
  'Antigua-et-Barbuda', 'Bahamas', 'Barbade', 'Belize', 'Bermudes', 'Canada', 'Costa Rica', 'Cuba',
  'Dominique', 'El Salvador', 'États-Unis', 'Grenade', 'Guatemala', 'Haïti', 'Honduras', 'Jamaïque',
  'Mexique', 'Nicaragua', 'Panama', 'République dominicaine', 'Saint-Christophe-et-Niévès',
  'Saint-Vincent-et-les-Grenadines', 'Sainte-Lucie', 'Trinité-et-Tobago'
]

const ASIA_ADDITIONAL = ['Chine', 'Japon', 'Corée du Sud']

type Props = {
  countries: string[]
  selectedCountry: string | null
  onChange: (country: string | null) => void
}

export default function CountryFilter({ countries, selectedCountry, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const uniqueCountries = useMemo(
    () => Array.from(
      new Set([
        ...(countries ?? []),
        ...FRANCOPHONE_COUNTRIES,
        ...EUROPE_COUNTRIES,
        ...NORTH_AMERICA_COUNTRIES,
        ...ASIA_ADDITIONAL,
      ])
    ).sort(),
    [countries]
  )
  const label = selectedCountry ? `Vers ${selectedCountry}` : 'Tout'

  return (
    <View className="flex-row items-center">
      <Pressable onPress={() => setOpen(true)} className={`px-3 py-1 rounded-full border flex-row items-center ${selectedCountry ? 'bg-zinc-800 border-amber-400' : 'bg-amber-500/15 border-amber-400'}`}>
        <Text className={`font-semibold text-xs ${selectedCountry ? 'text-zinc-200' : 'text-yellow-400'}`}>{label}</Text>
        <Ionicons name="chevron-down" size={14} color={selectedCountry ? '#E5E7EB' : '#FACC15'} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/50" onPress={() => setOpen(false)}>
          <View className="absolute left-4 right-4 top-16 bottom-16 rounded-2xl bg-[#0B0F1A] border border-zinc-800 p-4">
            <Text className="text-white text-base font-extrabold mb-3">Filtrer par destination</Text>
            <FlatList
              className="flex-1"
              data={["Tous les pays", ...uniqueCountries]}
              keyExtractor={(item) => item}
              ItemSeparatorComponent={() => <View className="h-2" />}
              renderItem={({ item }) => {
                const isAll = item === 'Tous les pays'
                const isSelected = (selectedCountry === null && isAll) || selectedCountry === item
                return (
                  <Pressable
                    onPress={() => {
                      onChange(isAll ? null : item)
                      setOpen(false)
                    }}
                    className={`flex-row items-center justify-between p-3 rounded-xl border ${isSelected ? 'bg-zinc-800 border-amber-400' : 'bg-zinc-900 border-zinc-800'}`}
                  >
                    <Text className="text-white text-sm">{item}</Text>
                    <View className={`w-3 h-3 rounded-full ${ isSelected ? 'bg-amber-400' : 'bg-zinc-600' }`} />
                  </Pressable>
                )
              }}
              ListFooterComponent={<View className="h-2" />}
            />
            <Pressable onPress={() => setOpen(false)} className="mt-2 items-center py-2 rounded-xl bg-zinc-800">
              <Text className="text-zinc-200 font-semibold">Fermer</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}


