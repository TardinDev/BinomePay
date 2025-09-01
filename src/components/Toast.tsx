import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onHide?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function Toast({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const getToastConfig = (toastType: string) => {
    switch (toastType) {
      case 'success':
        return {
          colors: ['#10B981', '#059669'],
          icon: 'checkmark-circle',
          iconColor: '#FFFFFF',
        };
      case 'error':
        return {
          colors: ['#EF4444', '#DC2626'],
          icon: 'close-circle',
          iconColor: '#FFFFFF',
        };
      case 'warning':
        return {
          colors: ['#F59E0B', '#D97706'],
          icon: 'warning',
          iconColor: '#FFFFFF',
        };
      default:
        return {
          colors: ['#3B82F6', '#1D4ED8'],
          icon: 'information-circle',
          iconColor: '#FFFFFF',
        };
    }
  };

  const config = getToastConfig(type);

  useEffect(() => {
    if (visible) {
      // Animation d'entrée
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide après la durée spécifiée
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  if (!visible && opacity._value === 0) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        zIndex: 9999,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <LinearGradient
        colors={config.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 16,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons
          name={config.icon as any}
          size={24}
          color={config.iconColor}
          style={{ marginRight: 12 }}
        />
        <Text
          style={{
            flex: 1,
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
            lineHeight: 20,
          }}
          numberOfLines={3}
        >
          {message}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
}