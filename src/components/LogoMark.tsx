import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Path,
  G,
  Text as SvgText,
} from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
  cancelAnimation,
  SharedValue,
} from 'react-native-reanimated'

const AnimatedG = Animated.createAnimatedComponent(G)
const AnimatedCircle = Animated.createAnimatedComponent(Circle)

type LogoMarkProps = {
  size?: number
  animated?: boolean
  rounded?: boolean
}

export default function LogoMark({ size = 300, animated = true, rounded = true }: LogoMarkProps) {
  const rotation1 = useSharedValue(0)
  const rotation2 = useSharedValue(0)
  const pulse = useSharedValue(0)
  const ringPulse = useSharedValue(0)
  const ringPulse2 = useSharedValue(0)
  const ringPulse3 = useSharedValue(0)
  const haloPulse = useSharedValue(0)

  useEffect(() => {
    if (!animated) return

    rotation1.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    )
    rotation2.value = withRepeat(
      withTiming(-360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    )
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    )
    haloPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    )

    const spawnRing = (ring: SharedValue<number>, delay: number) => {
      setTimeout(() => {
        ring.value = withRepeat(
          withTiming(1, { duration: 3000, easing: Easing.out(Easing.ease) }),
          -1,
          false
        )
      }, delay)
    }

    spawnRing(ringPulse, 0)
    spawnRing(ringPulse2, 1000)
    spawnRing(ringPulse3, 2000)

    return () => {
      cancelAnimation(rotation1)
      cancelAnimation(rotation2)
      cancelAnimation(pulse)
      cancelAnimation(haloPulse)
      cancelAnimation(ringPulse)
      cancelAnimation(ringPulse2)
      cancelAnimation(ringPulse3)
    }
  }, [animated])

  const arc1Props = useAnimatedProps(() => ({ transform: `rotate(${rotation1.value})` }))
  const arc2Props = useAnimatedProps(() => ({ transform: `rotate(${rotation2.value})` }))
  const anchorPulseProps = useAnimatedProps(() => ({
    r: interpolate(pulse.value, [0, 1], [7, 11]),
  }))
  const anchorPulseDelayedProps = useAnimatedProps(() => ({
    r: interpolate(pulse.value, [0, 1], [11, 7]),
  }))
  const haloProps = useAnimatedProps(() => ({
    r: interpolate(haloPulse.value, [0, 1], [130, 155]),
    opacity: interpolate(haloPulse.value, [0, 1], [0.5, 1]),
  }))
  const ring1Props = useAnimatedProps(() => ({
    r: interpolate(ringPulse.value, [0, 1], [60, 105]),
    opacity: interpolate(ringPulse.value, [0, 0.5, 1], [0.5, 0.3, 0]),
  }))
  const ring2Props = useAnimatedProps(() => ({
    r: interpolate(ringPulse2.value, [0, 1], [60, 105]),
    opacity: interpolate(ringPulse2.value, [0, 0.5, 1], [0.5, 0.3, 0]),
  }))
  const ring3Props = useAnimatedProps(() => ({
    r: interpolate(ringPulse3.value, [0, 1], [60, 105]),
    opacity: interpolate(ringPulse3.value, [0, 0.5, 1], [0.5, 0.3, 0]),
  }))

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 300 300">
        <Defs>
          <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#EAB308" stopOpacity="0.35" />
            <Stop offset="60%" stopColor="#EAB308" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="arcFade1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FDE68A" />
            <Stop offset="100%" stopColor="#EAB308" />
          </LinearGradient>
          <LinearGradient id="arcFade2" x1="100%" y1="100%" x2="0%" y2="0%">
            <Stop offset="0%" stopColor="#FDE68A" />
            <Stop offset="100%" stopColor="#EAB308" />
          </LinearGradient>
        </Defs>

        <Rect x="0" y="0" width="300" height="300" rx={rounded ? 66 : 0} fill="#000000" />

        <AnimatedCircle cx="150" cy="150" fill="url(#halo)" animatedProps={haloProps} />

        <G opacity="0.12">
          <Circle
            cx="150"
            cy="150"
            r="125"
            fill="none"
            stroke="#EAB308"
            strokeWidth="0.5"
            strokeDasharray="1 6"
          />
          <Circle
            cx="150"
            cy="150"
            r="110"
            fill="none"
            stroke="#EAB308"
            strokeWidth="0.5"
            strokeDasharray="2 8"
          />
        </G>

        <G x="150" y="150">
          <AnimatedCircle
            cx="0"
            cy="0"
            fill="none"
            stroke="#EAB308"
            strokeWidth="1.5"
            animatedProps={ring1Props}
          />
          <AnimatedCircle
            cx="0"
            cy="0"
            fill="none"
            stroke="#EAB308"
            strokeWidth="1"
            animatedProps={ring2Props}
          />
          <AnimatedCircle
            cx="0"
            cy="0"
            fill="none"
            stroke="#FDE68A"
            strokeWidth="0.8"
            animatedProps={ring3Props}
          />

          <AnimatedG animatedProps={arc1Props} origin="0, 0">
            <Path
              d="M 0 -95 A 95 95 0 0 1 82 -47.5"
              fill="none"
              stroke="url(#arcFade1)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <AnimatedCircle cx="82" cy="-47.5" fill="#FCD34D" animatedProps={anchorPulseProps} />
            <Circle cx="82" cy="-47.5" r="4" fill="#FDE68A" />
            <AnimatedCircle
              cx="0"
              cy="-95"
              fill="#FCD34D"
              animatedProps={anchorPulseDelayedProps}
            />
            <Circle cx="0" cy="-95" r="4" fill="#FDE68A" />
            <Path
              d="M 71 63 A 95 95 0 0 1 -24 92"
              fill="none"
              stroke="#EAB308"
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.4"
            />
          </AnimatedG>

          <AnimatedG animatedProps={arc2Props} origin="0, 0">
            <Path
              d="M 0 95 A 95 95 0 0 1 -82 47.5"
              fill="none"
              stroke="url(#arcFade2)"
              strokeWidth="16"
              strokeLinecap="round"
              opacity="0.9"
            />
            <AnimatedCircle cx="-82" cy="47.5" fill="#FCD34D" animatedProps={anchorPulseProps} />
            <Circle cx="-82" cy="47.5" r="4" fill="#FDE68A" />
            <AnimatedCircle cx="0" cy="95" fill="#FCD34D" animatedProps={anchorPulseDelayedProps} />
            <Circle cx="0" cy="95" r="4" fill="#FDE68A" />
            <Path
              d="M -71 -63 A 95 95 0 0 1 24 -92"
              fill="none"
              stroke="#EAB308"
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.4"
            />
          </AnimatedG>

          <Circle cx="0" cy="0" r="70" fill="#000000" opacity="0.98" />
          <Circle
            cx="0"
            cy="0"
            r="68"
            fill="none"
            stroke="#EAB308"
            strokeWidth="0.5"
            opacity="0.3"
          />

          <SvgText
            x="-12"
            y="24"
            textAnchor="middle"
            fontFamily="Georgia"
            fontSize="78"
            fontWeight="700"
            fill="#FFFFFF"
          >
            B
          </SvgText>

          <SvgText
            x="26"
            y="14"
            textAnchor="start"
            fontFamily="Arial"
            fontSize="18"
            fontWeight="700"
            fill="#EAB308"
          >
            pay
          </SvgText>
        </G>
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
