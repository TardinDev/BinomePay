import React from 'react'
import { Pressable, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

export default function CreateIntentionButton() {
  return (
    <Pressable
      onPress={() => router.push('/(Protected)/new-intention')}
      className="mt-5 flex-row items-center justify-center rounded-xl bg-yellow-300 px-5 py-3"
    >
      <Ionicons name="pencil" color="#000" size={20} />
      <Text className="ml-2 text-base font-extrabold text-black">Créer une intention</Text>
    </Pressable>
  )
}
