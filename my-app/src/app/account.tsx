import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useAuth } from '@/context/auth-context';

export default function AccountScreen() {
  const router = useRouter();
  const { logout, username } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login' as Href);
  };

  return (
    <Pressable style={styles.screen} onPress={() => router.back()}>
      <Pressable style={styles.container} onPress={e => e.stopPropagation()}>
        {username ? (
          <Text style={styles.greeting}>Logged in as {username}</Text>
        ) : null}

        <Pressable style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Log Out</Text>
        </Pressable>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 90,
  },
  container: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
    minWidth: 200,
  },
  greeting: {
    fontSize: 14,
    textAlign: 'center',
    color: 'hsl(0, 0%, 40%)',
  },
  button: {
    backgroundColor: 'hsl(247, 83%, 66%)',
    borderWidth: 2,
    borderColor: 'hsl(247, 83%, 33%)',
    borderRadius: 10,
    width: 250,
    padding: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
  },
});