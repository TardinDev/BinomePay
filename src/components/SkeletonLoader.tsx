import React, { useEffect, useRef } from 'react'
import { View, Animated, ViewStyle, StyleProp } from 'react-native'

interface SkeletonLoaderProps {
  width?: number | `${number}%`
  height?: number
  borderRadius?: number
  style?: StyleProp<ViewStyle>
}

export function SkeletonLoader({
  width = 100,
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) {
  const animatedValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [animatedValue])

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  })

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#374151',
          opacity,
        },
        style,
      ]}
    />
  )
}

export function SuggestionCardSkeleton() {
  return (
    <View
      className="rounded-2xl p-4 mb-3"
      style={{ backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937' }}
    >
      <View className="flex-row items-center mb-3">
        <SkeletonLoader width={48} height={48} borderRadius={24} />
        <View className="ml-3 flex-1">
          <SkeletonLoader width="60%" height={18} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="40%" height={14} />
        </View>
      </View>
      <View className="flex-row justify-between items-center mb-3">
        <SkeletonLoader width="30%" height={24} />
        <SkeletonLoader width="35%" height={16} />
      </View>
      <SkeletonLoader width="100%" height={40} borderRadius={12} />
    </View>
  )
}

export function ConversationSkeleton() {
  return (
    <View
      className="flex-row items-center p-4 border-b"
      style={{ borderColor: '#1F2937' }}
    >
      <SkeletonLoader width={50} height={50} borderRadius={25} />
      <View className="ml-3 flex-1">
        <SkeletonLoader width="50%" height={16} style={{ marginBottom: 8 }} />
        <SkeletonLoader width="80%" height={14} />
      </View>
      <SkeletonLoader width={40} height={12} />
    </View>
  )
}

export function ProfileSkeleton() {
  return (
    <View className="p-5">
      <View className="flex-row items-center mb-4">
        <SkeletonLoader width={64} height={64} borderRadius={32} />
        <View className="ml-4 flex-1">
          <SkeletonLoader width="60%" height={20} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="30%" height={16} />
        </View>
      </View>
      <View className="flex-row justify-between mt-4">
        <SkeletonLoader width="28%" height={50} borderRadius={12} />
        <SkeletonLoader width="28%" height={50} borderRadius={12} />
        <SkeletonLoader width="28%" height={50} borderRadius={12} />
      </View>
    </View>
  )
}

export function IntentionFormSkeleton() {
  return (
    <View className="px-5 pt-6">
      <SkeletonLoader width="40%" height={28} style={{ marginBottom: 24 }} />
      <SkeletonLoader width="100%" height={56} borderRadius={12} style={{ marginBottom: 16 }} />
      <SkeletonLoader width="100%" height={56} borderRadius={12} style={{ marginBottom: 16 }} />
      <SkeletonLoader width="100%" height={56} borderRadius={12} style={{ marginBottom: 16 }} />
      <SkeletonLoader width="100%" height={56} borderRadius={12} style={{ marginBottom: 24 }} />
      <SkeletonLoader width="100%" height={50} borderRadius={12} />
    </View>
  )
}

export function SuggestionsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <SuggestionCardSkeleton key={index} />
      ))}
    </View>
  )
}

export function ConversationsListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <ConversationSkeleton key={index} />
      ))}
    </View>
  )
}
