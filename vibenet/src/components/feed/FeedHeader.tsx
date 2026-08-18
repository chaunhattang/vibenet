import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radii } from '../../constants/theme';

interface FeedHeaderProps {
  activeTab?: 'feed' | 'everyone';
  onChangeTab?: (tab: 'feed' | 'everyone') => void;
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
  const isEveryone = activeTab === 'everyone';

  return (
    <View style={styles.headerContainer}>
      {/* Left '+' Create Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPressAdd || (() => router.push('/(tabs)/locket'))}
        style={styles.iconButton}>
        <Feather name="plus" size={22} color={Colors.textPrimary} />
      </TouchableOpacity>

      {/* Center Dual Feed / Everyone Segmented Switcher */}
      <View style={styles.switcherContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onChangeTab?.('feed')}
          style={[styles.switcherTab, !isEveryone && styles.activeSwitcherTab]}>
          <Text style={[styles.switcherText, !isEveryone && styles.activeSwitcherText]}>
            Feed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onChangeTab?.('everyone')}
          style={[styles.switcherTab, isEveryone && styles.activeSwitcherTab]}>
          <View style={styles.everyoneTabContent}>
            <Text style={[styles.switcherText, isEveryone && styles.activeSwitcherText]}>
              Everyone
            </Text>
            <Ionicons
              name="earth"
              size={11}
              color={isEveryone ? Colors.accentBlue : Colors.textTertiary}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Right DM Paper Plane Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push('/(tabs)/messages')}
        style={styles.iconButton}>
        <Ionicons
          name="paper-plane-outline"
          size={20}
          color={Colors.textPrimary}
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
  switcherTab: {
    paddingHorizontal: 16,
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
  everyoneTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  switcherText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  activeSwitcherText: {
    color: Colors.textPrimary,
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
