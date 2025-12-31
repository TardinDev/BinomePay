import { create } from 'zustand'

interface UIState {
  // Loading states
  isAppLoading: boolean
  isLoggingOut: boolean

  // Notifications
  notificationCount: number

  // Onboarding
  hasCompletedOnboarding: boolean

  // Active screens
  activeTab: 'home' | 'messages' | 'profile'

  // Modals
  isReportModalVisible: boolean
  reportTargetUserId: string | null
  reportTargetUserName: string | null

  // Error handling
  globalError: string | null

  // Actions
  setAppLoading: (loading: boolean) => void
  setLoggingOut: (logging: boolean) => void
  incrementNotifications: () => void
  decrementNotifications: () => void
  clearNotifications: () => void
  setNotifications: (count: number | ((prev: number) => number)) => void
  setOnboardingComplete: (complete: boolean) => void
  setActiveTab: (tab: UIState['activeTab']) => void
  showReportModal: (userId: string, userName: string) => void
  hideReportModal: () => void
  setGlobalError: (error: string | null) => void
  reset: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isAppLoading: true,
  isLoggingOut: false,
  notificationCount: 0,
  hasCompletedOnboarding: false,
  activeTab: 'home',
  isReportModalVisible: false,
  reportTargetUserId: null,
  reportTargetUserName: null,
  globalError: null,

  setAppLoading: (loading) => set({ isAppLoading: loading }),
  setLoggingOut: (logging) => set({ isLoggingOut: logging }),

  incrementNotifications: () =>
    set((state) => ({ notificationCount: state.notificationCount + 1 })),

  decrementNotifications: () =>
    set((state) => ({
      notificationCount: Math.max(0, state.notificationCount - 1),
    })),

  clearNotifications: () => set({ notificationCount: 0 }),

  setNotifications: (countOrUpdater) =>
    set((state) => ({
      notificationCount:
        typeof countOrUpdater === 'function'
          ? countOrUpdater(state.notificationCount)
          : countOrUpdater,
    })),

  setOnboardingComplete: (complete) => set({ hasCompletedOnboarding: complete }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  showReportModal: (userId, userName) =>
    set({
      isReportModalVisible: true,
      reportTargetUserId: userId,
      reportTargetUserName: userName,
    }),

  hideReportModal: () =>
    set({
      isReportModalVisible: false,
      reportTargetUserId: null,
      reportTargetUserName: null,
    }),

  setGlobalError: (error) => set({ globalError: error }),

  reset: () =>
    set({
      isAppLoading: true,
      isLoggingOut: false,
      notificationCount: 0,
      hasCompletedOnboarding: false,
      activeTab: 'home',
      isReportModalVisible: false,
      reportTargetUserId: null,
      reportTargetUserName: null,
      globalError: null,
    }),
}))

export default useUIStore
