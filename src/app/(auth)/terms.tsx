import React from 'react'
import { ScrollView, Text, View } from 'react-native'

export default function TermsScreen() {
  return (
    <ScrollView className="flex-1 bg-black px-5 pt-6">
      <Text className="text-white text-2xl font-extrabold mb-3">Conditions d’utilisation</Text>
      <View className="gap-3">
        <Text className="text-gray-300">
          Ces conditions encadrent l’usage de Binome Pay. En créant un compte, vous confirmez les accepter.
        </Text>
        <Text className="text-gray-400">
          1. Respect des lois locales. 2. Interdiction d’activités frauduleuses. 3. Véracité des informations.
          4. Nous pouvons suspendre un compte en cas d’abus. 5. Politique de confidentialité s’applique.
        </Text>
        <Text className="text-gray-500 text-xs">Version 1.0</Text>
      </View>
      <View className="h-12" />
    </ScrollView>
  )
}


