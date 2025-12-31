import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  Pressable,
  Dimensions,
  FlatList,
  Animated,
  ViewToken,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'

const { width } = Dimensions.get('window')

interface OnboardingStep {
  id: string
  icon: keyof typeof Ionicons.glyphMap
  iconColor: string
  title: string
  description: string
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: '1',
    icon: 'swap-horizontal',
    iconColor: '#EAB308',
    title: 'Creez une intention',
    description: 'Indiquez le montant que vous souhaitez envoyer ou recevoir, et vers quel pays.',
  },
  {
    id: '2',
    icon: 'people',
    iconColor: '#60A5FA',
    title: 'Recevez des propositions',
    description: 'Notre algorithme vous met en relation avec des personnes ayant des besoins complementaires.',
  },
  {
    id: '3',
    icon: 'chatbubbles',
    iconColor: '#10B981',
    title: 'Discutez et convenez',
    description: 'Echangez avec votre binome pour organiser la transaction en toute securite.',
  },
  {
    id: '4',
    icon: 'checkmark-circle',
    iconColor: '#8B5CF6',
    title: 'Effectuez l\'echange',
    description: 'Finalisez votre transfert et notez votre experience pour aider la communaute.',
  },
]

const ONBOARDING_KEY = '@binomepay_onboarding_complete'

interface OnboardingProps {
  onComplete: () => void
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)
  const scrollX = useRef(new Animated.Value(0)).current

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true')
    } catch (error) {
      if (__DEV__) console.error('Error saving onboarding state:', error)
    }
    onComplete()
  }

  const handleNext = () => {
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 })
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index)
      }
    }
  ).current

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current

  const renderStep = ({ item }: { item: OnboardingStep }) => (
    <View style={{ width }} className="flex-1 items-center justify-center px-8">
      <View
        className="w-32 h-32 rounded-full items-center justify-center mb-8"
        style={{ backgroundColor: `${item.iconColor}20` }}
      >
        <Ionicons name={item.icon} size={64} color={item.iconColor} />
      </View>
      <Text className="text-white text-2xl font-extrabold text-center mb-4">
        {item.title}
      </Text>
      <Text className="text-gray-400 text-center text-lg leading-7">
        {item.description}
      </Text>
    </View>
  )

  const renderDots = () => (
    <View className="flex-row justify-center mb-8">
      {ONBOARDING_STEPS.map((_, index) => {
        const inputRange = [
          (index - 1) * width,
          index * width,
          (index + 1) * width,
        ]

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        })

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        })

        return (
          <Animated.View
            key={index}
            style={{
              width: dotWidth,
              opacity,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#EAB308',
              marginHorizontal: 4,
            }}
          />
        )
      })}
    </View>
  )

  return (
    <View className="flex-1 bg-black">
      {/* Skip Button */}
      <View className="absolute top-14 right-6 z-10">
        <Pressable onPress={handleSkip}>
          <Text className="text-gray-400 font-semibold">Passer</Text>
        </Pressable>
      </View>

      {/* Steps */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_STEPS}
        renderItem={renderStep}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        contentContainerStyle={{ paddingTop: 100 }}
      />

      {/* Bottom Section */}
      <View className="px-8 pb-12">
        {renderDots()}

        <Pressable
          onPress={handleNext}
          className="rounded-xl items-center py-4"
          style={{ backgroundColor: '#EAB308' }}
        >
          <Text className="text-black font-extrabold text-lg">
            {currentIndex === ONBOARDING_STEPS.length - 1 ? 'Commencer' : 'Suivant'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

export async function shouldShowOnboarding(): Promise<boolean> {
  try {
    const completed = await AsyncStorage.getItem(ONBOARDING_KEY)
    return completed !== 'true'
  } catch {
    return true
  }
}

export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY)
  } catch (error) {
    if (__DEV__) console.error('Error resetting onboarding:', error)
  }
}
