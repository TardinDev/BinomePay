import React from 'react'
import { ScrollView, Text, View, Pressable } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TermsScreen() {
  return (
    <ScrollView className="flex-1 bg-black px-5 pt-6" contentContainerStyle={{ paddingBottom: 60 }}>
      <View className="mb-4 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="mr-3 rounded-full p-2"
          style={{ backgroundColor: '#111827' }}
        >
          <Ionicons name="arrow-back" color="#E5E7EB" size={20} />
        </Pressable>
        <Text className="text-2xl font-extrabold text-white">Conditions d'utilisation</Text>
      </View>

      <View className="rounded-2xl border bg-neutral-900 p-5" style={{ borderColor: '#334155' }}>
        <Text className="mb-4 text-xs text-gray-500">
          Dernière mise à jour : 12 avril 2026 - Version 1.0.1
        </Text>

        <Text className="mb-2 text-lg font-bold text-white">1. Objet du service</Text>
        <Text className="mb-4 text-gray-300">
          BinomePay est une application de mise en relation entre particuliers souhaitant effectuer
          des échanges de devises. BinomePay ne réalise pas d'opérations de change elle-même mais
          facilite la rencontre entre utilisateurs ayant des besoins complémentaires.
        </Text>

        <Text className="mb-2 text-lg font-bold text-white">2. Inscription et compte</Text>
        <Text className="mb-4 text-gray-300">
          Pour utiliser BinomePay, vous devez créer un compte en fournissant des informations
          exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants de
          connexion. Toute activité réalisée depuis votre compte est sous votre responsabilité. Vous
          devez avoir au moins 18 ans pour utiliser le service.
        </Text>

        <Text className="mb-2 text-lg font-bold text-white">3. Vérification d'identité (KYC)</Text>
        <Text className="mb-4 text-gray-300">
          Conformément aux réglementations en vigueur, BinomePay peut vous demander de fournir des
          documents d'identité pour vérifier votre identité. L'accès à certaines fonctionnalités
          peut être restreint tant que cette vérification n'est pas complétée.
        </Text>

        <Text className="mb-2 text-lg font-bold text-white">4. Utilisation du service</Text>
        <Text className="mb-4 text-gray-300">
          En utilisant BinomePay, vous vous engagez à :{'\n'}- Respecter les lois et réglementations
          en vigueur dans votre pays{'\n'}- Ne pas utiliser le service à des fins frauduleuses,
          illégales ou de blanchiment d'argent{'\n'}- Fournir des informations véridiques dans vos
          intentions d'échange{'\n'}- Traiter les autres utilisateurs avec respect et courtoisie
          {'\n'}- Ne pas tenter de contourner les mesures de sécurité du service
        </Text>

        <Text className="mb-2 text-lg font-bold text-white">5. Responsabilité</Text>
        <Text className="mb-4 text-gray-300">
          BinomePay agit en tant qu'intermédiaire de mise en relation. Les transactions sont
          effectuées directement entre les utilisateurs. BinomePay ne peut être tenu responsable des
          pertes, dommages ou litiges résultant des échanges entre utilisateurs. Chaque utilisateur
          est responsable de vérifier l'identité et la fiabilité de son partenaire d'échange.
        </Text>

        <Text className="mb-2 text-lg font-bold text-white">6. Suspension et résiliation</Text>
        <Text className="mb-4 text-gray-300">
          BinomePay se réserve le droit de suspendre ou de supprimer tout compte en cas de violation
          des présentes conditions, d'activité suspecte, de fraude, ou de non-conformité avec les
          obligations légales. Vous pouvez demander la suppression de votre compte à tout moment en
          nous contactant.
        </Text>

        <Text className="mb-2 text-lg font-bold text-white">7. Protection des données</Text>
        <Text className="mb-4 text-gray-300">
          Vos données personnelles sont traitées conformément à notre Politique de Confidentialité
          et au Règlement Général sur la Protection des Données (RGPD). Vos données sont chiffrées
          et stockées de manière sécurisée. Vous disposez d'un droit d'accès, de modification et de
          suppression de vos données.
        </Text>

        <Text className="mb-2 text-lg font-bold text-white">8. Propriété intellectuelle</Text>
        <Text className="mb-4 text-gray-300">
          L'application BinomePay, son design, son logo et son contenu sont protégés par les lois
          sur la propriété intellectuelle. Toute reproduction ou utilisation non autorisée est
          interdite.
        </Text>

        <Text className="mb-2 text-lg font-bold text-white">9. Modifications</Text>
        <Text className="mb-4 text-gray-300">
          BinomePay peut modifier ces conditions à tout moment. Les utilisateurs seront informés des
          modifications importantes. L'utilisation continue du service après modification vaut
          acceptation des nouvelles conditions.
        </Text>

        <Text className="mb-2 text-lg font-bold text-white">10. Contact</Text>
        <Text className="mb-2 text-gray-300">
          Pour toute question concernant ces conditions d'utilisation, contactez-nous à :
          support@binomepay.com
        </Text>
      </View>
    </ScrollView>
  )
}
