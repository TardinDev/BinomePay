/**
 * Configuration globale de l'application
 * Permet de basculer facilement entre développement et production
 */

export const AppConfig = {
  // Mode de données
  USE_MOCK_DATA: true, // false pour utiliser Supabase en production
  
  // Configuration Supabase
  SUPABASE_ENABLED: false, // true pour activer Supabase
  
  // Real-time
  ENABLE_REALTIME: false, // true pour activer les subscriptions en temps réel
  
  // Debugging
  DEBUG_MODE: __DEV__, // true en développement
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