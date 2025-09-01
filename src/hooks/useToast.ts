import { create } from 'zustand';

interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

interface ToastActions {
  showToast: (message: string, type?: ToastState['type'], duration?: number) => void;
  hideToast: () => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
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

  showError: (message, duration = 4000) =>
    set({ visible: true, message, type: 'error', duration }),

  showWarning: (message, duration = 3500) =>
    set({ visible: true, message, type: 'warning', duration }),

  showInfo: (message, duration = 3000) =>
    set({ visible: true, message, type: 'info', duration }),
}));

export const useToast = () => {
  const { showToast, showSuccess, showError, showWarning, showInfo } = useToastStore();
  
  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export default useToastStore;