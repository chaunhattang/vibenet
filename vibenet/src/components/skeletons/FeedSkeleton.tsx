import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Skeleton, SkeletonCircle, SkeletonText } from '../ui/Skeleton';
import { Radii, Spacing, MaxContentWidth } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH, MaxContentWidth);
const CARD_WIDTH = CONTAINER_WIDTH - Spacing.four * 2;
const CARD_HEIGHT = CARD_WIDTH * 1.32;

export const FeedSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* 1. Story Circles Row Skeleton */}
      <View style={styles.storiesRow}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.storyItem}>
            <SkeletonCircle size={76} />
            <Skeleton width={50} height={10} borderRadius={5} style={{ marginTop: 6 }} />
          </View>
        ))}
      </View>

      {/* 2. Feed Post Cards Skeletons */}
      <View style={styles.postsList}>
        {[1, 2].map((item) => (
          <View key={item} style={styles.cardContainer}>
            {/* Card Canvas */}
            <Skeleton
              width="100%"
              height={CARD_HEIGHT}
              borderRadius={Radii.card}
              style={styles.cardCanvas}
            />

            {/* Floating Author Pill Top-Left */}
            <View style={styles.topAuthorPill}>
              <SkeletonCircle size={32} />
              <View style={{ gap: 4 }}>
                <Skeleton width={70} height={11} borderRadius={4} />
                <Skeleton width={45} height={8} borderRadius={3} />
              </View>
            </View>

            {/* Floating 3-Dots Top-Right */}
            <View style={styles.topDotsBtn}>
              <SkeletonCircle size={32} />
            </View>

            {/* Bottom Caption & Stats Overlay */}
            <View style={styles.bottomOverlay}>
              <Skeleton width="80%" height={13} borderRadius={4} style={{ marginBottom: 8 }} />
              <View style={styles.metricsRow}>
                <Skeleton width={60} height={20} borderRadius={Radii.pill} />
                <Skeleton width={50} height={20} borderRadius={Radii.pill} />
                <Skeleton width={50} height={20} borderRadius={Radii.pill} />
              </View>
            </View>
          </View>
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
  storiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.four + 2,
  },
  storyItem: {
    alignItems: 'center',
    width: 76,
  },
  postsList: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
    marginTop: Spacing.two,
  },
  cardContainer: {
    width: '100%',
    position: 'relative',
  },
  cardCanvas: {
    width: '100%',
  },
  topAuthorPill: {
    position: 'absolute',
    top: Spacing.four,
    left: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: Radii.pill,
  },
  topDotsBtn: {
    position: 'absolute',
    top: Spacing.four,
    right: Spacing.four,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: Spacing.four,
    left: Spacing.four,
    right: Spacing.four,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
