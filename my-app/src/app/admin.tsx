import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

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

const EMPTY_FORM = { firstName: '', lastName: '', username: '', email: '', password: '', role: 'member' as 'admin' | 'member' };

export default function AdminPanel() {
  const { token, role } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  //form state for creating a new user
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

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

  // submits the create user form and adds the new user to the list
  const handleCreateUser = async () => {
    setFormError('');
    if (!form.firstName.trim() || !form.lastName.trim() || !form.username.trim() || !form.email.trim() || !form.password) {
      setFormError('All fields are required.');
      return;
    }
    if (form.password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    setFormLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? 'Could not create user.');
        return;
      }
      //add the newly created user to the top of the list and reset the form
      setUsers(prev => [...prev, data]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch {
      setFormError('Could not connect to server.');
    } finally {
      setFormLoading(false);
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

      {/* button to toggle the create user form */}
      <Pressable style={styles.createBtn} onPress={() => { setShowForm(v => !v); setFormError(''); }}>
        <Text style={styles.createBtnText}>{showForm ? 'Cancel' : '+ Create User'}</Text>
      </Pressable>

      {/* create user form — only visible when the admin clicks the button above */}
      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>New User</Text>

          {formError ? <Text style={styles.error}>{formError}</Text> : null}

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="First Name"
              placeholderTextColor="#555"
              value={form.firstName}
              onChangeText={v => setForm(f => ({ ...f, firstName: v }))}
              autoCapitalize="words"
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Last Name"
              placeholderTextColor="#555"
              value={form.lastName}
              onChangeText={v => setForm(f => ({ ...f, lastName: v }))}
              autoCapitalize="words"
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#555"
            value={form.username}
            onChangeText={v => setForm(f => ({ ...f, username: v }))}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#555"
            value={form.email}
            onChangeText={v => setForm(f => ({ ...f, email: v }))}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password (min 6 characters)"
            placeholderTextColor="#555"
            value={form.password}
            onChangeText={v => setForm(f => ({ ...f, password: v }))}
            secureTextEntry
          />

          {/* role picker — admin toggles between member and admin before saving */}
          <View style={styles.roleRow}>
            <Text style={styles.roleLabel}>Role:</Text>
            <Pressable
              style={[styles.roleChip, form.role === 'member' && styles.roleChipActive]}
              onPress={() => setForm(f => ({ ...f, role: 'member' }))}>
              <Text style={styles.roleChipText}>Member</Text>
            </Pressable>
            <Pressable
              style={[styles.roleChip, form.role === 'admin' && styles.roleChipActive]}
              onPress={() => setForm(f => ({ ...f, role: 'admin' }))}>
              <Text style={styles.roleChipText}>Admin</Text>
            </Pressable>
          </View>

          <Pressable style={styles.submitBtn} onPress={handleCreateUser} disabled={formLoading}>
            {formLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitBtnText}>Create User</Text>}
          </Pressable>
        </View>
      )}

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
  createBtn: {
    backgroundColor: '#0F2B3A',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  createBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  formCard: {
    backgroundColor: '#C9ECF6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F2B3A',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    backgroundColor: '#9bd0ec',
    borderWidth: 1,
    borderColor: '#0F2B3A',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#0F2B3A',
    flex: 1,
  },
  halfInput: {
    flex: 1,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F2B3A',
  },
  roleChip: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#9bd0ec',
  },
  roleChipActive: {
    backgroundColor: '#0F2B3A',
  },
  roleChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  submitBtn: {
    backgroundColor: '#0F2B3A',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
