import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/auth-context';

export default function AccountScreen() {
  const router = useRouter();
  const { logout, username } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login' as Href);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        {username ? (
          <Text style={styles.greeting}>Logged in as{'\n'}{username}</Text>
        ) : null}

        <Pressable style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Log Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'hsl(0, 0%, 80%)',
    borderRadius: 10,
    padding: 30,
    gap: 20,
  },
  greeting: {
    fontSize: 16,
    textAlign: 'center',
    color: 'hsl(0, 0%, 30%)',
    lineHeight: 24,
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