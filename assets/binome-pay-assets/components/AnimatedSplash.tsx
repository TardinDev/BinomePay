import React, { useEffect } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated'
import { Logo } from './Logo'

const { width, height } = Dimensions.get('window')

type AnimatedSplashProps = {
  /** Appelé quand l'animation de sortie est terminée. */
  onAnimationFinish?: () => void
  /** Durée totale avant le fade-out (en ms). Défaut: 2200. */
  duration?: number
}

/**
 * Splash screen animé. Doit être monté après le splash natif d'expo-splash-screen
 * (qui affiche `splash.png`). Séquence:
 *   1. Le logo apparaît (fade + scale up)
 *   2. Reste visible pendant `duration` ms avec ses animations intrinsèques
 *   3. Zoom léger + fade out → appel de onAnimationFinish()
 */
export const AnimatedSplash: React.FC<AnimatedSplashProps> = ({
  onAnimationFinish,
  duration = 2200,
}) => {
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0.85)
  const containerOpacity = useSharedValue(1)

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.quad),
    })

    scale.value = withSequence(
      withTiming(1.05, {
        duration: 700,
        easing: Easing.out(Easing.back(1.5)),
      }),
      withTiming(1, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      })
    )

    containerOpacity.value = withDelay(
      duration,
      withTiming(0, { duration: 500, easing: Easing.in(Easing.quad) }, (finished) => {
        if (finished && onAnimationFinish) {
          runOnJS(onAnimationFinish)()
        }
      })
    )
  }, [])

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }))

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }))

  const logoSize = Math.min(width, height) * 0.6

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={logoStyle}>
        <Logo size={logoSize} animated />
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
})

export default AnimatedSplash
