import React from 'react'
import { ScrollView, Text, View, Pressable, Linking, Alert } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const SUPPORT_EMAIL = 'support@binomepay.com'
const WEBSITE = 'https://binomepay.com'

const FAQ = [
  {
    q: 'Comment fonctionne BinomePay ?',
    a: "Créez une intention (envoyer ou recevoir une devise), l'app vous propose des binômes compatibles. Échangez ensuite en toute sécurité.",
  },
  {
    q: 'BinomePay prend-elle des frais ?',
    a: "Non, l'application est gratuite. Vous convenez directement du taux avec votre binôme, sans frais bancaire.",
  },
  {
    q: 'Comment est assurée la sécurité ?',
    a: 'Chaque utilisateur doit se vérifier via KYC. Un système de notation et de signalement protège la communauté.',
  },
  {
    q: 'Comment signaler un utilisateur ?',
    a: "Sur le profil du binôme ou dans une conversation, utilisez l'option Signaler. Notre équipe vérifie chaque signalement.",
  },
  {
    q: 'Puis-je supprimer mon compte ?',
    a: 'Oui, depuis Profil > Supprimer mon compte. La suppression est immédiate et irréversible.',
  },
]

export default function HelpScreen() {
  const openMail = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=Support%20BinomePay`
    const supported = await Linking.canOpenURL(url)
    if (supported) Linking.openURL(url)
    else Alert.alert('Contact', SUPPORT_EMAIL)
  }

  const openWebsite = async () => {
    const supported = await Linking.canOpenURL(WEBSITE)
    if (supported) Linking.openURL(WEBSITE)
    else Alert.alert('Site web', WEBSITE)
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
        <Text className="text-2xl font-extrabold text-white">Aide & Support</Text>
      </View>

      <View
        className="mb-6 rounded-2xl border bg-neutral-900 p-5"
        style={{ borderColor: '#334155' }}
      >
        <Text className="mb-3 text-lg font-bold text-white">Nous contacter</Text>
        <Pressable
          onPress={openMail}
          className="mb-2 flex-row items-center rounded-xl p-3"
          style={{ backgroundColor: '#0B1220' }}
        >
          <Ionicons name="mail" color="#EAB308" size={20} />
          <Text className="ml-3 flex-1 text-white">{SUPPORT_EMAIL}</Text>
          <Ionicons name="chevron-forward" color="#6B7280" size={18} />
        </Pressable>
        <Pressable
          onPress={openWebsite}
          className="flex-row items-center rounded-xl p-3"
          style={{ backgroundColor: '#0B1220' }}
        >
          <Ionicons name="globe" color="#60A5FA" size={20} />
          <Text className="ml-3 flex-1 text-white">{WEBSITE}</Text>
          <Ionicons name="chevron-forward" color="#6B7280" size={18} />
        </Pressable>
      </View>

      <Text className="mb-3 text-lg font-bold text-white">Questions fréquentes</Text>
      {FAQ.map((item, idx) => (
        <View
          key={idx}
          className="mb-3 rounded-2xl border bg-neutral-900 p-4"
          style={{ borderColor: '#334155' }}
        >
          <Text className="mb-2 font-bold text-white">{item.q}</Text>
          <Text className="text-gray-300">{item.a}</Text>
        </View>
      ))}
    </ScrollView>
  )
}
