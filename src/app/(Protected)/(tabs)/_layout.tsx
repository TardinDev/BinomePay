import React from 'react'
import { View, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Tabs } from 'expo-router'
import useAppStore from '@/store/useAppStore'
import { Ionicons } from '@expo/vector-icons'


export default function TabsLayout() {
  const unreadTotal = useAppStore((s) => 
    s.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
  )
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarShowLabel: true,
        tabBarBackground: () => (
          <LinearGradient
            colors={["#0B1220", "#0B0F1A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
          />
        ),
        tabBarStyle: {
          backgroundColor: '#273244',
          borderTopColor: '#273244',
          borderTopWidth: 1,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: 'hidden',
          marginHorizontal: 0,
          marginBottom: 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingVertical: 8,
          // Ombres douces (iOS/Android)
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -2 },
          elevation: 10,
        },
        headerStyle: { backgroundColor: '#000000' },
        headerTintColor: '#FFFFFF',
        tabBarLabelStyle: {
          fontWeight: '600',
          marginBottom: 2,
          marginTop: 2,
          fontSize: 14,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
          height: 70,
          justifyContent: 'center',
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Intention',
          tabBarActiveTintColor: '#EAB308',
          tabBarIcon: ({ color }) => (
            <Ionicons
              name='swap-horizontal'
              color={color}
              size={28}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarActiveTintColor: '#60A5FA',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ position: 'relative' }}>
              <Ionicons
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                color={color}
                size={28}
              />
              {unreadTotal > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: '#EF4444',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 4,
                  borderWidth: 2,
                  borderColor: '#0B1220'
                }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }} numberOfLines={1}>
                    {unreadTotal > 9 ? '9+' : unreadTotal}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarActiveTintColor: '#10B981',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              color={color}
              size={28}
            />
          ),
        }}
      />
    </Tabs>
  )
}
