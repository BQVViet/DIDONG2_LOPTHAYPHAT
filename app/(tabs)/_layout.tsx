import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={28} color={color} />
          ),
        }}
      />

      {/* CART */}
      <Tabs.Screen
        name="Order"
        options={{
          title: 'Đơn hàng',
          tabBarIcon: ({ color }) => (
            <Ionicons name="document-text" size={28} color={color} />
          ),
        }}
      />
        {/* Notification */}
      <Tabs.Screen
        name="Notification"
        options={{
          title: 'Thông báo',
          tabBarIcon: ({ color }) => (
            <Ionicons name="notifications" size={28} color={color} />
          ),
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Tài khoản',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={28} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}
