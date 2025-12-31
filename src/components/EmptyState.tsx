import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap
  iconColor?: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  icon,
  iconColor = '#6B7280',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <View
        className="w-24 h-24 rounded-full items-center justify-center mb-6"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        <Ionicons name={icon} size={48} color={iconColor} />
      </View>
      <Text className="text-white text-xl font-bold text-center mb-2">
        {title}
      </Text>
      <Text className="text-gray-400 text-center leading-6 mb-6">
        {description}
      </Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          className="rounded-xl px-6 py-3"
          style={{ backgroundColor: '#EAB308' }}
        >
          <Text className="text-black font-bold">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  )
}

// Pre-configured empty states for common scenarios
export function NoSuggestionsEmpty({ onCreateIntention }: { onCreateIntention?: () => void }) {
  return (
    <EmptyState
      icon="search-outline"
      iconColor="#EAB308"
      title="Aucune proposition"
      description="Creez une intention pour recevoir des propositions de binomes correspondant a vos besoins."
      actionLabel="Creer une intention"
      onAction={onCreateIntention}
    />
  )
}

export function NoMatchesEmpty({ onExplore }: { onExplore?: () => void }) {
  return (
    <EmptyState
      icon="people-outline"
      iconColor="#60A5FA"
      title="Aucun match"
      description="Vous n'avez pas encore de match. Explorez les propositions pour trouver votre binome ideal."
      actionLabel="Explorer"
      onAction={onExplore}
    />
  )
}

export function NoConversationsEmpty() {
  return (
    <EmptyState
      icon="chatbubbles-outline"
      iconColor="#10B981"
      title="Aucune conversation"
      description="Vos conversations avec vos binomes apparaitront ici une fois que vous aurez accepte une proposition."
    />
  )
}

export function NoHistoryEmpty() {
  return (
    <EmptyState
      icon="time-outline"
      iconColor="#8B5CF6"
      title="Aucun historique"
      description="Votre historique de transactions sera affiche ici une fois que vous aurez effectue votre premier echange."
    />
  )
}

export function NoNotificationsEmpty() {
  return (
    <EmptyState
      icon="notifications-outline"
      iconColor="#F59E0B"
      title="Aucune notification"
      description="Vous n'avez pas de nouvelles notifications pour le moment."
    />
  )
}

export function ErrorEmpty({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon="alert-circle-outline"
      iconColor="#EF4444"
      title="Une erreur est survenue"
      description="Impossible de charger les donnees. Verifiez votre connexion et reessayez."
      actionLabel="Reessayer"
      onAction={onRetry}
    />
  )
}

export function OfflineEmpty({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      iconColor="#F59E0B"
      title="Hors connexion"
      description="Vous etes actuellement hors ligne. Certaines fonctionnalites peuvent etre limitees."
      actionLabel="Reessayer"
      onAction={onRetry}
    />
  )
}
