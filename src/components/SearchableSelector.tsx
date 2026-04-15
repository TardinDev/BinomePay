import React, { useState, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export interface SelectorOption {
  value: string
  label: string
  icon?: string
  searchTerms?: string[]
}

interface SearchableSelectorProps {
  options: SelectorOption[]
  value?: string
  placeholder?: string
  label?: string
  onChange: (_value: string) => void
  renderOption?: (_option: SelectorOption, _isSelected: boolean) => React.ReactNode
}

export default function SearchableSelector({
  options,
  value,
  placeholder = 'Selectionner...',
  label,
  onChange,
  renderOption,
}: SearchableSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedOption = useMemo(() => options.find((opt) => opt.value === value), [options, value])

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options

    const query = searchQuery.toLowerCase()
    return options.filter((option) => {
      const matchLabel = option.label.toLowerCase().includes(query)
      const matchValue = option.value.toLowerCase().includes(query)
      const matchSearchTerms = option.searchTerms?.some((term) =>
        term.toLowerCase().includes(query)
      )
      return matchLabel || matchValue || matchSearchTerms
    })
  }, [options, searchQuery])

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue)
      setIsOpen(false)
      setSearchQuery('')
    },
    [onChange]
  )

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    setSearchQuery('')
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setSearchQuery('')
  }, [])

  const defaultRenderOption = (option: SelectorOption, isSelected: boolean) => (
    <View className="flex-1 flex-row items-center">
      {option.icon && <Text className="mr-3 text-2xl">{option.icon}</Text>}
      <Text className={`text-base ${isSelected ? 'font-bold text-yellow-400' : 'text-white'}`}>
        {option.label}
      </Text>
      {isSelected && (
        <Ionicons name="checkmark" color="#EAB308" size={20} style={{ marginLeft: 'auto' }} />
      )}
    </View>
  )

  return (
    <>
      {label && <Text className="mb-2 text-sm text-gray-400">{label}</Text>}
      <Pressable
        onPress={handleOpen}
        className="flex-row items-center justify-between rounded-xl px-4 py-4"
        style={{ backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#374151' }}
      >
        <View className="flex-1 flex-row items-center">
          {selectedOption?.icon && <Text className="mr-2 text-xl">{selectedOption.icon}</Text>}
          <Text className={selectedOption ? 'text-white' : 'text-gray-500'}>
            {selectedOption?.label || placeholder}
          </Text>
        </View>
        <Ionicons name="chevron-down" color="#9CA3AF" size={20} />
      </Pressable>

      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 bg-black"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 pb-2 pt-4">
            <Pressable onPress={handleClose} className="p-2">
              <Ionicons name="close" color="#9CA3AF" size={24} />
            </Pressable>
            <Text className="text-lg font-bold text-white">{label || 'Selectionner'}</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Search Input */}
          <View className="px-4 pb-4">
            <View
              className="flex-row items-center rounded-xl px-4"
              style={{ backgroundColor: '#1F2937' }}
            >
              <Ionicons name="search" color="#6B7280" size={20} />
              <TextInput
                className="flex-1 px-3 py-3 text-white"
                placeholder="Rechercher..."
                placeholderTextColor="#6B7280"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                autoCorrect={false}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" color="#6B7280" size={20} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Options List */}
          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item.value}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={() => (
              <View className="items-center py-8">
                <Ionicons name="search-outline" color="#6B7280" size={48} />
                <Text className="mt-4 text-gray-500">Aucun resultat</Text>
              </View>
            )}
            renderItem={({ item }) => {
              const isSelected = item.value === value
              return (
                <Pressable
                  onPress={() => handleSelect(item.value)}
                  className="flex-row items-center border-b px-4 py-4"
                  style={{
                    borderColor: '#1F2937',
                    backgroundColor: isSelected ? '#1F293720' : 'transparent',
                  }}
                >
                  {renderOption
                    ? renderOption(item, isSelected)
                    : defaultRenderOption(item, isSelected)}
                </Pressable>
              )
            }}
          />
        </KeyboardAvoidingView>
      </Modal>
    </>
  )
}

// Predefined country options with flags
export const COUNTRY_OPTIONS: SelectorOption[] = [
  { value: 'FR', label: 'France', icon: '🇫🇷', searchTerms: ['france', 'fr', 'french'] },
  { value: 'SN', label: 'Senegal', icon: '🇸🇳', searchTerms: ['senegal', 'sn', 'dakar'] },
  {
    value: 'CI',
    label: "Cote d'Ivoire",
    icon: '🇨🇮',
    searchTerms: ['cote ivoire', 'ivory', 'ci', 'abidjan'],
  },
  { value: 'ML', label: 'Mali', icon: '🇲🇱', searchTerms: ['mali', 'ml', 'bamako'] },
  {
    value: 'CM',
    label: 'Cameroun',
    icon: '🇨🇲',
    searchTerms: ['cameroun', 'cameroon', 'cm', 'yaounde'],
  },
  {
    value: 'MA',
    label: 'Maroc',
    icon: '🇲🇦',
    searchTerms: ['maroc', 'morocco', 'ma', 'rabat', 'casablanca'],
  },
  { value: 'TN', label: 'Tunisie', icon: '🇹🇳', searchTerms: ['tunisie', 'tunisia', 'tn', 'tunis'] },
  { value: 'DZ', label: 'Algerie', icon: '🇩🇿', searchTerms: ['algerie', 'algeria', 'dz', 'alger'] },
  {
    value: 'BE',
    label: 'Belgique',
    icon: '🇧🇪',
    searchTerms: ['belgique', 'belgium', 'be', 'bruxelles'],
  },
  {
    value: 'CH',
    label: 'Suisse',
    icon: '🇨🇭',
    searchTerms: ['suisse', 'switzerland', 'ch', 'geneva', 'zurich'],
  },
  {
    value: 'DE',
    label: 'Allemagne',
    icon: '🇩🇪',
    searchTerms: ['allemagne', 'germany', 'de', 'berlin'],
  },
  { value: 'ES', label: 'Espagne', icon: '🇪🇸', searchTerms: ['espagne', 'spain', 'es', 'madrid'] },
  { value: 'IT', label: 'Italie', icon: '🇮🇹', searchTerms: ['italie', 'italy', 'it', 'rome'] },
  {
    value: 'GB',
    label: 'Royaume-Uni',
    icon: '🇬🇧',
    searchTerms: ['royaume uni', 'uk', 'england', 'london'],
  },
  {
    value: 'US',
    label: 'Etats-Unis',
    icon: '🇺🇸',
    searchTerms: ['etats unis', 'usa', 'us', 'america'],
  },
  {
    value: 'CA',
    label: 'Canada',
    icon: '🇨🇦',
    searchTerms: ['canada', 'ca', 'montreal', 'toronto'],
  },
]

// Predefined currency options
export const CURRENCY_OPTIONS: SelectorOption[] = [
  { value: 'EUR', label: 'Euro (EUR)', icon: '💶', searchTerms: ['euro', 'eur'] },
  { value: 'XOF', label: 'Franc CFA (XOF)', icon: '💵', searchTerms: ['cfa', 'xof', 'fcfa'] },
  {
    value: 'XAF',
    label: 'Franc CFA Central (XAF)',
    icon: '💵',
    searchTerms: ['cfa', 'xaf', 'fcfa'],
  },
  { value: 'MAD', label: 'Dirham (MAD)', icon: '💵', searchTerms: ['dirham', 'mad', 'maroc'] },
  {
    value: 'TND',
    label: 'Dinar tunisien (TND)',
    icon: '💵',
    searchTerms: ['dinar', 'tnd', 'tunisie'],
  },
  {
    value: 'DZD',
    label: 'Dinar algerien (DZD)',
    icon: '💵',
    searchTerms: ['dinar', 'dzd', 'algerie'],
  },
  { value: 'USD', label: 'Dollar US (USD)', icon: '💵', searchTerms: ['dollar', 'usd', 'us'] },
  {
    value: 'GBP',
    label: 'Livre Sterling (GBP)',
    icon: '💷',
    searchTerms: ['livre', 'gbp', 'pound', 'sterling'],
  },
  {
    value: 'CHF',
    label: 'Franc suisse (CHF)',
    icon: '💵',
    searchTerms: ['franc', 'chf', 'suisse'],
  },
  {
    value: 'CAD',
    label: 'Dollar canadien (CAD)',
    icon: '💵',
    searchTerms: ['dollar', 'cad', 'canada'],
  },
]
