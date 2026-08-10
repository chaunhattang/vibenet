/**
 * GlassTopHeader — Babagang 56px sticky top navigation bar.
 * Spec: design.md §5A + mock HTML lines 601-620.
 *
 * Phase G — Dark mode:
 *   Light → rgba(246,246,248,0.92) bg, dark borders, dark icons
 *   Dark  → rgba(14,14,16,0.90) bg, white-alpha borders, light icons
 */
import { useColorScheme } from 'react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line, Path, Rect } from 'react-native-svg';
import { C } from '../../theme/colors';

type GlassTopHeaderProps = {
  title: string;
  onPressMenu?: () => void;
  onPressBell?: () => void;
  unreadCount?: number;
  // Compose entry point — the sketch's nav bar has no centre "+", so posting
  // is re-homed here (Phase H). Omit to hide the button entirely.
  onPressAdd?: () => void;
};

function GridMenuIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" rx="2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="14" y="3" width="7" height="7" rx="2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="14" y="14" width="7" height="7" rx="2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="3" y="14" width="7" height="7" rx="2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BellIconSvg({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PlusIconSvg({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function CircleIconButton({
  onPress,
  children,
  dotColor,
  isDark,
}: {
  onPress?: () => void;
  children: React.ReactNode;
  dotColor?: string;
  isDark: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: 36,
        height: 36,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
        backgroundColor: pressed
          ? isDark ? 'rgba(255,255,255,0.10)' : '#F0F0F3'
          : isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      })}
    >
      {children}
      {dotColor && (
        <View
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 8,
            height: 8,
            borderRadius: 9999,
            backgroundColor: dotColor,
            borderWidth: 2,
            borderColor: isDark ? C.inkBase : '#FFFFFF',
          }}
        />
      )}
    </Pressable>
  );
}

export default function GlassTopHeader({
  title,
  onPressMenu,
  onPressBell,
  unreadCount = 0,
  onPressAdd,
}: GlassTopHeaderProps) {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';

  const iconColor = isDark ? C.onDark : C.contentStrong;
  const titleColor = isDark ? C.onDark : '#0D0E11';

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: isDark ? 'rgba(14, 14, 16, 0.90)' : 'rgba(246, 246, 248, 0.92)',
        borderBottomWidth: 1,
        borderBottomColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
      }}
    >
      <View
        style={{
          height: 56,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <CircleIconButton onPress={onPressMenu} isDark={isDark}>
          <GridMenuIcon color={iconColor} />
        </CircleIconButton>

        <Text
          style={{ fontSize: 20, fontWeight: '700', letterSpacing: -0.5, color: titleColor }}
          numberOfLines={1}
        >
          {title}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {onPressAdd && (
            <CircleIconButton onPress={onPressAdd} isDark={isDark}>
              <PlusIconSvg color={iconColor} />
            </CircleIconButton>
          )}
          <CircleIconButton
            onPress={onPressBell}
            dotColor={unreadCount > 0 ? '#FF3B30' : undefined}
            isDark={isDark}
          >
            <BellIconSvg color={iconColor} />
          </CircleIconButton>
        </View>
      </View>
    </View>
  );
}
