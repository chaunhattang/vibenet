import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Skeleton } from '../ui/Skeleton';
import { Radii, Spacing, MaxContentWidth } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH, MaxContentWidth);
const GRID_ITEM_WIDTH = (CONTAINER_WIDTH - Spacing.four * 2 - Spacing.two * 2) / 3;

export const ExploreSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* 1. Search Bar Skeleton */}
      <View style={styles.searchBarWrap}>
        <Skeleton width="100%" height={44} borderRadius={Radii.pill} />
      </View>

      {/* 2. Category Chips Skeleton */}
      <View style={styles.categoriesRow}>
        {[80, 100, 75, 90, 85].map((width, idx) => (
          <Skeleton
            key={idx}
            width={width}
            height={34}
            borderRadius={Radii.pill}
          />
        ))}
      </View>

      {/* 3. Masonry Grid Placeholder Skeleton */}
      <View style={styles.grid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item, idx) => {
          const isTall = idx % 5 === 0 || idx % 7 === 0;
          return (
            <Skeleton
              key={item}
              width={GRID_ITEM_WIDTH}
              height={isTall ? GRID_ITEM_WIDTH * 1.8 : GRID_ITEM_WIDTH * 1.2}
              borderRadius={Radii.md}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: Spacing.eight,
  },
  searchBarWrap: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  categoriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    gap: Spacing.two,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
});
