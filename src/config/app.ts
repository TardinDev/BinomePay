/**
 * Configuration globale de l'application
 * Permet de basculer facilement entre développement et production
 */

export const AppConfig = {
  // Mode de données - basé sur l'environnement
  USE_MOCK_DATA: process.env.EXPO_PUBLIC_MOCK_API === 'true',

  // Configuration Supabase - activé sauf si mock
  SUPABASE_ENABLED: process.env.EXPO_PUBLIC_MOCK_API !== 'true',

  // Real-time
  ENABLE_REALTIME: !__DEV__,

  // Debugging
  DEBUG_MODE: __DEV__,
  LOG_API_CALLS: __DEV__,

  // Features flags
  FEATURES: {
    KYC_VERIFICATION: true,
    PUSH_NOTIFICATIONS: false,
    CHAT_SYSTEM: false,
    ADVANCED_MATCHING: false,
  },

  // Timing
  DATA_REFRESH_INTERVAL: 30000, // 30 secondes
  CACHE_EXPIRY: 300000, // 5 minutes

  // UI
  PAGINATION_SIZE: 20,
  MAX_SUGGESTIONS: 50,
}
