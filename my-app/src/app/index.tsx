import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth-context';

const API = 'http://localhost:5000';

type User = { id: number; username: string; name: string };

export default function HomeScreen() {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/friends`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setFriends(data); })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token || query.length === 0) { setResults([]); return; }
    fetch(`${API}/api/users/search?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setResults(data); })
      .catch(() => {});
  }, [query, token]);

  const isFriend = (id: number) => friends.some(f => f.id === id);

  const addFriend = (user: User) => {
    if (!token || isFriend(user.id)) return;
    fetch(`${API}/api/friends/add`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ friend_id: user.id }),
    })
      .then(r => r.json())
      .then(data => { if (data.ok) setFriends(prev => [...prev, user]); })
      .catch(() => {});
  };

  const removeFriend = (user: User) => {
    if (!token) return;
    fetch(`${API}/api/friends/remove`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ friend_id: user.id }),
    })
      .then(r => r.json())
      .then(data => { if (data.ok) setFriends(prev => prev.filter(f => f.id !== user.id)); })
      .catch(() => {});
  };

return (
    <SafeAreaView style={styles.container}>
      {/* Left Panel */}
      <View style={styles.leftPanel}>
        <Text style={styles.panelTitle}>Find Friends</Text>

        <TextInput
          style={styles.searchBar}
          placeholder="Search..."
          placeholderTextColor="#000"
          value={query}
          onChangeText={setQuery}
        />

        {results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={item => String(item.id)}
            style={styles.resultsList}
            renderItem={({ item }) => (
              <View style={styles.resultRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name[0]}</Text>
                </View>
                <Text style={styles.resultName}>{item.name}</Text>
                <TouchableOpacity
                  style={[styles.addButton, isFriend(item.id) && styles.addButtonAdded]}
                  onPress={() => isFriend(item.id) ? removeFriend(item) : addFriend(item)}
                >
                  <Text style={styles.addButtonText}>{isFriend(item.id) ? '✓' : '+'}</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        <Text style={styles.sectionLabel}>My Friends ({friends.length})</Text>
        {friends.length === 0 ? (
          <Text style={styles.emptyText}>Add some friends!</Text>
        ) : (
          <FlatList
            data={friends}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <View style={styles.resultRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name[0]}</Text>
                </View>
                <Text style={styles.resultName}>{item.name}</Text>
              </View>
            )}
          />
        )}
      </View>

      {/* Right - Main Content */}
      <View style={styles.mainContent}>
        <Text style={styles.title}>FriendVenture</Text>
        <Text style={styles.subtitle}>Your adventures, together.</Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9bd0ec',
    flexDirection: 'row',
  },
  leftPanel: {
    width: '35%',
    backgroundColor: '#C9ECF6',
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    padding: 16,
    paddingTop: 24,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'hsl(201, 59%, 14%)',
  },
  subtitle: {
    fontSize: 16,
    color: 'hsl(200, 37%, 24%)',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'hsl(201, 59%, 14%)',
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 12,
  },
  resultsList: {
    maxHeight: 180,
    marginBottom: 8,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9bd0ec',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontWeight: '700',
    fontSize: 13,
    color: 'hsl(201, 59%, 14%)',
  },
  resultName: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'hsl(201, 59%, 14%)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonAdded: {
    backgroundColor: '#9bd0ec',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'hsl(201, 59%, 14%)',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#000',
    fontSize: 12,
  },
});
