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
      <Text className="text-white text-xl font-extrabold">Mes demandes</Text>

      <View className="mt-5 bg-neutral-900 rounded-xl p-4 border border-gray-800">
        <Text className="text-white font-semibold mb-2">Créer une demande</Text>
        <View className="flex-row mb-3">
          <Pressable onPress={() => setType('SEND')} className={`px-3 py-2 rounded-l-lg ${type === 'SEND' ? 'bg-yellow-400' : 'bg-neutral-800'}`}>
            <Text className={`${type === 'SEND' ? 'text-black font-bold' : 'text-white'}`}>Envoyer</Text>
          </Pressable>
          <Pressable onPress={() => setType('RECEIVE')} className={`px-3 py-2 rounded-r-lg ${type === 'RECEIVE' ? 'bg-yellow-400' : 'bg-neutral-800'}`}>
            <Text className={`${type === 'RECEIVE' ? 'text-black font-bold' : 'text-white'}`}>Recevoir</Text>
          </Pressable>
        </View>
        <View className="flex-row gap-3">
          <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="Montant" placeholderTextColor="#9CA3AF" className="flex-1 bg-neutral-800 text-white rounded-lg px-3 py-2" />
          <TextInput value={currency} onChangeText={setCurrency} placeholder="Devise" placeholderTextColor="#9CA3AF" className="w-24 bg-neutral-800 text-white rounded-lg px-3 py-2" />
        </View>
        <View className="flex-row gap-3 mt-3">
          <TextInput value={originCountry} onChangeText={setOriginCountry} placeholder="Pays d'origine" placeholderTextColor="#9CA3AF" className="flex-1 bg-neutral-800 text-white rounded-lg px-3 py-2" />
          <TextInput value={destCountry} onChangeText={setDestCountry} placeholder="Pays de destination" placeholderTextColor="#9CA3AF" className="flex-1 bg-neutral-800 text-white rounded-lg px-3 py-2" />
        </View>
        <Pressable
          onPress={() => {
            const amt = Number(amount) || 0
            if (amt <= 0) return
            addRequest({ type, amount: amt, currency, originCountry, destCountry })
          }}
          className="mt-4 bg-yellow-400 rounded-xl px-5 py-3 items-center"
        >
          <Text className="text-black font-extrabold">Ajouter</Text>
        </Pressable>
      </View>

      <FlatList
        className="mt-6"
        data={requests}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => <Text className="text-gray-400">Aucune demande.</Text>}
        renderItem={({ item }) => (
          <View className="border border-gray-800 rounded-xl p-4 mb-3 bg-neutral-900">
            <View className="flex-row items-center justify-between">
              <Text className="text-white font-semibold">{item.type === 'SEND' ? 'Envoyer' : 'Recevoir'}</Text>
              <Text className="text-yellow-400 font-bold">{item.amount} {item.currency}</Text>
            </View>
            <Text className="text-gray-400 mt-1">{item.originCountry} → {item.destCountry}</Text>
            <Text className="text-gray-500 text-xs mt-1">Statut: {item.status}</Text>
          </View>
        )}
      />
    </View>
  )
}


