import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radii } from '../../constants/theme';

interface FeedHeaderProps {
  unreadNotifCount?: number;
  unreadChatCount?: number;
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  unreadNotifCount = 1,
  unreadChatCount = 2,
}) => {
  const router = useRouter();

  return (
    <View style={styles.headerContainer}>
      {/* Left Menu / Grid Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push('/(tabs)/explore')}
        style={styles.iconButton}>
        <Feather name="grid" size={20} color={Colors.textPrimary} />
      </TouchableOpacity>

      {/* Center Branding */}
      <View style={styles.brandContainer}>
        <Text style={styles.brandTitle}>VibeNet</Text>
      </View>

      {/* Right Actions: Notifications & Direct Messages */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)/notifications')}
          style={styles.iconButton}>
          <Ionicons
            name="heart-outline"
            size={22}
            color={Colors.textPrimary}
          />
          {unreadNotifCount > 0 && <View style={styles.badgeDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)/messages')}
          style={styles.iconButton}>
          <Ionicons
            name="paper-plane-outline"
            size={20}
            color={Colors.textPrimary}
          />
          {unreadChatCount > 0 && (
            <View style={styles.chatBadge}>
              <Text style={styles.chatBadgeText}>{unreadChatCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    backgroundColor: Colors.bgMain,
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.pill,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
      web: { boxShadow: '0 2px 6px rgba(0,0,0,0.03)' },
    }),
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    ...Typography.titleMedium,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.6,
    color: Colors.textPrimary,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  badgeDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.statusLive,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  chatBadge: {
    position: 'absolute',
    top: 5,
    right: 4,
    backgroundColor: Colors.statusLive,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  chatBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
