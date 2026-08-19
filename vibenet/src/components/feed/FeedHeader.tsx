import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radii } from '../../constants/theme';

type HomeTab = 'feed' | 'reels' | 'everyone';

interface FeedHeaderProps {
  activeTab?: HomeTab;
  onChangeTab?: (tab: HomeTab) => void;
  unreadChatCount?: number;
  onPressAdd?: () => void;
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  activeTab = 'feed',
  onChangeTab,
  unreadChatCount = 2,
  onPressAdd,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isReels = activeTab === 'reels';

  return (
    <View
      style={[
        styles.headerContainer,
        isReels
          ? [styles.reelsHeaderBg, { paddingTop: Math.max(insets.top, 12) + 4 }]
          : null,
      ]}>
      {/* Left '+' Create Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPressAdd || (() => router.push('/(tabs)/locket'))}
        style={[styles.iconButton, isReels && styles.reelsIconButton]}>
        <Feather
          name="plus"
          size={22}
          color={isReels ? '#FFFFFF' : Colors.textPrimary}
        />
      </TouchableOpacity>

      {/* Center Feed / Reels / Everyone Segmented Switcher */}
      <View style={[styles.switcherContainer, isReels && styles.reelsSwitcherBg]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onChangeTab?.('feed')}
          style={[styles.switcherTab, activeTab === 'feed' && styles.activeSwitcherTab]}>
          <Text
            style={[
              styles.switcherText,
              activeTab === 'feed'
                ? styles.activeSwitcherText
                : isReels
                ? styles.inactiveReelsText
                : styles.inactiveSwitcherText,
            ]}>
            Feed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onChangeTab?.('reels')}
          style={[styles.switcherTab, isReels && styles.activeSwitcherTab]}>
          <View style={styles.switcherTabContent}>
            <Text
              style={[
                styles.switcherText,
                isReels ? styles.activeSwitcherText : styles.inactiveSwitcherText,
              ]}>
              Reels
            </Text>
            <Ionicons
              name="sparkles"
              size={11}
              color={isReels ? '#FF2D55' : Colors.textTertiary}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onChangeTab?.('everyone')}
          style={[styles.switcherTab, activeTab === 'everyone' && styles.activeSwitcherTab]}>
          <View style={styles.switcherTabContent}>
            <Text
              style={[
                styles.switcherText,
                activeTab === 'everyone'
                  ? styles.activeSwitcherText
                  : isReels
                  ? styles.inactiveReelsText
                  : styles.inactiveSwitcherText,
              ]}>
              Everyone
            </Text>
            <Ionicons
              name="earth"
              size={11}
              color={activeTab === 'everyone' ? Colors.accentBlue : Colors.textTertiary}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Right DM Paper Plane Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push('/(tabs)/messages')}
        style={[styles.iconButton, isReels && styles.reelsIconButton]}>
        <Ionicons
          name="paper-plane-outline"
          size={20}
          color={isReels ? '#FFFFFF' : Colors.textPrimary}
          style={styles.paperPlaneIcon}
        />
        {unreadChatCount > 0 && (
          <View style={styles.notificationDot}>
            <View style={styles.innerDot} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    backgroundColor: Colors.bgMain,
    zIndex: 50,
  },
  reelsHeaderBg: {
    height: 'auto',
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    paddingBottom: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.pill,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' },
    }),
  },
  reelsIconButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  paperPlaneIcon: {
    transform: [{ rotate: '-10deg' }],
  },
  switcherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F3',
    borderRadius: Radii.pill,
    padding: 3,
  },
  reelsSwitcherBg: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  switcherTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radii.pill,
  },
  activeSwitcherTab: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)' },
    }),
  },
  switcherTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  switcherText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  activeSwitcherText: {
    color: Colors.textPrimary,
  },
  inactiveSwitcherText: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  inactiveReelsText: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.statusLive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
});
