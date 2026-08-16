import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Skeleton, SkeletonCircle } from '../ui/Skeleton';
import { Radii, Spacing, MaxContentWidth } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH, MaxContentWidth);
const GRID_ITEM_SIZE = (CONTAINER_WIDTH - 32 - 10) / 2;

export const ProfileSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* 1. Cover Banner Skeleton */}
      <Skeleton width="100%" height={140} borderRadius={0} />

      {/* 2. Floating Avatar Skeleton */}
      <View style={styles.avatarContainer}>
        <SkeletonCircle size={90} style={styles.avatarCircle} />
      </View>

      {/* 3. Name & Bio Section */}
      <View style={styles.infoSection}>
        <Skeleton width={140} height={20} borderRadius={6} style={{ marginBottom: 8 }} />
        <Skeleton width={220} height={12} borderRadius={4} style={{ marginBottom: 4 }} />
        <Skeleton width={160} height={12} borderRadius={4} />
      </View>

      {/* 4. Stats Row */}
      <View style={styles.statsRow}>
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.statItem}>
            <Skeleton width={32} height={18} borderRadius={4} style={{ marginBottom: 4 }} />
            <Skeleton width={48} height={10} borderRadius={3} />
          </View>
        ))}
      </View>

      {/* 5. Action Buttons (Edit & Share Profile) */}
      <View style={styles.actionButtonsRow}>
        <Skeleton width="48%" height={42} borderRadius={Radii.pill} />
        <Skeleton width="48%" height={42} borderRadius={Radii.pill} />
      </View>

      {/* 6. Tabs Bar */}
      <View style={styles.tabsRow}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.tabItem}>
            <Skeleton width={24} height={24} borderRadius={12} />
          </View>
        ))}
      </View>

      {/* 7. Posts Grid */}
      <View style={styles.grid}>
        {[1, 2, 3, 4].map((item) => (
          <Skeleton
            key={item}
            width={GRID_ITEM_SIZE}
            height={GRID_ITEM_SIZE * 1.25}
            borderRadius={Radii.md}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: Spacing.eight,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -45,
  },
  avatarCircle: {
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
  },
  infoSection: {
    alignItems: 'center',
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  statItem: {
    alignItems: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.four,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    paddingVertical: 10,
  },
  tabItem: {
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.four,
    gap: 10,
  },
});
