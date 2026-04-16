import React, { useEffect } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import LogoMark from './LogoMark'

type AnimatedSplashProps = {
  ready: boolean
}

const { width, height } = Dimensions.get('window')
const logoSize = Math.min(width, height) * 0.6

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default function AnimatedSplash({ ready }: AnimatedSplashProps) {
  const containerOpacity = useSharedValue(1)
  const scale = useSharedValue(0.85)
  const opacity = useSharedValue(0)

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) })
    scale.value = withSequence(
      withTiming(1.05, { duration: 700, easing: Easing.out(Easing.back(1.5)) }),
      withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) })
    )
  }, [])

  useEffect(() => {
    if (ready) {
      containerOpacity.value = withTiming(0, { duration: 500, easing: Easing.in(Easing.quad) })
    }
  }, [ready])

  const containerStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }))
  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={logoStyle}>
        <LogoMark size={logoSize} animated />
      </Animated.View>
    </Animated.View>
  )
}
