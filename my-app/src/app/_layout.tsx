import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Tabs, useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { PetProvider } from '@/context/pet-context';
import PetWidget from '@/components/PetWidget';

const noTab = { href: null as null };

function AppShell({ colorScheme }: { colorScheme: string | null | undefined }) {
  const { isAuthenticated, username, logout } = useAuth();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const router = useRouter();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <PetProvider>
        <View style={{ flex: 1 }}>
          <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
            <Tabs.Screen name="explore" options={{ title: 'Tasks' }} />
            <Tabs.Screen
              name="account"
              options={{ title: 'Account' }}
              listeners={{
                tabPress: e => {
                  if (isAuthenticated) {
                    e.preventDefault();
                    setDropdownVisible(true);
                  }
                },
              }}
            />
            <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
            <Tabs.Screen name="login" options={noTab} />
            <Tabs.Screen name="create-account" options={noTab} />
            <Tabs.Screen name="forgot-password" options={noTab} />
          </Tabs>

          {isAuthenticated && <PetWidget />}

          <Modal visible={dropdownVisible} transparent animationType="fade" onRequestClose={() => setDropdownVisible(false)}>
            <Pressable style={styles.backdrop} onPress={() => setDropdownVisible(false)}>
              <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
                {username ? <Text style={styles.username}>{username}</Text> : null}
                <View style={styles.divider} />
                <Pressable
                  style={styles.logoutBtn}
                  onPress={async () => {
                    setDropdownVisible(false);
                    await logout();
                    router.replace('/login');
                  }}>
                  <Text style={styles.logoutText}>Log Out</Text>
                </Pressable>
              </Pressable>
            </Pressable>
          </Modal>
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

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,43,58,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#C9ECF6',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 180,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
  username: {
    fontSize: 13,
    color: '#0F2B3A',
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#9bd0ec',
    marginHorizontal: 8,
  },
  logoutBtn: {
    backgroundColor: '#0F2B3A',
    borderRadius: 10,
    marginHorizontal: 8,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
});
