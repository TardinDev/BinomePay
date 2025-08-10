import React, { useEffect, useMemo } from 'react'
import { View, Text, Dimensions } from 'react-native'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

type AnimatedSplashProps = {
  ready: boolean
}

const { width } = Dimensions.get('window')

export default function AnimatedSplash({ ready }: AnimatedSplashProps) {
  const scale = useSharedValue(0.8)
  const opacity = useSharedValue(1)

  useEffect(() => {
    scale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
  }, [])

  useEffect(() => {
    if (ready) {
      opacity.value = withTiming(0, { duration: 400, easing: Easing.inOut(Easing.cubic) })
    }
  }, [ready])

  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <Animated.View style={[{ flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' }, containerStyle]}>
      <Animated.View style={[{ alignItems: 'center', justifyContent: 'center' }, cardStyle]}>
        <View style={{ width: width * 0.28, height: width * 0.28, borderRadius: 24, backgroundColor: '#FFD700', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#000000', fontSize: 24, fontWeight: '800', letterSpacing: 1 }}>BP</Text>
        </View>
        <Text style={{ marginTop: 16, color: '#FFFFFF', fontSize: 28, fontWeight: '800' }}>BinomePay</Text>
      </Animated.View>
    </Animated.View>
  )
}


