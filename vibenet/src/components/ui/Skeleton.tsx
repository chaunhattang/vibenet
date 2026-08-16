import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Radii } from '../../constants/theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
  isDark?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = Radii.md,
  style,
  isDark = false,
}) => {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, {
        duration: 900,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const backgroundColor = isDark ? 'rgba(255, 255, 255, 0.12)' : '#E5E7EB';

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

export const SkeletonCircle: React.FC<{ size: number; style?: ViewStyle; isDark?: boolean }> = ({
  size,
  style,
  isDark,
}) => {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
      isDark={isDark}
    />
  );
};

export const SkeletonText: React.FC<{
  lines?: number;
  lineHeight?: number;
  gap?: number;
  style?: ViewStyle;
  isDark?: boolean;
}> = ({ lines = 2, lineHeight = 12, gap = 6, style, isDark }) => {
  return (
    <View style={[styles.textContainer, { gap }, style]}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          height={lineHeight}
          width={idx === lines - 1 && lines > 1 ? '65%' : '100%'}
          borderRadius={4}
          isDark={isDark}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonBase: {
    overflow: 'hidden',
  },
  textContainer: {
    width: '100%',
  },
});
