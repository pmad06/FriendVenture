import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { API_BASE_URL } from '@/constants/api';
import { useAuth } from '@/context/auth-context';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!identifier.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Login failed. Please try again.');
        return;
      }
      await login(data.token, data.username);
      router.replace('/');
    } catch {
      setError('Could not connect to server. Check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.header}>Login</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          placeholder="Username or Email"
          style={styles.input}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style = {({hovered}) => [
            styles.button, 
            hovered && styles.buttonHovered,
          ]}
        >
          { ({hovered}) => (
              loading
              ? <ActivityIndicator color="white" />
              : <Text style={[styles.buttonText, hovered && styles.buttonTextHovered]}>Submit</Text>
          )}
        </Pressable>

        <View style={styles.links}>
          <Pressable onPress={() => router.push('/forgot-password' as Href)}>
            <Text style={styles.linkText}>Forgot Password?</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/create-account' as Href)}>
            <Text style={styles.linkText}>Create Account</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#9bd0ec',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#C9ECF6',
    color: '#0F2B3A',
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
  },
  links: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 16,
  },
  linkText: {
    color: '#0F2B3A',
    fontSize: 13,
  },
});
