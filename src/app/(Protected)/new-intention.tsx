import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, Alert, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import useAppStore from '@/store/useAppStore'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '@/lib/supabase'

export default function NewIntentionPage() {

  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false)
  const [originCountry, setOriginCountry] = useState('France')
  const [destCountry, setDestCountry] = useState('Sénégal')
  const [isOriginOpen, setIsOriginOpen] = useState(false)
  const [isDestOpen, setIsDestOpen] = useState(false)

  const currencyOptions = [
    'EUR', 'USD', 'GBP', 'XOF', 'XAF', 'MAD', 'NGN', 'GHS', 'KES', 'CFA'
  ]

  const countryOptions = [
    'Gabon',
    'France',
    'Sénégal',
    'Côte d’Ivoire',
    'Maroc',
    'Cameroun',
    'Mali',
    'Bénin',
    'Togo',
    'Guinée',
    'Burkina Faso',
    'République Démocratique du Congo',
    'Ghana',
    'Nigeria',
    'Kenya',
  ]

  const isValid = () => {
    const a = Number(amount)
    return Number.isFinite(a) && a > 0 && currency.trim().length > 0 && originCountry.trim().length > 0 && destCountry.trim().length > 0
  }

  const handleSubmit = async () => {
    if (!isValid()) {
      Alert.alert('Champs invalides', 'Veuillez vérifier le montant et les champs obligatoires.')
      return
    }
    const { data: userData, error: userErr } = await supabase.auth.getUser()
    if (userErr || !userData.user?.id) {
      Alert.alert('Session requise', 'Veuillez vous reconnecter.')
      router.replace('/(auth)/login')
      return
    }
    const userId = userData.user.id

    const { error } = await supabase
      .from('intents')
      .insert([
        {
          user_id: userId,
          direction: 'SEND',
          amount: Number(amount),
          currency,
          origin_country: originCountry,
          dest_country: destCountry,
          status: 'OPEN',
        },
      ])
    if (error) {
      Alert.alert('Erreur', error.message)
      return
    }
    router.replace('/(Protected)/intention-success')
  }

  return (
    <ScrollView className="flex-1 bg-black px-5 pt-6" contentContainerStyle={{ paddingBottom: 36 }}>
      <View className="flex-row items-center mb-3">
        <Pressable onPress={() => router.back()} className="mr-3" style={{ padding: 10, borderRadius: 9999, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937' }}>
          <Ionicons name="arrow-back" color="#E5E7EB" size={20} />
        </Pressable>
      </View>

      <View className="w-full items-center mb-5">
        <Text className="text-white text-3xl font-extrabold">Binome Pay</Text>
        <Text className="text-gray-400 mt-1 text-xs">Créer une nouvelle intention</Text>
      </View>

      <View className="border border-gray-800 rounded-2xl p-4 bg-neutral-900">
        <Text className="text-gray-300 mb-2">Montant</Text>
        <View className="flex-row items-center bg-black/30 rounded-xl border border-gray-700 px-4 py-3">
          <Ionicons name="cash-outline" color="#9CA3AF" size={18} />
          <TextInput
            placeholder="Ex: 150"
            placeholderTextColor="#6B7280"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            className="text-white ml-3 flex-1"
          />
        </View>

        <Text className="text-gray-300 mb-2 mt-4">Devise</Text>
        <Pressable
          onPress={() => setIsCurrencyOpen((v) => !v)}
          className="rounded-xl border border-gray-700 bg-black/30 px-4 py-3 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <Ionicons name="pricetags-outline" color="#9CA3AF" size={18} />
            <Text className="text-white font-semibold ml-3">{currency}</Text>
          </View>
          <Ionicons name={isCurrencyOpen ? 'chevron-up' : 'chevron-down'} color="#9CA3AF" size={18} />
        </Pressable>
        {isCurrencyOpen && (
          <View className="mt-2 border border-gray-700 rounded-xl overflow-hidden" style={{ backgroundColor: '#0B0F1A' }}>
            {currencyOptions.map((c, idx) => (
              <Pressable
                key={c}
                onPress={() => { setCurrency(c); setIsCurrencyOpen(false) }}
                className="px-4 py-3 flex-row items-center justify-between"
                style={{ borderBottomWidth: idx === currencyOptions.length - 1 ? 0 : 1, borderBottomColor: '#111827' }}
              >
                <Text className="text-white">{c}</Text>
                {c === currency && <Ionicons name="checkmark" size={18} color="#EAB308" />}
              </Pressable>
            ))}
          </View>
        )}

        <Text className="text-gray-300 mb-2 mt-4">Pays d'origine</Text>
        <Pressable
          onPress={() => { setIsOriginOpen((v) => !v); if (isDestOpen) setIsDestOpen(false) }}
          className="rounded-xl border border-gray-700 bg-black/30 px-4 py-3 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <Ionicons name="airplane-outline" color="#9CA3AF" size={18} />
            <Text className="text-white font-semibold ml-3">{originCountry}</Text>
          </View>
          <Ionicons name={isOriginOpen ? 'chevron-up' : 'chevron-down'} color="#9CA3AF" size={18} />
        </Pressable>
        {isOriginOpen && (
          <View className="mt-2 border border-gray-700 rounded-xl overflow-hidden" style={{ backgroundColor: '#0B0F1A' }}>
            {countryOptions.map((c, idx) => (
              <Pressable
                key={`origin-${c}`}
                onPress={() => { setOriginCountry(c); setIsOriginOpen(false) }}
                className="px-4 py-3 flex-row items-center justify-between"
                style={{ borderBottomWidth: idx === countryOptions.length - 1 ? 0 : 1, borderBottomColor: '#111827' }}
              >
                <Text className="text-white">{c}</Text>
                {c === originCountry && <Ionicons name="checkmark" size={18} color="#EAB308" />}
              </Pressable>
            ))}
          </View>
        )}

        <Text className="text-gray-300 mb-2 mt-4">Pays de destination</Text>
        <Pressable
          onPress={() => { setIsDestOpen((v) => !v); if (isOriginOpen) setIsOriginOpen(false) }}
          className="rounded-xl border border-gray-700 bg-black/30 px-4 py-3 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <Ionicons name="flag-outline" color="#9CA3AF" size={18} />
            <Text className="text-white font-semibold ml-3">{destCountry}</Text>
          </View>
          <Ionicons name={isDestOpen ? 'chevron-up' : 'chevron-down'} color="#9CA3AF" size={18} />
        </Pressable>
        {isDestOpen && (
          <View className="mt-2 border border-gray-700 rounded-xl overflow-hidden" style={{ backgroundColor: '#0B0F1A' }}>
            {countryOptions.map((c, idx) => (
              <Pressable
                key={`dest-${c}`}
                onPress={() => { setDestCountry(c); setIsDestOpen(false) }}
                className="px-4 py-3 flex-row items-center justify-between"
                style={{ borderBottomWidth: idx === countryOptions.length - 1 ? 0 : 1, borderBottomColor: '#111827' }}
              >
                <Text className="text-white">{c}</Text>
                {c === destCountry && <Ionicons name="checkmark" size={18} color="#EAB308" />}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <Pressable onPress={handleSubmit} disabled={!isValid()} className="rounded-xl mt-6 overflow-hidden">
        <LinearGradient
          colors={isValid() ? ['#FDE68A', '#F59E0B'] : ['#9CA3AF', '#6B7280']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12 }}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="checkmark-circle" color="#111827" size={20} />
            <Text className="ml-2 text-black font-extrabold text-base">Créer</Text>
          </View>
        </LinearGradient>
      </Pressable>
    </ScrollView>
  )
}


