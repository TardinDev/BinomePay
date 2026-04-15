import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, FlatList } from 'react-native'
import useAppStore from '@/store/useAppStore'

export default function RequestsPage() {
  const requests = useAppStore((s) => s.requests)
  const addRequest = useAppStore((s) => s.addRequest)

  const [type, setType] = useState<'SEND' | 'RECEIVE'>('SEND')
  const [amount, setAmount] = useState('100')
  const [currency, setCurrency] = useState('EUR')
  const [originCountry, setOriginCountry] = useState('France')
  const [destCountry, setDestCountry] = useState('Sénégal')

  return (
    <View className="flex-1 bg-black px-5 pt-6">
      <Text className="text-xl font-extrabold text-white">Mes demandes</Text>

      <View className="mt-5 rounded-xl border border-gray-800 bg-neutral-900 p-4">
        <Text className="mb-2 font-semibold text-white">Créer une demande</Text>
        <View className="mb-3 flex-row">
          <Pressable
            onPress={() => setType('SEND')}
            className={`rounded-l-lg px-3 py-2 ${type === 'SEND' ? 'bg-yellow-400' : 'bg-neutral-800'}`}
          >
            <Text className={`${type === 'SEND' ? 'font-bold text-black' : 'text-white'}`}>
              Envoyer
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setType('RECEIVE')}
            className={`rounded-r-lg px-3 py-2 ${type === 'RECEIVE' ? 'bg-yellow-400' : 'bg-neutral-800'}`}
          >
            <Text className={`${type === 'RECEIVE' ? 'font-bold text-black' : 'text-white'}`}>
              Recevoir
            </Text>
          </Pressable>
        </View>
        <View className="flex-row gap-3">
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Montant"
            placeholderTextColor="#9CA3AF"
            className="flex-1 rounded-lg bg-neutral-800 px-3 py-2 text-white"
          />
          <TextInput
            value={currency}
            onChangeText={setCurrency}
            placeholder="Devise"
            placeholderTextColor="#9CA3AF"
            className="w-24 rounded-lg bg-neutral-800 px-3 py-2 text-white"
          />
        </View>
        <View className="mt-3 flex-row gap-3">
          <TextInput
            value={originCountry}
            onChangeText={setOriginCountry}
            placeholder="Pays d'origine"
            placeholderTextColor="#9CA3AF"
            className="flex-1 rounded-lg bg-neutral-800 px-3 py-2 text-white"
          />
          <TextInput
            value={destCountry}
            onChangeText={setDestCountry}
            placeholder="Pays de destination"
            placeholderTextColor="#9CA3AF"
            className="flex-1 rounded-lg bg-neutral-800 px-3 py-2 text-white"
          />
        </View>
        <Pressable
          onPress={() => {
            const amt = Number(amount) || 0
            if (amt <= 0) return
            addRequest({ type, amount: amt, currency, originCountry, destCountry })
          }}
          className="mt-4 items-center rounded-xl bg-yellow-400 px-5 py-3"
        >
          <Text className="font-extrabold text-black">Ajouter</Text>
        </Pressable>
      </View>

      <FlatList
        className="mt-6"
        data={requests}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => <Text className="text-gray-400">Aucune demande.</Text>}
        renderItem={({ item }) => (
          <View className="mb-3 rounded-xl border border-gray-800 bg-neutral-900 p-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-semibold text-white">
                {item.type === 'SEND' ? 'Envoyer' : 'Recevoir'}
              </Text>
              <Text className="font-bold text-yellow-400">
                {item.amount} {item.currency}
              </Text>
            </View>
            <Text className="mt-1 text-gray-400">
              {item.originCountry} → {item.destCountry}
            </Text>
            <Text className="mt-1 text-xs text-gray-500">Statut: {item.status}</Text>
          </View>
        )}
      />
    </View>
  )
}
