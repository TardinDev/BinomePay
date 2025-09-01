import React from 'react';
import { View, Text, Pressable, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon?: string;
  iconColor?: string;
  buttons: Array<{
    text: string;
    onPress: () => void;
    style?: 'primary' | 'secondary' | 'danger';
    loading?: boolean;
  }>;
}

const { width: screenWidth } = Dimensions.get('window');

export default function CustomModal({
  visible,
  onClose,
  title,
  message,
  icon = 'help-circle',
  iconColor = '#60A5FA',
  buttons
}: CustomModalProps) {
  const getButtonStyle = (style: 'primary' | 'secondary' | 'danger' = 'primary') => {
    switch (style) {
      case 'primary':
        return ['#10B981', '#059669']; // Vert
      case 'danger':
        return ['#EF4444', '#DC2626']; // Rouge
      case 'secondary':
        return ['#6B7280', '#4B5563']; // Gris
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      }}>
        <BlurView
          intensity={20}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        
        <View
          style={{
            width: screenWidth * 0.85,
            maxWidth: 400,
            backgroundColor: '#1F2937',
            borderRadius: 24,
            padding: 24,
            borderWidth: 1,
            borderColor: '#374151',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.3,
            shadowRadius: 30,
            elevation: 20,
          }}
        >
          {/* Icône */}
          <View className="items-center mb-4">
            <View
              className="rounded-full p-4 mb-4"
              style={{ backgroundColor: iconColor + '20' }}
            >
              <Ionicons
                name={icon as any}
                size={40}
                color={iconColor}
              />
            </View>
            
            {/* Titre */}
            <Text className="text-white text-xl font-bold text-center mb-2">
              {title}
            </Text>
            
            {/* Message */}
            <Text className="text-gray-300 text-base text-center leading-6">
              {message}
            </Text>
          </View>

          {/* Boutons */}
          <View className="mt-6">
            {buttons.map((button, index) => (
              <Pressable
                key={index}
                onPress={button.onPress}
                disabled={button.loading}
                className={`rounded-xl overflow-hidden ${index < buttons.length - 1 ? 'mb-3' : ''}`}
                style={{ opacity: button.loading ? 0.7 : 1 }}
              >
                <LinearGradient
                  colors={getButtonStyle(button.style)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ paddingVertical: 16, paddingHorizontal: 20 }}
                >
                  <View className="flex-row items-center justify-center">
                    {button.loading ? (
                      <View className="mr-2">
                        <Ionicons name="hourglass" color="#FFFFFF" size={18} />
                      </View>
                    ) : null}
                    <Text className="text-white font-bold text-base">
                      {button.text}
                    </Text>
                  </View>
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}