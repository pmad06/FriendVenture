import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth-context';
import { usePet } from '@/context/pet-context';

const API = 'http://localhost:5000';

type User = { id: number; username: string; name: string; health?: number };

type LeaderboardEntry = {
  id: number;
  name: string;
  health: number;
  rank: number;
  isMe: boolean;
};

export default function HomeScreen() {
  const { token } = useAuth();
  const { stats } = usePet();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // ── Fetch friends ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/friends`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setFriends(data); })
      .catch(() => {});
  }, [token]);

  // ── Search users ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token || query.length === 0) { setResults([]); return; }
    fetch(`${API}/api/users/search?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setResults(data); })
      .catch(() => {});
  }, [query, token]);

  // ── Build leaderboard from friends + self ──────────────────────────────────
  useEffect(() => {
    const myEntry: LeaderboardEntry = {
      id: 0,
      name: 'You',
      health: stats.health,
      rank: 0,
      isMe: true,
    };

    // Placeholder health for friends until backend supports pet stats
    const friendEntries: LeaderboardEntry[] = friends.map(f => ({
      id: f.id,
      name: f.name,
      health: f.health ?? 50,
      rank: 0,
      isMe: false,
    }));

    const sorted = [myEntry, ...friendEntries]
      .sort((a, b) => b.health - a.health)
      .map((e, i) => ({ ...e, rank: i + 1 }));

    setLeaderboard(sorted);
  }, [stats.health, friends]);

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

  const renderLeaderboardItem = ({ item }: { item: LeaderboardEntry }) => (
    <View style={[styles.leaderRow, item.isMe && styles.leaderRowMe]}>
      <Text style={[styles.rankText, item.rank <= 3 && styles.rankTextTop]}>
        #{item.rank}
      </Text>
      <View style={[styles.avatar, item.isMe && styles.avatarMe]}>
        <Text style={[styles.avatarText, item.isMe && styles.avatarTextMe]}>
          {item.name[0].toUpperCase()}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.leaderName, item.isMe && styles.leaderNameMe]}>
          {item.name}
        </Text>
        <View style={styles.healthBarTrack}>
          <View style={[styles.healthBarFill, { width: `${item.health}%` as any }]} />
        </View>
      </View>
      <Text style={styles.healthNumber}>{item.health}%</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>

      {/* Left Panel — Friends */}
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

      {/* Center — Main Content */}
      <View style={styles.mainContent}>
        <Text style={styles.title}>FriendVenture</Text>
        <Text style={styles.subtitle}>Your adventures, together.</Text>
      </View>

      {/* Right Panel — Leaderboard */}
      <View style={styles.rightPanel}>
        <Text style={styles.panelTitle}>Leaderboard</Text>
        <Text style={styles.legendText}>Ranked by pet health</Text>

        {leaderboard.length === 0 ? (
          <Text style={styles.emptyText}>Add friends to compete!</Text>
        ) : (
          <FlatList
            data={leaderboard}
            keyExtractor={item => item.isMe ? 'me' : String(item.id)}
            renderItem={renderLeaderboardItem}
            showsVerticalScrollIndicator={false}
          />
        )}
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

  // ── Left Panel ─────────────────────────────────────────────────────────────
  leftPanel: {
    width: '25%',
    backgroundColor: '#C9ECF6',
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    padding: 16,
    paddingTop: 24,
  },

  // ── Center ─────────────────────────────────────────────────────────────────
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0F2B3A',
  },
  subtitle: {
    fontSize: 16,
    color: '#0F2B3A',
  },

  // ── Right Panel ────────────────────────────────────────────────────────────
  rightPanel: {
    width: '25%',
    backgroundColor: '#C9ECF6',
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
    padding: 16,
    paddingTop: 24,
  },

  // ── Shared ─────────────────────────────────────────────────────────────────
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F2B3A',
    marginBottom: 8,
  },
  legendText: {
    fontSize: 11,
    color: '#2a7fa5',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F2B3A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#000',
    fontSize: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9bd0ec',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMe: {
    backgroundColor: '#0F2B3A',
  },
  avatarText: {
    fontWeight: '700',
    fontSize: 13,
    color: '#0F2B3A',
  },
  avatarTextMe: {
    color: '#C9ECF6',
  },

  // ── Friends panel ──────────────────────────────────────────────────────────
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
  resultName: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F2B3A',
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

  // ── Leaderboard panel ──────────────────────────────────────────────────────
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  leaderRowMe: {
    backgroundColor: '#9bd0ec',
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  rankText: {
    width: 24,
    fontSize: 12,
    fontWeight: '600',
    color: '#0F2B3A',
    opacity: 0.5,
  },
  rankTextTop: {
    opacity: 1,
    fontWeight: '800',
  },
  leaderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F2B3A',
    marginBottom: 3,
  },
  leaderNameMe: {
    fontWeight: '800',
  },
  healthBarTrack: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#0F2B3A',
  },
  healthNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2B3A',
    width: 32,
    textAlign: 'right',
  },
});
