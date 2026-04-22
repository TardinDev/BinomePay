import 'dotenv/config'
import type { ExpoConfig } from '@expo/config'

const config: ExpoConfig = {
  name: 'BinomePay',
  slug: 'binomepay',
  scheme: 'binomepay',
  description: 'BinomePay - Application de change de devises entre particuliers',

  version: '1.0.2',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  newArchEnabled: false,

  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#000000',
  },

  runtimeVersion: {
    policy: 'sdkVersion',
  },

  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.binomepay.app',
    // Nécessaire pour que l'OS réveille l'app quand un push arrive en background
    infoPlist: {
      UIBackgroundModes: ['remote-notification'],
    },
    // Fichier téléchargé depuis Firebase (iOS app). Voir docs/NOTIFICATIONS_SETUP.md
    googleServicesFile: process.env.GOOGLE_SERVICES_PLIST ?? './GoogleService-Info.plist',
  },

  android: {
    package: 'com.binomepay.app',
    versionCode: 3, // ↗︎ incrémente à chaque release

    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#000000',
    },
    edgeToEdgeEnabled: true,

    permissions: ['POST_NOTIFICATIONS', 'VIBRATE', 'WAKE_LOCK'],
    blockedPermissions: [
      'CAMERA',
      'RECORD_AUDIO',
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
    ],

    // Fichier téléchargé depuis Firebase (Android app). Voir docs/NOTIFICATIONS_SETUP.md
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',

    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.binomepay.app',
  },

  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },

  plugins: [
    'expo-router',
    'expo-web-browser',
    'expo-secure-store',
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#EAB308',
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          minSdkVersion: 24,
        },
      },
    ],
  ],

  extra: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,

    CLERK_PUBLISHABLE_KEY:
      process.env.CLERK_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,

    router: { origin: false },

    eas: {
      projectId: '41fc888a-a918-40d3-a691-eac339936be5',
    },
  },
}

export default config
