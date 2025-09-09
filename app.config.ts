import 'dotenv/config'
import type { ExpoConfig } from '@expo/config'

const config: ExpoConfig = {
  name: 'BinomePay',
  slug: 'binomepay',
  scheme: 'binomepay',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  description: 'BinomePay - Application de change de devises entre particuliers',
  privacy: 'public',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#000000',
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    package: 'com.binomepay.app',
    versionCode: 1,
    compileSdkVersion: 34,
    targetSdkVersion: 34,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#000000',
    },
    edgeToEdgeEnabled: true,
    permissions: [
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'NOTIFICATIONS',
      'INTERNET',
      'ACCESS_NETWORK_STATE',
      'VIBRATE',
      'WAKE_LOCK'
    ],
    blockedPermissions: [
      'RECORD_AUDIO',
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION'
    ],
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.binomepay.app'
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          buildToolsVersion: '34.0.0',
          proguardMinifyEnabled: true,
          enableProguardInReleaseBuilds: true,
          packagingOptions: {
            pickFirst: ['**/libc++_shared.so', '**/libjsc.so']
          }
        }
      }
    ],
    'expo-secure-store'
  ],
  extra: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    // Supporte les deux conventions d'env
    CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    // assure le support nativewind
    router: {
      origin: false,
    },
    // expo-constants EAS
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? undefined,
    },
  },
}

export default config


