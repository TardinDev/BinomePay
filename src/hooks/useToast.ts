import { create } from 'zustand'

interface ToastState {
  visible: boolean
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration: number
}

interface ToastActions {
  showToast: (_message: string, _type?: ToastState['type'], _duration?: number) => void
  hideToast: () => void
  showSuccess: (_message: string, _duration?: number) => void
  showError: (_message: string, _duration?: number) => void
  showWarning: (_message: string, _duration?: number) => void
  showInfo: (_message: string, _duration?: number) => void
}

const useToastStore = create<ToastState & ToastActions>((set) => ({
  visible: false,
  message: '',
  type: 'info',
  duration: 3000,

  showToast: (message, type = 'info', duration = 3000) =>
    set({ visible: true, message, type, duration }),

  hideToast: () => set({ visible: false }),

  showSuccess: (message, duration = 3000) =>
    set({ visible: true, message, type: 'success', duration }),

  showError: (message, duration = 4000) => set({ visible: true, message, type: 'error', duration }),

  showWarning: (message, duration = 3500) =>
    set({ visible: true, message, type: 'warning', duration }),

  showInfo: (message, duration = 3000) => set({ visible: true, message, type: 'info', duration }),
}))

export const useToast = () => {
  const { showToast, showSuccess, showError, showWarning, showInfo } = useToastStore()

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}

export default useToastStore
