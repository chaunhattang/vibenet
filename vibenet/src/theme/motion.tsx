import { ReactNode, useEffect, useRef } from 'react';
import {
  Animated,
  LayoutAnimation,
  Platform,
  Pressable,
  PressableProps,
  UIManager,
} from 'react-native';

// Android needs an explicit opt-in for LayoutAnimation; iOS has it on by default.
// Call once at app start (see App.tsx). Scoped intentionally to small, common list
// add/remove transitions — not full-screen layout swaps — since it can't be visually
// verified without a device in this environment (see UI_REDESIGN_PLAN.md §4).
export function enableLayoutAnimations() {
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export function animateNextLayout() {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
}

// Generic "press feedback" wrapper — springs to 0.96 scale on press, back to 1 on
// release. Swap in for bare <Pressable> anywhere a tap should feel alive.
type PressableScaleProps = PressableProps & { children: ReactNode };

export function PressableScale({ children, style, ...props }: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) =>
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();

  return (
    <Pressable
      {...props}
      onPressIn={e => {
        animateTo(0.96);
        props.onPressIn?.(e);
      }}
      onPressOut={e => {
        animateTo(1);
        props.onPressOut?.(e);
      }}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style as object]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

// Scale 1 -> 1.35 -> 1 "pop" — for likes/reactions. Call `pop()` on tap.
export function usePop() {
  const scale = useRef(new Animated.Value(1)).current;

  const pop = () => {
    scale.setValue(1);
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.35, useNativeDriver: true, speed: 50, bounciness: 12 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }),
    ]).start();
  };

  return { scale, pop };
}

// Fade + translateY entrance, staggered by `delay` (pass index * 40 from a list).
type FadeInUpProps = { children: ReactNode; delay?: number };

export function FadeInUp({ children, delay = 0 }: FadeInUpProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 220, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 220, delay, useNativeDriver: true }),
    ]).start();
    // Only animate once per mount — delay/opacity/translateY refs are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>
  );
}
