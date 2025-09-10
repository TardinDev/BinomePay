// Query key factory for consistent key management
export const queryKeys = {
  // User-related queries
  user: (userId: string) => ['user', userId] as const,
  userProfile: (userId: string) => ['user', userId, 'profile'] as const,
  userRating: (userId: string) => ['user', userId, 'rating'] as const,
  
  // Exchange-related queries
  requests: (userId: string) => ['requests', userId] as const,
  matches: (userId: string) => ['matches', userId] as const,
  suggestions: (userId: string) => ['suggestions', userId] as const,
  
  // Conversation-related queries
  conversations: (userId: string) => ['conversations', userId] as const,
  conversation: (conversationId: string) => ['conversation', conversationId] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
  
  // Real-time subscriptions
  realtime: {
    conversations: (userId: string) => ['realtime', 'conversations', userId] as const,
    matches: (userId: string) => ['realtime', 'matches', userId] as const,
    suggestions: (userId: string) => ['realtime', 'suggestions', userId] as const,
  },
} as const