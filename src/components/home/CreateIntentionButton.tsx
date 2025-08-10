import React from 'react'
import { Pressable, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

export default function CreateIntentionButton() {
  return (
    <Pressable
      onPress={() => router.push('/(Protected)/new-intention')}
      className="rounded-xl mt-5 flex-row items-center justify-center bg-yellow-300 py-3 px-5"
    >
      <Ionicons name="pencil" color="#000" size={20} />
      <Text className="ml-2 text-black font-extrabold text-base">
        Créer une intention
      </Text>
    </Pressable>
  )
}


