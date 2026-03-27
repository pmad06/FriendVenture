import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider } from '@/context/auth-context';

// Auth screens are navigable but hidden from the tab bar
const noTab = { href: null as null };

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Tabs screenOptions={{ headerShown: false }}>
          <Tabs.Screen name="index" options={{ title: 'Home' }} />
          <Tabs.Screen name="explore" options={{ title: 'Tasks' }} />
          <Tabs.Screen name="account" options={{ title: 'Account' }} />
          <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
          <Tabs.Screen name="login" options={noTab} />
          <Tabs.Screen name="create-account" options={noTab} />
          <Tabs.Screen name="forgot-password" options={noTab} />
        </Tabs>
      </ThemeProvider>
    </AuthProvider>
  );
}
