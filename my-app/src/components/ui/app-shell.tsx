import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Tabs } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useAuth } from '@/context/auth-context';
import { PetProvider } from '@/context/pet-context';
import PetWidget from '@/components/PetWidget';
import { NavBar } from '@/components/ui/nav-bar';

const noTab = { href: null as null };

export function AppShell({ colorScheme }: { colorScheme: string | null | undefined }) {
  const { isAuthenticated } = useAuth();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <PetProvider>
        <NavBar />
        <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
          <Tabs.Screen name="index" options={{ title: 'Home' }} />
          <Tabs.Screen name="explore" options={{ title: 'Tasks' }} />
          <Tabs.Screen name="account" options={{ title: 'Account' }} />
          <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
          <Tabs.Screen name="login" options={noTab} />
          <Tabs.Screen name="create-account" options={noTab} />
          <Tabs.Screen name="forgot-password" options={noTab} />
        </Tabs>
        {isAuthenticated && <PetWidget />}
      </PetProvider>
    </ThemeProvider>
  );
}
