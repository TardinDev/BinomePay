import React from 'react'
import { Image, View, Text, StyleProp, ViewStyle, ImageStyle } from 'react-native'

type LogoProps = {
  size?: number
  showWordmark?: boolean
  wordmarkSize?: number
  tagline?: string
  style?: StyleProp<ViewStyle>
  imageStyle?: StyleProp<ImageStyle>
  rounded?: boolean
}

export default function Logo({
  size = 72,
  showWordmark = false,
  wordmarkSize = 22,
  tagline,
  style,
  imageStyle,
  rounded = true,
}: LogoProps) {
  return (
    <View style={[{ alignItems: 'center' }, style]}>
      <Image
        source={require('../../assets/icon.png')}
        style={[
          {
            width: size,
            height: size,
            borderRadius: rounded ? size * 0.22 : 0,
          },
          imageStyle,
        ]}
        resizeMode="contain"
      />
      {showWordmark ? (
        <Text
          style={{
            marginTop: 10,
            color: '#FFFFFF',
            fontSize: wordmarkSize,
            fontWeight: '800',
            letterSpacing: 0.5,
          }}
        >
          BinomePay
        </Text>
      ) : null}
      {tagline ? (
        <Text style={{ marginTop: 4, color: '#9CA3AF', fontSize: 13 }}>{tagline}</Text>
      ) : null}
    </View>
  )
}
