import React from 'react';
import CustomModal from './CustomModal';

interface ConfirmationDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: 'primary' | 'danger';
  icon?: string;
  iconColor?: string;
  loading?: boolean;
}

export default function ConfirmationDialog({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  confirmStyle = 'primary',
  icon = 'help-circle',
  iconColor = '#60A5FA',
  loading = false,
}: ConfirmationDialogProps) {
  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title={title}
      message={message}
      icon={icon}
      iconColor={iconColor}
      buttons={[
        {
          text: cancelText,
          style: 'secondary',
          onPress: onClose,
        },
        {
          text: confirmText,
          style: confirmStyle,
          loading,
          onPress: onConfirm,
        },
      ]}
    />
  );
}