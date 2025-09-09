import React from 'react'
import { View, ActivityIndicator, Text } from 'react-native'

interface LoadingSpinnerProps {
  size?: 'small' | 'large'
  color?: string
  message?: string
  fullScreen?: boolean
}

export default function LoadingSpinner({ 
  size = 'large', 
  color = '#3B82F6', 
  message,
  fullScreen = false 
}: LoadingSpinnerProps) {
  const containerClasses = fullScreen 
    ? "flex-1 justify-center items-center bg-black" 
    : "justify-center items-center py-8"

  return (
    <View className={containerClasses}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="text-gray-400 mt-4 text-center text-sm">
          {message}
        </Text>
      )}
    </View>
  )
}

// Composants spécialisés pour différents contextes
export function LoadingScreen({ message = "Chargement..." }: { message?: string }) {
  return (
    <LoadingSpinner 
      fullScreen 
      message={message}
      size="large"
      color="#3B82F6"
    />
  )
}

export function LoadingCard({ message }: { message?: string }) {
  return (
    <View className="bg-neutral-900 rounded-2xl p-6 mb-3 border border-gray-800">
      <LoadingSpinner 
        message={message}
        size="small"
        color="#6B7280"
      />
    </View>
  )
}

export function LoadingButton({ children, loading, ...props }: any) {
  return (
    <View {...props}>
      {loading ? (
        <View className="flex-row justify-center items-center">
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text className="text-white ml-2">Traitement...</Text>
        </View>
      ) : (
        children
      )}
    </View>
  )
}