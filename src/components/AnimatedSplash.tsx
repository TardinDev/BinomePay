import React, { useEffect, useMemo } from 'react'
import { View, Text, Dimensions, StyleSheet } from 'react-native'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

type AnimatedSplashProps = {
  ready: boolean
}

const { width } = Dimensions.get('window')
const logoSize = width * 0.28

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: logoSize,
    height: logoSize,
    borderRadius: 24,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#000000',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    marginTop: 16,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
})

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
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.cardContainer, cardStyle]}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>BP</Text>
        </View>
        <Text style={styles.title}>BinomePay</Text>
      </Animated.View>
    </Animated.View>
  )
}


