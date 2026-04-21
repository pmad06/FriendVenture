import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { API_BASE_URL } from '@/constants/api';

type Step = 'verify' | 'reset' | 'done';

export default function ForgotPassword() {
  const router = useRouter();

  const [username, setUsername]           = useState('');
  const [email, setEmail]                 = useState('');
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // the backend gives us a short-lived reset token after identity is verified
  const [resetToken, setResetToken]       = useState('');

  // 3-step flow: verify identity -> set password -> done
  const [step, setStep]     = useState<Step>('verify');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);


  // step 1 - check that the username and email match an account
  const handleVerify = async () => {
    setError('');
    if (!username.trim() || !email.trim()) {
      setError('Both username and email are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not verify identity. Check your details.');
        return;
      }
      setResetToken(data.reset_token);
      setStep('reset');
    } catch {
      setError('Could not connect to server. Check your network.');
    } finally {
      setLoading(false);
    }
  };

  // step 2 - use the reset token to set a new password
  const handleReset = async () => {
    setError('');
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset_token: resetToken, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not reset password. Please try again.');
        return;
      }
      setStep('done');
    } catch {
      setError('Could not connect to server. Check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.header}>Reset Password</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* step 1: verify identity */}
        {step === 'verify' && (
          <>
            <Text style={styles.note}>
              Enter <Text style={styles.bold}>both</Text> your username and the email linked to your account.
            </Text>

            <TextInput
              placeholder="Username"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              placeholder="Email Address"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Pressable
              style={[styles.button, hovered && styles.buttonHovered]}
              onPress={handleVerify}
              disabled={loading}
              onHoverIn={() => setHovered(true)}
              onHoverOut={() => setHovered(false)}>
              {loading
                ? <ActivityIndicator color={hovered ? '#0F2B3A' : 'white'} />
                : <Text style={[styles.buttonText, hovered && styles.buttonTextHovered]}>Verify Identity</Text>
              }
            </Pressable>
          </>
        )}

        {/* step 2: set new password */}
        {step === 'reset' && (
          <>
            <Text style={styles.note}>Choose a new password.</Text>

            <TextInput
              placeholder="New Password (min 6 characters)"
              secureTextEntry
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <TextInput
              placeholder="Confirm New Password"
              secureTextEntry
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <Pressable style={styles.button} onPress={handleReset} disabled={loading}>
              {loading
                ? <ActivityIndicator color="white" />
                : <Text style={styles.buttonText}>Reset Password</Text>
              }
            </Pressable>
          </>
        )}

        {/* step 3: success */}
        {step === 'done' && (
          <>
            <Text style={styles.success}>✅ Password reset successfully!</Text>
            <Pressable style={styles.button} onPress={() => router.replace('/login' as Href)}>
              <Text style={styles.buttonText}>Back to Login</Text>
            </Pressable>
          </>
        )}

        {step !== 'done' && (
          <Pressable onPress={() => router.back()}>
            <Text style={styles.linkText}>← Back to Login</Text>
          </Pressable>
        )}
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
    borderWidth: 1,
    backgroundColor: '#d2f2fc',
    color: '#0F2B3A',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 320,
  },
  header: {
    fontSize: 30,
    marginBottom: 20,
  },
  note: {
    fontSize: 13,
    color: 'hsl(0, 0%, 40%)',
    textAlign: 'center',
    marginBottom: 14,
    width: 250,
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
    color: 'hsl(0, 0%, 20%)',
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
    textAlign: 'center',
    width: 250,
  },
  success: {
    color: 'hsl(120, 60%, 40%)',
    fontSize: 16,
    marginBottom: 20,
    fontWeight: '600',
  },
  linkText: {
    color: 'hsl(250, 61%, 10%)',
    fontSize: 13,
    marginTop: 16,
  },
});
