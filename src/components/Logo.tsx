import React, { useEffect } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import LogoMark from './LogoMark'

type LogoProps = {
  size?: number
  showWordmark?: boolean
  wordmarkSize?: number
  tagline?: string
  style?: StyleProp<ViewStyle>
  rounded?: boolean
  animated?: boolean
}

export default function Logo({
  size = 72,
  showWordmark = false,
  wordmarkSize = 22,
  tagline,
  style,
  rounded = true,
  animated = true,
}: LogoProps) {
  const wordmarkTranslate = useSharedValue(animated ? 10 : 0)
  const wordmarkOpacity = useSharedValue(animated ? 0 : 1)
  const taglineOpacity = useSharedValue(animated ? 0 : 1)

  useEffect(() => {
    if (!animated) return
    wordmarkTranslate.value = withDelay(
      220,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) })
    )
    wordmarkOpacity.value = withDelay(220, withTiming(1, { duration: 400 }))
    taglineOpacity.value = withDelay(440, withTiming(1, { duration: 400 }))
  }, [animated])

  const wordmarkStyleAnim = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: wordmarkTranslate.value }],
  }))
  const taglineStyleAnim = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }))

  return (
    <Animated.View style={[{ alignItems: 'center' }, style]}>
      <LogoMark size={size} animated={animated} rounded={rounded} />
      {showWordmark ? (
        <Animated.Text
          style={[
            {
              marginTop: 10,
              color: '#FFFFFF',
              fontSize: wordmarkSize,
              fontWeight: '800',
              letterSpacing: 0.5,
            },
            wordmarkStyleAnim,
          ]}
        >
          BinomePay
        </Animated.Text>
      ) : null}
      {tagline ? (
        <Animated.Text style={[{ marginTop: 4, color: '#9CA3AF', fontSize: 13 }, taglineStyleAnim]}>
          {tagline}
        </Animated.Text>
      ) : null}
    </Animated.View>
  )
}
