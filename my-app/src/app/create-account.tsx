import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { API_BASE_URL } from '@/constants/api';
import { useAuth } from '@/context/auth-context';

export default function CreateAccount() {
  const router = useRouter();
  const { login } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError('');
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !username.trim() || !password) {
      setError('All fields are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          username: username.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not create account.');
        return;
      }
      await login(data.token, data.username, data.role ?? 'member');
      router.replace('/');
    } catch {
      setError('Could not connect to server. Check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.header}>Create Account</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.row}>
          <TextInput
            placeholder="First Name"
            style={[styles.input, styles.halfInput]}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />
          <TextInput
            placeholder="Last Name"
            style={[styles.input, styles.halfInput]}
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
          />
        </View>

        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          placeholder="Username"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          placeholder="Password (min 6 characters)"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          placeholder="Confirm Password"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Pressable style={({hovered}) => [styles.button, hovered && styles.buttonHovered ]} onPress={handleSignup} disabled={loading}>
          {({hovered}) => (
            loading
            ? <ActivityIndicator color="white" />
            : <Text style={[styles.buttonText, hovered && styles.buttonTextHovered]}>Create Account</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.replace('/login' as Href)}>
          <Text style={styles.linkText}>Already have an account? Log In</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#9bd0ec',
    color: '#0F2B3A',
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#C9ECF6',
    borderWidth: 1,
    borderColor: 'hsl(0, 0%, 80%)',
    borderRadius: 10,
    padding: 20,
  },
  header: {
    fontSize: 30,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#9bd0ec',
    borderWidth: 1,
    borderColor: '#0F2B3A',
    borderRadius: 10,
    width: 250,
    padding: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 0,
  },
  halfInput: {
    width: 120,
  },
  button: {
    backgroundColor: '#0F2B3A',
    borderWidth: 2,
    borderRadius: 10,
    width: 250,
    padding: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonHovered: {
    backgroundColor: '#9bd0ec',
  },
  buttonText: {
    color: 'white',
  },
  buttonTextHovered: {
    color: '#0F2B3A',
  },
  error: {
    color: 'hsl(0, 80%, 55%)',
    marginBottom: 10,
    fontSize: 13,
    textAlign: 'center',
    width: 250,
  },
  linkText: {
    color: '#0F2B3A',
    fontSize: 13,
    marginTop: 16,
  },
});
