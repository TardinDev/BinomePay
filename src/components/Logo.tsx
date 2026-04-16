import React, { useEffect } from 'react'
import { StyleProp, ViewStyle, ImageStyle } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

type LogoProps = {
  size?: number
  showWordmark?: boolean
  wordmarkSize?: number
  tagline?: string
  style?: StyleProp<ViewStyle>
  imageStyle?: StyleProp<ImageStyle>
  rounded?: boolean
  animated?: boolean
}

export default function Logo({
  size = 72,
  showWordmark = false,
  wordmarkSize = 22,
  tagline,
  style,
  imageStyle,
  rounded = true,
  animated = true,
}: LogoProps) {
  const scale = useSharedValue(animated ? 0.7 : 1)
  const opacity = useSharedValue(animated ? 0 : 1)
  const rotate = useSharedValue(0)
  const wordmarkTranslate = useSharedValue(animated ? 10 : 0)
  const wordmarkOpacity = useSharedValue(animated ? 0 : 1)
  const taglineOpacity = useSharedValue(animated ? 0 : 1)

  useEffect(() => {
    if (!animated) return
    scale.value = withSequence(
      withTiming(1.08, { duration: 420, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 220, easing: Easing.inOut(Easing.quad) })
    )
    opacity.value = withTiming(1, { duration: 420 })
    rotate.value = withRepeat(
      withSequence(
        withTiming(3, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        withTiming(-3, { duration: 2200, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    )
    wordmarkTranslate.value = withDelay(
      220,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) })
    )
    wordmarkOpacity.value = withDelay(220, withTiming(1, { duration: 400 }))
    taglineOpacity.value = withDelay(440, withTiming(1, { duration: 400 }))
  }, [animated])

  const iconStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }))
  const wordmarkStyleAnim = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: wordmarkTranslate.value }],
  }))
  const taglineStyleAnim = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }))

  return (
    <Animated.View style={[{ alignItems: 'center' }, style]}>
      <Animated.Image
        source={require('../../assets/icon.png')}
        style={[
          {
            width: size,
            height: size,
            borderRadius: rounded ? size * 0.22 : 0,
          },
          imageStyle,
          iconStyle,
        ]}
        resizeMode="contain"
      />
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
