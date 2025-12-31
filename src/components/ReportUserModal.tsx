import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useReportRateLimit, formatTimeRemaining } from '@/hooks/useRateLimit'

interface ReportUserModalProps {
  visible: boolean
  onClose: () => void
  userId: string
  userName: string
  onReport?: (reason: string, details: string) => Promise<void>
}

const REPORT_REASONS = [
  { id: 'fraud', label: 'Tentative de fraude', icon: 'warning-outline' },
  { id: 'scam', label: 'Arnaque', icon: 'alert-circle-outline' },
  { id: 'harassment', label: 'Harcelement', icon: 'hand-left-outline' },
  { id: 'fake_profile', label: 'Faux profil', icon: 'person-remove-outline' },
  { id: 'inappropriate', label: 'Contenu inapproprie', icon: 'eye-off-outline' },
  { id: 'other', label: 'Autre raison', icon: 'ellipsis-horizontal-outline' },
] as const

type ReportReasonId = typeof REPORT_REASONS[number]['id']

export default function ReportUserModal({
  visible,
  onClose,
  userId,
  userName,
  onReport,
}: ReportUserModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReasonId | null>(null)
  const [details, setDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { recordAction, state: rateLimitState } = useReportRateLimit()

  const handleSubmit = useCallback(async () => {
    if (!selectedReason) {
      Alert.alert('Erreur', 'Veuillez selectionner une raison')
      return
    }

    // Check rate limit
    const allowed = await recordAction()
    if (!allowed) {
      Alert.alert(
        'Limite atteinte',
        `Vous avez atteint la limite de signalements. Reessayez dans ${formatTimeRemaining(rateLimitState.timeUntilReset || 0)}`
      )
      return
    }

    setIsSubmitting(true)

    try {
      if (onReport) {
        await onReport(selectedReason, details)
      } else {
        // Default behavior - log and show success
        if (__DEV__) {
          console.log('Report submitted:', { userId, reason: selectedReason, details })
        }
      }

      Alert.alert(
        'Signalement envoye',
        'Merci pour votre signalement. Notre equipe va examiner ce profil.',
        [{ text: 'OK', onPress: handleClose }]
      )
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer le signalement. Veuillez reessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedReason, details, userId, onReport, recordAction, rateLimitState.timeUntilReset])

  const handleClose = useCallback(() => {
    setSelectedReason(null)
    setDetails('')
    onClose()
  }, [onClose])

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b" style={{ borderColor: '#1F2937' }}>
          <Pressable onPress={handleClose} className="p-2">
            <Ionicons name="close" color="#9CA3AF" size={24} />
          </Pressable>
          <Text className="text-white text-lg font-bold">Signaler {userName}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        <View className="flex-1 px-4 pt-6">
          <Text className="text-gray-400 mb-6">
            Selectionnez la raison de votre signalement. Nos moderateurs examineront votre rapport.
          </Text>

          {/* Reason Selection */}
          {REPORT_REASONS.map((reason) => (
            <Pressable
              key={reason.id}
              onPress={() => setSelectedReason(reason.id)}
              className="flex-row items-center p-4 mb-2 rounded-xl"
              style={{
                backgroundColor: selectedReason === reason.id ? '#374151' : '#1F2937',
                borderWidth: selectedReason === reason.id ? 1 : 0,
                borderColor: '#EAB308',
              }}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: '#0B1220' }}
              >
                <Ionicons
                  name={reason.icon as any}
                  color={selectedReason === reason.id ? '#EAB308' : '#6B7280'}
                  size={20}
                />
              </View>
              <Text
                className={`flex-1 ${selectedReason === reason.id ? 'text-white font-semibold' : 'text-gray-300'}`}
              >
                {reason.label}
              </Text>
              {selectedReason === reason.id && (
                <Ionicons name="checkmark-circle" color="#EAB308" size={24} />
              )}
            </Pressable>
          ))}

          {/* Details Input */}
          {selectedReason && (
            <View className="mt-4">
              <Text className="text-gray-400 mb-2">Details supplementaires (optionnel)</Text>
              <TextInput
                className="rounded-xl p-4 text-white"
                style={{ backgroundColor: '#1F2937', minHeight: 100 }}
                placeholder="Decrivez le probleme..."
                placeholderTextColor="#6B7280"
                value={details}
                onChangeText={setDetails}
                multiline
                textAlignVertical="top"
                maxLength={500}
              />
              <Text className="text-gray-500 text-xs mt-1 text-right">
                {details.length}/500
              </Text>
            </View>
          )}

          {/* Rate Limit Warning */}
          {rateLimitState.isLimited && (
            <View className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#7F1D1D' }}>
              <View className="flex-row items-center">
                <Ionicons name="time-outline" color="#FCA5A5" size={20} />
                <Text className="text-red-300 ml-2">
                  Limite atteinte. Reessayez dans {formatTimeRemaining(rateLimitState.timeUntilReset || 0)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <View className="px-4 pb-8">
          <Pressable
            onPress={handleSubmit}
            disabled={!selectedReason || isSubmitting || rateLimitState.isLimited}
            className="rounded-xl py-4 items-center"
            style={{
              backgroundColor: !selectedReason || isSubmitting || rateLimitState.isLimited
                ? '#374151'
                : '#EF4444',
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="flag-outline" color="#fff" size={20} />
                <Text className="text-white font-bold ml-2">Envoyer le signalement</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}
