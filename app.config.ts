import 'dotenv/config'
import type { ExpoConfig } from '@expo/config'

const config: ExpoConfig = {
  name: 'BinomePay',
  slug: 'binomepay',
  scheme: 'binomepay',
  description: 'BinomePay - Application de change de devises entre particuliers',

  version: '1.0.1',                 // ↗︎ bump version
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  newArchEnabled: true,

  icon: './assets/icon.png',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#000000',
  },

  // ✅ Unifier la runtimeVersion
  runtimeVersion: '1.0.1',

  ios: {
    supportsTablet: true,
  },

  updates: {
    url: 'https://u.expo.dev/7bfec935-841c-4a69-8abe-9fde7256610a',
  },

  android: {
    package: 'com.binomepay.app',
    versionCode: 2,                 // ↗︎ incrémente à chaque release
    // Laisse Expo/EAS définir compile/target automatiquement.
    // Si tu veux forcer, tu peux ajouter:
    // targetSdkVersion: 35,

    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#000000',
    },
    edgeToEdgeEnabled: true,

    // 🔒 Permissions minimales.
    permissions: [
      'CAMERA', // la caméra sera utilisé dans les prochaine mise à jour
      'POST_NOTIFICATIONS', 
      'VIBRATE',
      'WAKE_LOCK',
    ],
    blockedPermissions: [
      'RECORD_AUDIO', // non utilisé
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION', // non utilisé
      // Pas de READ/WRITE_EXTERNAL_STORAGE si cela peux etre éviter
    ],

    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.binomepay.app',
  },

  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },

  plugins: [
    'expo-router',
    'expo-web-browser',
    'expo-updates',
    'expo-secure-store',
    // Ajoute ce plugin si tu utilises vraiment les notifications:
    // 'expo-notifications',

    // ❌ Optionnel : retire build-properties si tu n’en as pas besoin
    // [
    //   'expo-build-properties',
    //   {
    //     android: {
    //       // Si tu forces, assure-toi d’être cohérent avec ta version d’Expo
    //       targetSdkVersion: 35,
    //       // Évite packagingOptions pickFirst sauf conflit prouvé
    //     },
    //   },
    // ],
  ],

  extra: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,

    CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,

    router: { origin: false },

    eas: {
      projectId: '7bfec935-841c-4a69-8abe-9fde7256610a',
    },
  },
}

export default config
