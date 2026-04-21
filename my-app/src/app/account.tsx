import { useEffect } from 'react';
import { useRouter, type Href } from 'expo-router';
import { useAuth } from '@/context/auth-context';

export default function AccountScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login' as Href);
    }
  }, [isAuthenticated]);

  return null;
}
