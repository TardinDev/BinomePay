export const queryKeys = {
  requests: (userId: string) => ['requests', userId] as const,
  suggestions: (userId: string) => ['suggestions', userId] as const,
  matches: (userId: string) => ['matches', userId] as const,
  conversations: (userId: string) => ['conversations', userId] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
  profile: (userId: string) => ['profile', userId] as const,
}
