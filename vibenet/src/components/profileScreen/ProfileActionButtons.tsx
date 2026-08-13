/**
 * ProfileActionButtons — Babagang 3-pill action row.
 * Phase G: dark-mode aware + spring micro-animation on press.
 *
 * Follow (primary dark) | Message | Insight (secondary muted)
 */
import { useRef } from 'react';
import { Animated, Pressable, Text, View, useColorScheme } from 'react-native';
import { C } from '../../theme/colors';

type Props = {
  isFollowing?: boolean;
  onFollow?: () => void;
  onMessage?: () => void;
  onInsight?: () => void;
};

function AnimatedPill({
  onPress,
  bg,
  pressedBg,
  textColor,
  borderColor = 'transparent',
  label,
}: {
  onPress?: () => void;
  bg: string;
  pressedBg: string;
  textColor: string;
  borderColor?: string;
  label: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 60, bounciness: 4 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 60, bounciness: 4 }).start();

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={({ pressed }) => ({
          height: 40,
          borderRadius: 9999,
          backgroundColor: pressed ? pressedBg : bg,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: borderColor,
          paddingHorizontal: 12,
        })}
      >
        <Text style={{ fontSize: 13, fontWeight: '600', color: textColor }}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function ProfileActionButtons({
  isFollowing = false,
  onFollow,
  onMessage,
  onInsight,
}: Props) {
  const isDark = useColorScheme() === 'dark';

  // Secondary pill: surface-muted adapts to dark mode
  const secondaryBg = isDark ? 'rgba(255,255,255,0.08)' : '#F0F0F3';
  const secondaryPressed = isDark ? 'rgba(255,255,255,0.14)' : '#E5E5EA';
  const secondaryText = isDark ? C.onDark : '#0D0E11';

  // Follow pill
  const followBg = isFollowing
    ? secondaryBg
    : isDark ? '#FFFFFF' : '#0D0E11';
  const followPressed = isFollowing
    ? secondaryPressed
    : isDark ? 'rgba(255,255,255,0.80)' : '#2A2A35';
  const followText = isFollowing
    ? secondaryText
    : isDark ? '#0D0E11' : '#FFFFFF';

  return (
    <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 16, marginTop: 4 }}>
      <AnimatedPill
        onPress={onFollow}
        bg={followBg}
        pressedBg={followPressed}
        textColor={followText}
        label={isFollowing ? 'Following' : 'Follow'}
      />
      <AnimatedPill
        onPress={onMessage}
        bg={secondaryBg}
        pressedBg={secondaryPressed}
        textColor={secondaryText}
        borderColor={isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB'}
        label="Message"
      />
      <AnimatedPill
        onPress={onInsight}
        bg={secondaryBg}
        pressedBg={secondaryPressed}
        textColor={secondaryText}
        borderColor={isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB'}
        label="Insight"
      />
    </View>
  );
}
