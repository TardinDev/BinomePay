// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}))

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}))

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve()),
  setNotificationHandler: jest.fn(),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'mock-token' })),
}))

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
}))

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {},
    },
  },
}))

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}))

// Mock nanoid
jest.mock('nanoid/non-secure', () => ({
  nanoid: jest.fn(() => 'mock-nanoid-id'),
}))

// Mock notification service
jest.mock('@/services/notificationService', () => ({
  notifyMatchAccepted: jest.fn(() => Promise.resolve()),
  notifyNewMessage: jest.fn(() => Promise.resolve()),
  notifyNewSuggestion: jest.fn(() => Promise.resolve()),
}))

// Mock rating service
jest.mock('@/services/ratingService', () => ({
  default: {
    getUserRating: jest.fn(() =>
      Promise.resolve({
        averageRating: 4.5,
        totalRatings: 10,
        ratingsBreakdown: {},
        canRate: true,
      })
    ),
  },
  __esModule: true,
}))

// Mock ApiService
jest.mock('@/services/apiService', () => ({
  default: {
    fetchUserProfile: jest.fn(() => Promise.resolve(null)),
    fetchUserRequests: jest.fn(() => Promise.resolve([])),
    fetchUserMatches: jest.fn(() => Promise.resolve([])),
    fetchSuggestionsForUser: jest.fn(() => Promise.resolve([])),
    fetchUserConversations: jest.fn(() => Promise.resolve([])),
    fetchConversationMessages: jest.fn(() => Promise.resolve([])),
    createRequest: jest.fn(() => Promise.resolve({})),
    sendMessage: jest.fn(() => Promise.resolve()),
    acceptSuggestion: jest.fn(() =>
      Promise.resolve({ conversationId: 'conv_1', matchId: 'match_1' })
    ),
    queueOfflineAction: jest.fn(() => Promise.resolve()),
    processOfflineQueue: jest.fn(() => Promise.resolve()),
    checkApiHealth: jest.fn(() => Promise.resolve(true)),
    syncUserData: jest.fn(() => Promise.resolve({})),
  },
  __esModule: true,
}))

// Global __DEV__ flag
global.__DEV__ = true
