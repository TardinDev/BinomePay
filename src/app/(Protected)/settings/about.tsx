import React from 'react'
import { ScrollView, Text, View, Pressable, Linking, Alert } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import Logo from '@/components/Logo'

const PRIVACY_URL = 'https://binomepay.com/privacy'
const TERMS_URL = 'https://binomepay.com/terms'

export default function AboutScreen() {
  const appVersion = Constants.expoConfig?.version ?? '1.0.1'
  const androidVersionCode = Constants.expoConfig?.android?.versionCode ?? '—'

  const openUrl = async (url: string, fallbackLabel: string) => {
    const ok = await Linking.canOpenURL(url)
    if (ok) Linking.openURL(url)
    else Alert.alert(fallbackLabel, url)
  }

  return (
    <ScrollView className="flex-1 bg-black px-5 pt-6" contentContainerStyle={{ paddingBottom: 60 }}>
      <View className="mb-6 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="mr-3 rounded-full p-2"
          style={{ backgroundColor: '#111827' }}
        >
          <Ionicons name="arrow-back" color="#E5E7EB" size={20} />
        </Pressable>
        <Text className="text-2xl font-extrabold text-white">À propos</Text>
      </View>

      <View
        className="mb-6 items-center rounded-2xl border bg-neutral-900 p-6"
        style={{ borderColor: '#334155' }}
      >
        <Logo size={88} showWordmark wordmarkSize={22} />
        <Text className="mt-1 text-xs text-gray-400">
          Version {appVersion} · build {androidVersionCode}
        </Text>
      </View>

      <View className="rounded-2xl border bg-neutral-900" style={{ borderColor: '#334155' }}>
        <Pressable
          onPress={() => openUrl(PRIVACY_URL, 'Politique de confidentialité')}
          className="flex-row items-center p-4"
          style={{ borderBottomWidth: 1, borderBottomColor: '#1F2937' }}
        >
          <Ionicons name="shield-checkmark" color="#60A5FA" size={20} />
          <Text className="ml-3 flex-1 text-white">Politique de confidentialité</Text>
          <Ionicons name="open-outline" color="#6B7280" size={18} />
        </Pressable>
        <Pressable
          onPress={() => openUrl(TERMS_URL, "Conditions d'utilisation")}
          className="flex-row items-center p-4"
          style={{ borderBottomWidth: 1, borderBottomColor: '#1F2937' }}
        >
          <Ionicons name="document-text" color="#60A5FA" size={20} />
          <Text className="ml-3 flex-1 text-white">Conditions d'utilisation</Text>
          <Ionicons name="open-outline" color="#6B7280" size={18} />
        </Pressable>
        <Pressable
          onPress={() => openUrl('https://binomepay.com', 'Site web')}
          className="flex-row items-center p-4"
        >
          <Ionicons name="globe" color="#60A5FA" size={20} />
          <Text className="ml-3 flex-1 text-white">Site officiel</Text>
          <Ionicons name="open-outline" color="#6B7280" size={18} />
        </Pressable>
      </View>

      <Text className="mt-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} BinomePay. Tous droits réservés.
      </Text>
    </ScrollView>
  )
}
