import { Redirect, type Href } from 'expo-router';

import AppTabs from '@/components/app-tabs';
import { useAuth } from '@/context/auth-context';

export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    // Cast needed until expo-router regenerates typed routes on first `npx expo start`
    return <Redirect href={'/login' as Href} />;
  }

  return <AppTabs />;
}
