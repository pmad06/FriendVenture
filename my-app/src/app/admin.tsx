import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { API_BASE_URL } from '@/constants/api';
import { useAuth } from '@/context/auth-context';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminPanel() {
  const { token, role } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // redirect non-admins away from this screen 
  useEffect(() => {
    if (role !== 'admin') {
      router.replace('/');
      return;
    }
    fetchUsers();
  }, [role]);

  // loads all users from the backend to display in the admin panel
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to load users.');
        return;
      }
      setUsers(data);
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  // asks admin to confirm before permanently deleting a user and all their data
  const handleDelete = (user: User) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete @${user.username}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });
              if (res.ok) {
                //remove the deleted user from the list without a full reload
                setUsers(prev => prev.filter(u => u.id !== user.id));
              } else {
                const data = await res.json();
                Alert.alert('Error', data.error ?? 'Could not delete user.');
              }
            } catch {
              Alert.alert('Error', 'Could not connect to server.');
            }
          },
        },
      ]
    );
  };

  // toggles a user between member and admin roles
  const handleToggleRole = async (user: User) => {
    const newRole = user.role === 'admin' ? 'member' : 'admin';
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}/role`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        //update the role badge in the list immediately without a full reload
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      } else {
        const data = await res.json();
        Alert.alert('Error', data.error ?? 'Could not change role.');
      }
    } catch {
      Alert.alert('Error', 'Could not connect to server.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0F2B3A" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Admin Panel</Text>
      {/* shows total number of registered users */}
      <Text style={styles.subheader}>{users.length} users</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* one card per user showing their info, role badge, and action buttons */}
      {users.map(user => (
        <View key={user.id} style={styles.card}>
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.name}>{user.first_name} {user.last_name}</Text>
              <Text style={styles.username}>@{user.username}</Text>
              <Text style={styles.email}>{user.email}</Text>
            </View>
            {/* badge color changes based on whether the user is admin or member */}
            <View style={[styles.badge, user.role === 'admin' ? styles.badgeAdmin : styles.badgeMember]}>
              <Text style={styles.badgeText}>{user.role}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            {/* promote or demote the user depending on their current role */}
            <Pressable
              style={[styles.btn, styles.btnRole]}
              onPress={() => handleToggleRole(user)}>
              <Text style={styles.btnText}>
                {user.role === 'admin' ? 'Demote to Member' : 'Promote to Admin'}
              </Text>
            </Pressable>
            {/* delete button removes the user and all their data permanently */}
            <Pressable
              style={[styles.btn, styles.btnDelete]}
              onPress={() => handleDelete(user)}>
              <Text style={styles.btnText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#9bd0ec',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9bd0ec',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F2B3A',
    marginBottom: 4,
  },
  subheader: {
    fontSize: 13,
    color: '#0F2B3A',
    marginBottom: 16,
    opacity: 0.7,
  },
  error: {
    color: 'hsl(0, 80%, 55%)',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#C9ECF6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F2B3A',
  },
  username: {
    fontSize: 13,
    color: '#0F2B3A',
    opacity: 0.8,
  },
  email: {
    fontSize: 12,
    color: '#0F2B3A',
    opacity: 0.6,
    marginTop: 2,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeAdmin: {
    backgroundColor: '#0F2B3A',
  },
  badgeMember: {
    backgroundColor: '#9bd0ec',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  btnRole: {
    backgroundColor: '#0F2B3A',
  },
  btnDelete: {
    backgroundColor: 'hsl(0, 70%, 50%)',
  },
  btnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
