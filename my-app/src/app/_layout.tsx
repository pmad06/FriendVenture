import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { useColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { PetProvider } from '@/context/pet-context';
import PetWidget from '@/components/PetWidget';

const noTab = { href: null as null };

function AppShell({ colorScheme }: { colorScheme: string | null | undefined }) {
  const { isAuthenticated } = useAuth();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <PetProvider>
        <View style={{flex:1}}>
          <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
            <Tabs.Screen name="explore" options={{ title: 'Tasks' }} />
            <Tabs.Screen name="account" options={{ title: 'Account' }} />
            <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
            <Tabs.Screen name="login" options={noTab} />
            <Tabs.Screen name="create-account" options={noTab} />
            <Tabs.Screen name="forgot-password" options={noTab} />
          </Tabs>
          {isAuthenticated && <PetWidget />}
        </View>
      </PetProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <AppShell colorScheme={colorScheme} />
    </AuthProvider>
  );
}
