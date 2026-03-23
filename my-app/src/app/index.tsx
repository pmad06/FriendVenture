import { Redirect, type Href } from 'expo-router';

import { useAuth } from '@/context/auth-context';

// Cast needed until expo-router regenerates typed routes on first `npx expo start`
export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Redirect href={'/(tabs)/' as Href} />;
  return <Redirect href={'/login' as Href} />;
}
