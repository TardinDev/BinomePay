import React, { useEffect, useState } from 'react'
import { ScrollView, Text, View, Pressable, Switch, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

type IconName = ComponentProps<typeof Ionicons>['name']

const STORAGE_KEY = '@binomepay_notification_prefs'

type Prefs = {
  matches: boolean
  messages: boolean
  suggestions: boolean
  kyc: boolean
}

const DEFAULT_PREFS: Prefs = {
  matches: true,
  messages: true,
  suggestions: true,
  kyc: true,
}

export default function NotificationsSettings() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY)
        if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) })
      } catch (e) {
        if (__DEV__) console.error('load prefs', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const toggle = async (key: keyof Prefs) => {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch (e) {
      if (__DEV__) console.error('save prefs', e)
    }
  }

  const rows: Array<{ key: keyof Prefs; label: string; desc: string; icon: IconName }> = [
    {
      key: 'matches',
      label: 'Nouveaux matches',
      desc: 'Soyez prévenu quand un binôme est trouvé',
      icon: 'people',
    },
    {
      key: 'messages',
      label: 'Messages',
      desc: 'Nouveaux messages dans vos conversations',
      icon: 'chatbubbles',
    },
    {
      key: 'suggestions',
      label: 'Suggestions',
      desc: 'Propositions pouvant correspondre à vos intentions',
      icon: 'sparkles',
    },
    {
      key: 'kyc',
      label: 'Vérification KYC',
      desc: "Statut de la vérification d'identité",
      icon: 'shield-checkmark',
    },
  ]

  return (
    <ScrollView className="flex-1 bg-black px-5 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="mb-6 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="mr-3 rounded-full p-2"
          style={{ backgroundColor: '#111827' }}
        >
          <Ionicons name="arrow-back" color="#E5E7EB" size={20} />
        </Pressable>
        <Text className="text-2xl font-extrabold text-white">Notifications</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#EAB308" />
      ) : (
        <View className="rounded-2xl border bg-neutral-900" style={{ borderColor: '#334155' }}>
          {rows.map((row, idx) => (
            <View
              key={row.key}
              className="flex-row items-center p-4"
              style={{
                borderBottomWidth: idx < rows.length - 1 ? 1 : 0,
                borderBottomColor: '#1F2937',
              }}
            >
              <View
                className="mr-3 rounded-full p-2"
                style={{ backgroundColor: '#0B1220', borderWidth: 1, borderColor: '#1F2937' }}
              >
                <Ionicons name={row.icon} color="#EAB308" size={18} />
              </View>
              <View className="flex-1 pr-3">
                <Text className="font-semibold text-white">{row.label}</Text>
                <Text className="text-xs text-gray-400">{row.desc}</Text>
              </View>
              <Switch
                value={prefs[row.key]}
                onValueChange={() => toggle(row.key)}
                trackColor={{ false: '#374151', true: '#EAB308' }}
                thumbColor={prefs[row.key] ? '#FDE68A' : '#9CA3AF'}
              />
            </View>
          ))}
        </View>
      )}

      <Text className="mt-4 text-xs text-gray-500">
        Les notifications peuvent aussi être gérées dans les paramètres système de votre appareil.
      </Text>
    </ScrollView>
  )
}
