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
  const matches = useAppStore((s) => s.matches)
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
        <View className="flex-row items-center mb-6">
          <Pressable 
            onPress={() => router.back()} 
            className="mr-3"
            style={{ padding: 10, borderRadius: 9999, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937' }}
          >
            <Ionicons name="arrow-back" color="#E5E7EB" size={20} />
          </Pressable>
          <Text className="text-white text-xl font-bold">Proposition introuvable</Text>
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
        showError('Impossible d\'accepter cette proposition. Veuillez réessayer.')
      }
    } catch (error) {
      setShowConfirmModal(false)
      showError('Une erreur s\'est produite lors de l\'acceptation.')
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
      const conversation = conversations.find(conv => 
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
      <View className="flex-row items-center mb-6">
        <Pressable 
          onPress={() => router.back()} 
          className="mr-3"
          style={{ padding: 10, borderRadius: 9999, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937' }}
        >
          <Ionicons name="arrow-back" color="#E5E7EB" size={20} />
        </Pressable>
        <Text className="text-white text-xl font-bold">Détails de la proposition</Text>
      </View>

      <View className="border border-gray-800 rounded-2xl p-5 bg-neutral-900 mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Text className={`text-lg font-bold ${isAccepted ? 'text-green-400' : 'text-yellow-400'}`}>
              {isAccepted ? 'PROPOSITION ACCEPTÉE' : 'PROPOSITION'}
            </Text>
            {isAccepted && (
              <Ionicons name="checkmark-circle" color="#10B981" size={20} style={{ marginLeft: 8 }} />
            )}
          </View>
          <Text className="text-gray-400 text-sm">{timeAgo}</Text>
        </View>

        <View className="mb-4">
          <Text className="text-white text-3xl font-extrabold">{item.amount} {item.currency}</Text>
          <View className="flex-row items-center mt-2">
            <Ionicons name="airplane" color="#9CA3AF" size={16} />
            <Text className="text-gray-400 ml-1">{item.originCountryName} → {item.destCountryName}</Text>
          </View>
        </View>

        <View className="border-t border-gray-700 pt-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="person-circle" color="#9CA3AF" size={20} />
            <Text className="text-white ml-2 font-semibold">Expéditeur: {item.senderName}</Text>
          </View>
          
          {item.note && (
            <View className="flex-row items-start mt-2">
              <Ionicons name="document-text" color="#9CA3AF" size={20} />
              <Text className="text-gray-300 ml-2 flex-1">{item.note}</Text>
            </View>
          )}
        </View>
      </View>

      <View className="border border-blue-800 rounded-2xl p-5 bg-blue-950/30 mb-6">
        <View className="flex-row items-center mb-3">
          <Ionicons name="information-circle" color="#60A5FA" size={24} />
          <Text className="text-blue-400 text-lg font-bold ml-2">Informations</Text>
        </View>
        <Text className="text-blue-200 text-sm leading-5">
          En acceptant cette proposition, vous vous engagez à effectuer un échange local avec {item.senderName}. 
          Assurez-vous de vérifier l'identité de votre partenaire avant tout échange.
        </Text>
      </View>

      {isAccepted ? (
        <Pressable onPress={handleMessage} className="rounded-xl overflow-hidden mb-4">
          <LinearGradient
            colors={['#3B82F6', '#1D4ED8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12 }}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="chatbubble-ellipses" color="#FFFFFF" size={24} />
              <Text className="ml-2 text-white font-extrabold text-lg">Messagerie</Text>
            </View>
          </LinearGradient>
        </Pressable>
      ) : (
        <Pressable onPress={handleAccept} className="rounded-xl overflow-hidden mb-4">
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12 }}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="checkmark-circle" color="#FFFFFF" size={24} />
              <Text className="ml-2 text-white font-extrabold text-lg">Accepter la proposition</Text>
            </View>
          </LinearGradient>
        </Pressable>
      )}

      <Pressable 
        onPress={() => router.back()} 
        className="rounded-xl bg-gray-800 py-4 px-5"
      >
        <Text className="text-center text-gray-300 font-semibold">Retour</Text>
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