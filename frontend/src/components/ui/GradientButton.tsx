import { ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { C } from '../../theme/colors';
import { PressableScale } from '../../theme/motion';

type GradientButtonProps = {
  label?: string;
  icon?: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  // Icon-only buttons (e.g. the tab-bar center button) need to fill an exact
  // width/height className instead of the default label padding.
  compact?: boolean;
};

// Primary CTA: brand -> accent gradient behind the content, via react-native-svg (already
// installed — no new native dep). Solid bg-brand underneath is the fallback if the SVG
// gradient fails to size before first layout (see UI_REDESIGN_PLAN.md §4).
export default function GradientButton({
  label,
  icon,
  onPress,
  disabled,
  loading,
  className = '',
  compact = false,
}: GradientButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      className={`overflow-hidden rounded-full bg-brand disabled:opacity-50 ${className}`}
    >
      <Svg style={{ position: 'absolute', width: '100%', height: '100%' }}>
        <Defs>
          <LinearGradient id="brandGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={C.brand} />
            <Stop offset="1" stopColor={C.accent} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#brandGradient)" />
      </Svg>
      <View
        className={
          compact
            ? 'flex-1 items-center justify-center'
            : 'flex-row items-center justify-center gap-2 px-6 py-3.5'
        }
      >
        {loading ? (
          <ActivityIndicator size="small" color={C.white} />
        ) : (
          <>
            {icon}
            {label && <Text className="text-white font-bold text-base">{label}</Text>}
          </>
        )}
      </View>
    </PressableScale>
  );
}
