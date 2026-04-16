import React, { useEffect } from 'react'
import { View, Text, Image, Dimensions, StyleSheet } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

type AnimatedSplashProps = {
  ready: boolean
}

const { width } = Dimensions.get('window')
const logoSize = Math.min(width * 0.32, 180)
const ringOuter = logoSize * 1.9
const ringInner = logoSize * 1.55

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    width: ringOuter,
    height: ringOuter,
  },
  glow: {
    position: 'absolute',
    width: ringOuter,
    height: ringOuter,
    borderRadius: ringOuter / 2,
    backgroundColor: '#EAB308',
    opacity: 0.18,
  },
  ringYellow: {
    position: 'absolute',
    width: ringOuter,
    height: ringOuter,
    borderRadius: ringOuter / 2,
    borderWidth: 3,
    borderTopColor: '#EAB308',
    borderRightColor: '#EAB308',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  ringBlue: {
    position: 'absolute',
    width: ringInner,
    height: ringInner,
    borderRadius: ringInner / 2,
    borderWidth: 3,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#3B82F6',
    borderLeftColor: '#3B82F6',
  },
  logo: {
    width: logoSize,
    height: logoSize,
    borderRadius: logoSize * 0.22,
  },
  title: {
    marginTop: 28,
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tagline: {
    marginTop: 8,
    color: '#9CA3AF',
    fontSize: 14,
  },
})

export default function AnimatedSplash({ ready }: AnimatedSplashProps) {
  const containerOpacity = useSharedValue(1)

  const logoScale = useSharedValue(0.5)
  const logoOpacity = useSharedValue(0)

  const glowScale = useSharedValue(0.8)
  const glowOpacity = useSharedValue(0)

  const yellowRotate = useSharedValue(0)
  const blueRotate = useSharedValue(0)

  const titleOpacity = useSharedValue(0)
  const titleTranslate = useSharedValue(12)

  const taglineOpacity = useSharedValue(0)

  useEffect(() => {
    // Entrance sequence
    logoScale.value = withSequence(
      withTiming(1.08, { duration: 500, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 250, easing: Easing.inOut(Easing.quad) })
    )
    logoOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })

    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.92, { duration: 1400, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    )
    glowOpacity.value = withDelay(200, withTiming(1, { duration: 700 }))

    // Rotating rings (opposite directions — "swap" feel)
    yellowRotate.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    )
    blueRotate.value = withRepeat(
      withTiming(-360, { duration: 5200, easing: Easing.linear }),
      -1,
      false
    )

    titleOpacity.value = withDelay(400, withTiming(1, { duration: 500 }))
    titleTranslate.value = withDelay(
      400,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    )

    taglineOpacity.value = withDelay(700, withTiming(1, { duration: 500 }))
  }, [])

  useEffect(() => {
    if (ready) {
      containerOpacity.value = withTiming(0, {
        duration: 450,
        easing: Easing.inOut(Easing.cubic),
      })
    }
  }, [ready])

  const containerStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }))
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }))
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value * 0.18,
    transform: [{ scale: glowScale.value }],
  }))
  const yellowRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${yellowRotate.value}deg` }],
  }))
  const blueRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${blueRotate.value}deg` }],
  }))
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslate.value }],
  }))
  const taglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }))

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={styles.center}>
        <Animated.View style={[styles.glow, glowStyle]} />
        <Animated.View style={[styles.ringYellow, yellowRingStyle]} />
        <Animated.View style={[styles.ringBlue, blueRingStyle]} />
        <Animated.Image
          source={require('../../assets/icon.png')}
          style={[styles.logo, logoStyle]}
          resizeMode="contain"
        />
      </View>
      <Animated.Text style={[styles.title, titleStyle]}>BinomePay</Animated.Text>
      <Animated.Text style={[styles.tagline, taglineStyle]}>
        Change de devises entre particuliers
      </Animated.Text>
    </Animated.View>
  )
}
