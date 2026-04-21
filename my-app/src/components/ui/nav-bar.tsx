import { SymbolView } from 'expo-symbols';
import { usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth-context';

const BASE_NAV_ITEMS = [
  { label: 'Home',     path: '/'         },
  { label: 'Tasks',    path: '/explore'  },
  { label: 'Account',  path: '/account'  },
  { label: 'Settings', path: '/settings' },
];

export function NavBar() {
  const [isOpen, setIsOpen]               = useState(false);
  const [dropdownVisible, setDropdown]    = useState(false);
  const { isAuthenticated, username, role, logout } = useAuth();

  const NAV_ITEMS = role === 'admin'
    ? [...BASE_NAV_ITEMS, { label: 'Admin', path: '/admin' }]
    : BASE_NAV_ITEMS;
  const router   = useRouter();
  const pathname = usePathname();
  const insets   = useSafeAreaInsets();

  const handleNavPress = (path: string) => {
    if (path === '/account') {
      if (isAuthenticated) {
        setIsOpen(false);
        setDropdown(true);
      } else {
        setIsOpen(false);
        router.replace('/login');
      }
    } else {
      setIsOpen(false);
      router.push(path as any);
    }
  };

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      {/* Always-visible header row */}
      <Pressable
        style={({ pressed }) => [styles.heading, pressed && styles.headingPressed]}
        onPress={() => setIsOpen(v => !v)}>
        <View style={styles.chevronBox}>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={14}
            weight="bold"
            tintColor="#0F2B3A"
            style={{ transform: [{ rotate: isOpen ? '-90deg' : '90deg' }] }}
          />
        </View>
        <Text style={styles.appName}>FriendVenture</Text>
      </Pressable>

      {/* Expandable nav items */}
      {isOpen && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.navList}>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.path || (item.path === '/' && pathname === '/index');
            const label = item.path === '/account'
              ? (isAuthenticated ? 'Log Out' : 'Account') : item.label;
            return (
              <Pressable
                key={item.path}
                style={({ pressed }) => [styles.navItem, active && styles.navItemActive, pressed && styles.navItemPressed]}
                onPress={() => handleNavPress(item.path)}>
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </Animated.View>
      )}

      {/* Account dropdown modal */}
      <Modal visible={dropdownVisible} transparent animationType="fade" onRequestClose={() => setDropdown(false)}>
        <Pressable style={styles.backdrop} onPress={() => setDropdown(false)}>
          <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
            {username ? <Text style={styles.cardUsername}>{username}</Text> : null}
            <View style={styles.divider} />
            <Pressable
              style={styles.logoutBtn}
              onPress={async () => {
                setDropdown(false);
                await logout();
                router.replace('/login');
              }}>
              <Text style={styles.logoutText}>Log Out</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#C9ECF6',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  headingPressed: { opacity: 0.7 },
  chevronBox: {
    width: 28,
    height: 28,
    borderRadius: 12,
    backgroundColor: '#9bd0ec',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F2B3A',
  },
  navList: {
    marginTop: 4,
    marginLeft: 8,
    gap: 2,
    paddingBottom: 6,
  },
  navItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  navItemActive: {
    backgroundColor: '#9bd0ec',
  },
  navItemPressed: { opacity: 0.7 },
  navLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F2B3A',
  },
  navLabelActive: {
    fontWeight: '700',
  },

  // Modal dropdown
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,43,58,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#C9ECF6',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 180,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
  cardUsername: {
    fontSize: 13,
    color: '#0F2B3A',
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#9bd0ec',
    marginHorizontal: 8,
  },
  logoutBtn: {
    backgroundColor: '#0F2B3A',
    borderRadius: 10,
    marginHorizontal: 8,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
});
