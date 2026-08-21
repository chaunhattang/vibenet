import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { resolveMediaUrl } from '../../services/config';
import { onNotification } from '../../services/websocket';
import { getUnreadCount } from '../../services/api/notifications';

export interface TabItem {
  name: string;
  route: string;
  activeIcon: string;
  inactiveIcon: string;
  isProfile?: boolean;
}

export function FloatingTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [unreadNotiCount, setUnreadNotiCount] = useState(0);

  const isDarkScreen = pathname.includes('/locket');

  useEffect(() => {
    if (!user) return;
    getUnreadCount()
      .then((count) => setUnreadNotiCount(count))
      .catch(() => {});

    const unsubscribe = onNotification(() => {
      setUnreadNotiCount((prev) => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (pathname.includes('/notifications')) {
      setUnreadNotiCount(0);
    }
  }, [pathname]);

  const tabs: TabItem[] = [
    {
      name: 'Feed',
      route: '/',
      activeIcon: 'home',
      inactiveIcon: 'home-outline',
    },
    {
      name: 'Explore',
      route: '/explore',
      activeIcon: 'search',
      inactiveIcon: 'search-outline',
    },
    {
      name: 'Locket',
      route: '/locket',
      activeIcon: 'camera',
      inactiveIcon: 'camera-outline',
    },
    {
      name: 'Notifications',
      route: '/notifications',
      activeIcon: 'heart',
      inactiveIcon: 'heart-outline',
    },
    {
      name: 'Profile',
      route: '/profile',
      activeIcon: 'person',
      inactiveIcon: 'person-outline',
      isProfile: true,
    },
  ];

  const isTabActive = (tabRoute: string) => {
    if (tabRoute === '/') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    }
    return pathname.includes(tabRoute);
  };

  const handleTabPress = (tabRoute: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    if (tabRoute === '/notifications') {
      setUnreadNotiCount(0);
    }

    if (tabRoute === '/') {
      router.push('/(tabs)');
    } else {
      router.push(`/(tabs)${tabRoute}` as any);
    }
  };

  const activeIconColor = isDarkScreen ? '#FFFFFF' : '#000000';
  const inactiveIconColor = isDarkScreen ? '#9CA3AF' : '#262626';

  return (
    <View
      style={[
        styles.tabBarContainer,
        isDarkScreen ? styles.darkTabBar : styles.lightTabBar,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}>
      <View style={styles.tabBarRow}>
        {tabs.map((tab) => {
          const active = isTabActive(tab.route);
          const isNotiTab = tab.route === '/notifications';

          if (tab.isProfile) {
            return (
              <TouchableOpacity
                key={tab.name}
                activeOpacity={0.7}
                onPress={() => handleTabPress(tab.route)}
                style={styles.tabButton}>
                <View
                  style={[
                    styles.profileAvatarBorder,
                    active && (isDarkScreen ? styles.activeProfileBorderDark : styles.activeProfileBorderLight),
                  ]}>
                  <Image
                    source={{
                      uri:
                        resolveMediaUrl(user?.profileResponse?.avatarUrl) ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                    }}
                    style={styles.profileAvatarImg}
                  />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.name}
              activeOpacity={0.7}
              onPress={() => handleTabPress(tab.route)}
              style={styles.tabButton}>
              <View style={styles.iconWrap}>
                <Ionicons
                  name={(active ? tab.activeIcon : tab.inactiveIcon) as any}
                  size={27}
                  color={active ? activeIconColor : inactiveIconColor}
                />
                {isNotiTab && unreadNotiCount > 0 && (
                  <View style={styles.notiBadgeDot} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 999,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  lightTabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#EFEFEF',
  },
  darkTabBar: {
    backgroundColor: '#000000',
    borderTopColor: 'rgba(255, 255, 255, 0.14)',
  },
  tabBarRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarBorder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    padding: 1.5,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeProfileBorderLight: {
    borderColor: '#000000',
  },
  activeProfileBorderDark: {
    borderColor: '#FFFFFF',
  },
  profileAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
  },
  iconWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notiBadgeDot: {
    position: 'absolute',
    top: 0,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
});
