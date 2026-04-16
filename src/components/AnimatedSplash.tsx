import React, { useEffect } from 'react'
import { View, Text, Image, Dimensions, StyleSheet } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

type AnimatedSplashProps = {
  ready: boolean
}

const { width } = Dimensions.get('window')
const logoSize = width * 0.32

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
    borderRadius: logoSize * 0.22,
  },
  title: {
    marginTop: 20,
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tagline: {
    marginTop: 6,
    color: '#9CA3AF',
    fontSize: 13,
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
        <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>BinomePay</Text>
        <Text style={styles.tagline}>Change de devises entre particuliers</Text>
      </Animated.View>
    </Animated.View>
  )
}
