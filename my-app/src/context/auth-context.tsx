import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface AuthContextType {
  token: string | null;
  username: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, username: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  username: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

const TOKEN_KEY = 'fv_auth_token';
const USERNAME_KEY = 'fv_auth_username';
const ROLE_KEY = 'fv_auth_role';

async function storeValue(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function loadValue(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function removeValue(key: string) {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUsername, storedRole] = await Promise.all([
          loadValue(TOKEN_KEY),
          loadValue(USERNAME_KEY),
          loadValue(ROLE_KEY),
        ]);
        if (storedToken) {
          setToken(storedToken);
          setUsername(storedUsername);
          setRole(storedRole ?? 'member');
        }
      } catch (e) {
        console.error('Error loading auth state:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (newToken: string, newUsername: string, newRole: string) => {
    await Promise.all([
      storeValue(TOKEN_KEY, newToken),
      storeValue(USERNAME_KEY, newUsername),
      storeValue(ROLE_KEY, newRole),
    ]);
    setToken(newToken);
    setUsername(newUsername);
    setRole(newRole);
  };

  const logout = async () => {
    await Promise.all([removeValue(TOKEN_KEY), removeValue(USERNAME_KEY), removeValue(ROLE_KEY)]);
    setToken(null);
    setUsername(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, username, role, isAuthenticated: !!token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
