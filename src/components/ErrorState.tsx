import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retryText?: string
  fullScreen?: boolean
}

export default function ErrorState({
  title = "Une erreur s'est produite",
  message,
  onRetry,
  retryText = 'Réessayer',
  fullScreen = false,
}: ErrorStateProps) {
  const containerClasses = fullScreen
    ? 'flex-1 justify-center items-center bg-black px-6'
    : 'justify-center items-center py-8 px-6'

  return (
    <View className={containerClasses}>
      <View className="items-center">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-red-950/30">
          <Ionicons name="warning" size={32} color="#EF4444" />
        </View>

        <Text className="mb-2 text-center text-xl font-bold text-white">{title}</Text>

        <Text className="mb-6 text-center text-sm leading-5 text-gray-400">{message}</Text>

        {onRetry && (
          <Pressable onPress={onRetry} className="overflow-hidden rounded-xl">
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }}
            >
              <View className="flex-row items-center">
                <Ionicons name="refresh" color="#FFFFFF" size={16} />
                <Text className="ml-2 font-semibold text-white">{retryText}</Text>
              </View>
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </View>
  )
}

// Composants spécialisés pour différents types d'erreurs
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Connexion impossible"
      message="Vérifiez votre connexion internet et réessayez."
      onRetry={onRetry}
      retryText="Réessayer"
    />
  )
}

export function ApiError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Service temporairement indisponible"
      message="Nos serveurs rencontrent des difficultés. Veuillez réessayer dans quelques instants."
      onRetry={onRetry}
      retryText="Réessayer"
    />
  )
}

export function NotFoundError({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <ErrorState
      title="Élément introuvable"
      message={message || "L'élément que vous recherchez n'existe pas ou a été supprimé."}
      onRetry={onRetry}
      retryText="Retour"
    />
  )
}

export function ErrorCard({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View className="mb-3 rounded-2xl border border-red-800 bg-red-950/20 p-4">
      <View className="flex-row items-center">
        <Ionicons name="warning" size={20} color="#EF4444" />
        <Text className="ml-2 flex-1 text-sm text-red-400">{message}</Text>
        {onRetry && (
          <Pressable onPress={onRetry} className="ml-3">
            <Ionicons name="refresh" size={16} color="#EF4444" />
          </Pressable>
        )}
      </View>
    </View>
  )
}
