import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useDataSync } from '@/hooks/useDataSync'

export default function ConnectionStatus() {
  const { isOnline, isSyncing, lastSyncTime, sync, error } = useDataSync()

  // Ne pas afficher si tout va bien
  if (isOnline && !error && !isSyncing) {
    return null
  }

  const formatLastSync = (date: Date | null): string => {
    if (!date) return 'Jamais'
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffMinutes < 1) return "À l'instant"
    if (diffMinutes < 60) return `Il y a ${diffMinutes}min`

    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `Il y a ${diffHours}h`

    return date.toLocaleDateString('fr-FR')
  }

  return (
    <View className="mx-5 mb-3">
      <View
        className={`rounded-lg border p-3 ${
          !isOnline
            ? 'border-red-800 bg-red-950/30'
            : error
              ? 'border-yellow-800 bg-yellow-950/30'
              : 'border-blue-800 bg-blue-950/30'
        }`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center">
            <Ionicons
              name={
                !isOnline ? 'wifi' : isSyncing ? 'sync' : error ? 'warning' : 'checkmark-circle'
              }
              size={16}
              color={!isOnline ? '#EF4444' : error ? '#F59E0B' : '#10B981'}
            />
            <View className="ml-2 flex-1">
              <Text
                className={`text-xs font-semibold ${
                  !isOnline ? 'text-red-400' : error ? 'text-yellow-400' : 'text-blue-400'
                }`}
              >
                {!isOnline
                  ? 'Hors ligne'
                  : isSyncing
                    ? 'Synchronisation...'
                    : error
                      ? 'Erreur de synchronisation'
                      : 'Synchronisé'}
              </Text>

              {lastSyncTime && (
                <Text className="text-xs text-gray-500">
                  Dernière sync: {formatLastSync(lastSyncTime)}
                </Text>
              )}
            </View>
          </View>

          {/* Bouton retry si erreur ou hors ligne avec données */}
          {(error || (!isOnline && lastSyncTime)) && (
            <Pressable onPress={sync} disabled={isSyncing} className="ml-2">
              <Ionicons name="refresh" size={16} color={isSyncing ? '#6B7280' : '#3B82F6'} />
            </Pressable>
          )}
        </View>

        {/* Message détaillé pour les erreurs */}
        {error && (
          <Text className="mt-1 text-xs text-yellow-300">
            {error}. Les données peuvent être obsolètes.
          </Text>
        )}

        {!isOnline && (
          <Text className="mt-1 text-xs text-red-300">
            Vos modifications seront synchronisées à la reconnexion.
          </Text>
        )}
      </View>
    </View>
  )
}
