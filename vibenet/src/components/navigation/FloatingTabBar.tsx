import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewStyle,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Colors, Radii, Shadows, Spacing } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

export interface TabItem {
  name: string;
  route: string;
  iconType: 'ionicons' | 'feather';
  iconName: string;
  activeIconName: string;
  badgeCount?: number;
  isAvatar?: boolean;
}

export function FloatingTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const tabs: TabItem[] = [
    {
      name: 'Feed',
      route: '/',
      iconType: 'ionicons',
      iconName: 'home-outline',
      activeIconName: 'home',
    },
    {
      name: 'Explore',
      route: '/explore',
      iconType: 'feather',
      iconName: 'compass',
      activeIconName: 'compass',
    },
    {
      name: 'Locket',
      route: '/locket',
      iconType: 'ionicons',
      iconName: 'camera-outline',
      activeIconName: 'camera',
    },
    {
      name: 'Messages',
      route: '/messages',
      iconType: 'ionicons',
      iconName: 'chatbubble-ellipses-outline',
      activeIconName: 'chatbubble-ellipses',
      badgeCount: 2,
    },
    {
      name: 'Profile',
      route: '/profile',
      iconType: 'ionicons',
      iconName: 'person-outline',
      activeIconName: 'person',
      isAvatar: true,
    },
  ];

  const isTabActive = (tabRoute: string) => {
    if (tabRoute === '/') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    }
    return pathname.includes(tabRoute);
  };

  const handleTabPress = (tabRoute: string) => {
    if (tabRoute === '/') {
      router.push('/(tabs)');
    } else {
      router.push(`/(tabs)${tabRoute}` as any);
    }
  };

  const renderContent = () => (
    <View style={styles.tabBarInner}>
      {tabs.map((tab) => {
        const active = isTabActive(tab.route);

        return (
          <TouchableOpacity
            key={tab.name}
            activeOpacity={0.8}
            onPress={() => handleTabPress(tab.route)}
            style={[styles.tabButton, active && styles.activeTabButton]}>
            {tab.isAvatar && user?.avatarUrl ? (
              <View style={[styles.avatarWrapper, active && styles.activeAvatarWrapper]}>
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={styles.avatarImg}
                />
              </View>
            ) : (
              <View style={styles.iconContainer}>
                {tab.iconType === 'ionicons' ? (
                  <Ionicons
                    name={(active ? tab.activeIconName : tab.iconName) as any}
                    size={22}
                    color={active ? Colors.navPillActiveIcon : Colors.navPillInactiveIcon}
                  />
                ) : (
                  <Feather
                    name={tab.iconName as any}
                    size={22}
                    color={active ? Colors.navPillActiveIcon : Colors.navPillInactiveIcon}
                  />
                )}

                {tab.badgeCount && tab.badgeCount > 0 && !active ? (
                  <View style={styles.badgeDot} />
                ) : null}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.containerWrapper}>
        <View style={[styles.webBarContainer, Shadows.floatingNav as ViewStyle]}>
          {renderContent()}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.containerWrapper}>
      <BlurView
        intensity={80}
        tint="dark"
        style={[styles.barContainer, Shadows.floatingNav as ViewStyle]}>
        {renderContent()}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    position: 'absolute',
    bottom: Spacing.four + (Platform.OS === 'ios' ? 10 : 6),
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    pointerEvents: 'box-none',
  },
  barContainer: {
    borderRadius: Radii.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: Colors.navPillBg,
  },
  webBarContainer: {
    borderRadius: Radii.pill,
    backgroundColor: 'rgba(20, 20, 22, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    // @ts-ignore
    backdropFilter: 'blur(24px)',
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one + 2,
    gap: Spacing.two,
  },
  tabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: Colors.navPillActiveBg,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.statusLive,
    borderWidth: 1.5,
    borderColor: Colors.navPillBg,
  },
  avatarWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
  },
  activeAvatarWrapper: {
    borderWidth: 2,
    borderColor: Colors.textPrimary,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
});
