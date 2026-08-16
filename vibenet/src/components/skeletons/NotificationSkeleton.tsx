import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton, SkeletonCircle, SkeletonText } from '../ui/Skeleton';
import { Radii, Spacing } from '../../constants/theme';

export const NotificationSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* 1. Header Row */}
      <View style={styles.header}>
        <Skeleton width={130} height={24} borderRadius={6} />
      </View>

      {/* 2. Follow Requests Card Skeleton */}
      <View style={styles.followRequestRow}>
        <SkeletonCircle size={44} />
        <View style={{ flex: 1, gap: 5 }}>
          <Skeleton width="40%" height={13} borderRadius={4} />
          <Skeleton width="60%" height={10} borderRadius={3} />
        </View>
        <Skeleton width={20} height={20} borderRadius={10} />
      </View>

      {/* 3. Grouped Notifications */}
      <View style={styles.sectionHeader}>
        <Skeleton width={80} height={14} borderRadius={4} />
      </View>

      <View style={styles.list}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <View key={item} style={styles.notiRow}>
            <SkeletonCircle size={44} />
            <View style={{ flex: 1, gap: 5 }}>
              <Skeleton width="85%" height={12} borderRadius={4} />
              <Skeleton width="45%" height={9} borderRadius={3} />
            </View>
            <Skeleton width={44} height={44} borderRadius={Radii.md} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  header: {
    marginBottom: Spacing.four,
  },
  followRequestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    gap: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionHeader: {
    marginTop: Spacing.five,
    marginBottom: Spacing.three,
  },
  list: {
    gap: Spacing.four,
  },
  notiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
});
