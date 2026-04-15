import React, { useState } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import useAppStore from '@/store/useAppStore'
import { useUser } from '@clerk/clerk-expo'
import CustomModal from '@/components/CustomModal'
import { useToast } from '@/hooks/useToast'

export default function SuggestedDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useUser()
  const suggested = useAppStore((s) => s.suggested)
  const acceptSuggestion = useAppStore((s) => s.acceptSuggestion)
  const conversations = useAppStore((s) => s.conversations)

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [createdConversationId, setCreatedConversationId] = useState<string | null>(null)

  const { showError } = useToast()

  const item = suggested.find((s) => s.id === id)

  // Check if this suggestion has been accepted
  const isAccepted = item?.isAccepted || false
  const conversationId = item?.conversationId

  const timeAgo = React.useMemo(() => {
    if (!item) return ''
    const now = Date.now()
    const diff = now - item.createdAt
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `il y a ${days}j`
    if (hours > 0) return `il y a ${hours}h`
    return `il y a ${minutes}min`
  }, [item])

  if (!item) {
    return (
      <View className="flex-1 bg-black px-5 pt-6">
        <View className="mb-6 flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="mr-3"
            style={{
              padding: 10,
              borderRadius: 9999,
              backgroundColor: '#111827',
              borderWidth: 1,
              borderColor: '#1F2937',
            }}
          >
            <Ionicons name="arrow-back" color="#E5E7EB" size={20} />
          </Pressable>
          <Text className="text-xl font-bold text-white">Proposition introuvable</Text>
        </View>
        <Text className="text-gray-400">Cette proposition n'existe plus ou a été supprimée.</Text>
      </View>
    )
  }

  const handleAccept = async () => {
    if (!user?.id) {
      showError('Vous devez être connecté pour accepter une proposition.')
      return
    }

    setShowConfirmModal(true)
  }

  const confirmAccept = async () => {
    setIsProcessing(true)
    try {
      const conversationId = await acceptSuggestion(item!.id, user!.id)

      if (conversationId) {
        setCreatedConversationId(conversationId)
        setShowConfirmModal(false)
        setShowSuccessModal(true)
      } else {
        setShowConfirmModal(false)
        showError("Impossible d'accepter cette proposition. Veuillez réessayer.")
      }
    } catch {
      setShowConfirmModal(false)
      showError("Une erreur s'est produite lors de l'acceptation.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMessage = () => {
    if (conversationId) {
      // Utiliser directement l'ID de conversation stocké
      router.push(`/(Protected)/messages/${conversationId}`)
    } else {
      // Fallback: chercher la conversation par correspondance
      const conversation = conversations.find(
        (conv) =>
          conv.counterpartName === item?.senderName &&
          conv.matchDetails?.amount === item?.amount &&
          conv.matchDetails?.currency === item?.currency
      )

      if (conversation) {
        router.push(`/(Protected)/messages/${conversation.id}`)
      } else {
        showError('Conversation introuvable')
      }
    }
  }

  return (
    <ScrollView className="flex-1 bg-black px-5 pt-6" contentContainerStyle={{ paddingBottom: 36 }}>
      <View className="mb-6 flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          className="mr-3"
          style={{
            padding: 10,
            borderRadius: 9999,
            backgroundColor: '#111827',
            borderWidth: 1,
            borderColor: '#1F2937',
          }}
        >
          <Ionicons name="arrow-back" color="#E5E7EB" size={20} />
        </Pressable>
        <Text className="text-xl font-bold text-white">Détails de la proposition</Text>
      </View>

      <View className="mb-6 rounded-2xl border border-gray-800 bg-neutral-900 p-5">
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text
              className={`text-lg font-bold ${isAccepted ? 'text-green-400' : 'text-yellow-400'}`}
            >
              {isAccepted ? 'PROPOSITION ACCEPTÉE' : 'PROPOSITION'}
            </Text>
            {isAccepted && (
              <Ionicons
                name="checkmark-circle"
                color="#10B981"
                size={20}
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
          <Text className="text-sm text-gray-400">{timeAgo}</Text>
        </View>

        <View className="mb-4">
          <Text className="text-3xl font-extrabold text-white">
            {item.amount} {item.currency}
          </Text>
          <View className="mt-2 flex-row items-center">
            <Ionicons name="airplane" color="#9CA3AF" size={16} />
            <Text className="ml-1 text-gray-400">
              {item.originCountryName} → {item.destCountryName}
            </Text>
          </View>
        </View>

        <View className="border-t border-gray-700 pt-4">
          <View className="mb-2 flex-row items-center">
            <Ionicons name="person-circle" color="#9CA3AF" size={20} />
            <Text className="ml-2 font-semibold text-white">Expéditeur: {item.senderName}</Text>
          </View>

          {item.note && (
            <View className="mt-2 flex-row items-start">
              <Ionicons name="document-text" color="#9CA3AF" size={20} />
              <Text className="ml-2 flex-1 text-gray-300">{item.note}</Text>
            </View>
          )}
        </View>
      </View>

      <View className="mb-6 rounded-2xl border border-blue-800 bg-blue-950/30 p-5">
        <View className="mb-3 flex-row items-center">
          <Ionicons name="information-circle" color="#60A5FA" size={24} />
          <Text className="ml-2 text-lg font-bold text-blue-400">Informations</Text>
        </View>
        <Text className="text-sm leading-5 text-blue-200">
          En acceptant cette proposition, vous vous engagez à effectuer un échange local avec{' '}
          {item.senderName}. Assurez-vous de vérifier l'identité de votre partenaire avant tout
          échange.
        </Text>
      </View>

      {isAccepted ? (
        <Pressable onPress={handleMessage} className="mb-4 overflow-hidden rounded-xl">
          <LinearGradient
            colors={['#3B82F6', '#1D4ED8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12 }}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="chatbubble-ellipses" color="#FFFFFF" size={24} />
              <Text className="ml-2 text-lg font-extrabold text-white">Messagerie</Text>
            </View>
          </LinearGradient>
        </Pressable>
      ) : (
        <Pressable onPress={handleAccept} className="mb-4 overflow-hidden rounded-xl">
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12 }}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="checkmark-circle" color="#FFFFFF" size={24} />
              <Text className="ml-2 text-lg font-extrabold text-white">
                Accepter la proposition
              </Text>
            </View>
          </LinearGradient>
        </Pressable>
      )}

      <Pressable onPress={() => router.back()} className="rounded-xl bg-gray-800 px-5 py-4">
        <Text className="text-center font-semibold text-gray-300">Retour</Text>
      </Pressable>

      {/* Modal de confirmation */}
      <CustomModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Accepter la proposition"
        message={`Voulez-vous accepter cette proposition de ${item?.senderName} pour ${item?.amount} ${item?.currency} vers ${item?.destCountryName} ?\n\nUn match sera créé et vous pourrez discuter avec votre partenaire.`}
        icon="handshake-outline"
        iconColor="#10B981"
        buttons={[
          {
            text: 'Annuler',
            style: 'secondary',
            onPress: () => setShowConfirmModal(false),
          },
          {
            text: 'Accepter la proposition',
            style: 'primary',
            loading: isProcessing,
            onPress: confirmAccept,
          },
        ]}
      />

      {/* Modal de succès */}
      <CustomModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="🎉 Proposition acceptée !"
        message="Un match a été créé avec succès ! Vous pouvez maintenant discuter avec votre partenaire et organiser votre échange."
        icon="checkmark-circle"
        iconColor="#10B981"
        buttons={[
          {
            text: 'Voir la conversation',
            style: 'primary',
            onPress: () => {
              setShowSuccessModal(false)
              if (createdConversationId) {
                router.push(`/(Protected)/messages/${createdConversationId}`)
              } else {
                router.push(`/(Protected)/(tabs)/messages`)
              }
            },
          },
          {
            text: 'Plus tard',
            style: 'secondary',
            onPress: () => {
              setShowSuccessModal(false)
              router.back()
            },
          },
        ]}
      />
    </ScrollView>
  )
}
