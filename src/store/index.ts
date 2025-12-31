// Domain-specific stores for BinomePay
// These can be used alongside or as replacements for useAppStore

export { useUserStore, type User, type KycStatus } from './useUserStore'
export {
  useConversationStore,
  type Conversation,
  type Message,
} from './useConversationStore'
export {
  useIntentionStore,
  type Intention,
  type IntentionType,
  type IntentionStatus,
} from './useIntentionStore'
export {
  useMatchStore,
  type Match,
  type MatchStatus,
  type Suggestion,
} from './useMatchStore'
export { useUIStore } from './useUIStore'

// Re-export the main store for backwards compatibility
export { default as useAppStore } from './useAppStore'

// Utility to reset all stores
export function resetAllStores() {
  const { useUserStore } = require('./useUserStore')
  const { useConversationStore } = require('./useConversationStore')
  const { useIntentionStore } = require('./useIntentionStore')
  const { useMatchStore } = require('./useMatchStore')
  const { useUIStore } = require('./useUIStore')

  useUserStore.getState().reset()
  useConversationStore.getState().reset()
  useIntentionStore.getState().reset()
  useMatchStore.getState().reset()
  useUIStore.getState().reset()
}
