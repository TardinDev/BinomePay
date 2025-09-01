import React from 'react';
import Toast from './Toast';
import useToastStore from '@/hooks/useToast';

export default function ToastProvider() {
  const { visible, message, type, duration } = useToastStore();
  const hideToast = useToastStore((state) => state.hideToast);

  return (
    <Toast
      visible={visible}
      message={message}
      type={type}
      duration={duration}
      onHide={hideToast}
    />
  );
}