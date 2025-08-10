import React from 'react'
import { View, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import useAppStore from '@/store/useAppStore'

export default function TabsLayout() {
  const unreadTotal = useAppStore((s) => s.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0))
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#EAB308',
        tabBarInactiveTintColor: 'gray',
        tabBarBackground: () => (
          <LinearGradient
            colors={["#0B1220", "#0B0F1A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
          />
        ),
        tabBarStyle: {
          backgroundColor: 'rgba(11,15,26,0.95)',
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
          fontWeight: '700',
          marginBottom: 4,
          letterSpacing: 0.3,
          fontSize: 13,
          textTransform: 'capitalize',
        },
        tabBarItemStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'intention',
          tabBarActiveTintColor: '#EAB308',
          tabBarIcon: ({ color }) => (
            <View style={{}}>
              <Ionicons name="swap-horizontal-sharp" color={color} size={28} />
            </View>
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text style={{ color, fontWeight: '800', fontSize: 18, opacity: focused ? 1 : 0.9 }}>Intention</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarActiveTintColor: '#60A5FA',
          tabBarIcon: ({ color }) => (
            <View style={{ }}>
              <Ionicons name="chatbubble-ellipses-sharp" color={color} size={28} />
              {unreadTotal > 0 && (
                <View style={{ position: 'absolute', top: 0, right: 0, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }} numberOfLines={1}>
                    {unreadTotal > 9 ? '9+' : unreadTotal}
                  </Text>
                </View>
              )}
            </View>
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text style={{ color, fontWeight: '800', fontSize: 18, opacity: focused ? 1 : 0.9 }}>Messages</Text>
          ),
        }}
      />
     
    </Tabs>
  )
}