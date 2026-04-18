import { useEffect } from 'react';
import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/auth-context';

export default function AccountScreen() {
  const router = useRouter();
  const { isAuthenticated, logout, username } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login' as Href);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <Pressable style={styles.backdrop} onPress={() => router.back()}>
      <Pressable style={styles.dropdown} onPress={e => e.stopPropagation()}>
        {username ? <Text style={styles.username}>{username}</Text> : null}
        <View style={styles.divider} />
        <Pressable
          style={styles.logoutBtn}
          onPress={async () => {
            await logout();
            router.replace('/login' as Href);
          }}>
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingBottom: 70,
    paddingRight: 16,
  },
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 160,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
  username: {
    fontSize: 13,
    color: 'hsl(0, 0%, 40%)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'hsl(0, 0%, 90%)',
    marginHorizontal: 8,
  },
  logoutBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  logoutText: {
    fontSize: 15,
    color: 'hsl(247, 83%, 60%)',
    fontWeight: '500',
  },
});
