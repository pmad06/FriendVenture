import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_USERS = [
  { id: '1', name: 'Alex Johnson' },
  { id: '2', name: 'Jamie Lee' },
  { id: '3', name: 'Sam Rivera' },
  { id: '4', name: 'Taylor Kim' },
  { id: '5', name: 'Jordan Smith' },
];

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [friends, setFriends] = useState<string[]>([]);

  const results = MOCK_USERS.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) && query.length > 0
  );

  const addFriend = (id: string) => {
    if (!friends.includes(id)) setFriends([...friends, id]);
  };

  const isFriend = (id: string) => friends.includes(id);

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
            keyExtractor={item => item.id}
            style={styles.resultsList}
            renderItem={({ item }) => (
              <View style={styles.resultRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name[0]}</Text>
                </View>
                <Text style={styles.resultName}>{item.name}</Text>
                <TouchableOpacity
                  style={[styles.addButton, isFriend(item.id) && styles.addButtonAdded]}
                  onPress={() => addFriend(item.id)}
                  disabled={isFriend(item.id)}
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
            data={MOCK_USERS.filter(u => friends.includes(u.id))}
            keyExtractor={item => item.id}
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