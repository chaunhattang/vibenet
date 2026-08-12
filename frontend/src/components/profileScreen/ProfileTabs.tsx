/**
 * ProfileTabs — Icon/Label segmented tab bar matching Babagang design system.
 * Active tab renders as a rounded pill with a sliding indicator animation.
 */
import { ComponentType, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, Pressable, Text, View, useColorScheme } from 'react-native';
import { C } from '../../theme/colors';

type TabItem<T extends string> = {
  key: T;
  label: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
};

type ProfileTabsProps<T extends string> = {
  tabs: TabItem<T>[];
  activeTab: T;
  onChangeTab: (tab: T) => void;
  iconOnly?: boolean;
};

type TabLayout = { x: number; width: number };

export default function ProfileTabs<T extends string>({
  tabs,
  activeTab,
  onChangeTab,
  iconOnly = true,
}: ProfileTabsProps<T>) {
  const isDark = useColorScheme() === 'dark';

  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#F0F0F3';
  const activeColor = isDark ? '#0D0E11' : '#FFFFFF';
  const inactiveColor = isDark ? 'rgba(255,255,255,0.45)' : '#9CA3AF';
  const activePillBg = isDark ? '#FFFFFF' : '#0D0E11';

  const layoutsRef = useRef<Partial<Record<T, TabLayout>>>({});
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  const [indicatorReady, setIndicatorReady] = useState(false);

  const animateTo = (layout: TabLayout) => {
    Animated.parallel([
      Animated.spring(indicatorX, {
        toValue: layout.x,
        useNativeDriver: false,
        speed: 16,
        bounciness: 6,
      }),
      Animated.spring(indicatorWidth, {
        toValue: layout.width,
        useNativeDriver: false,
        speed: 16,
        bounciness: 6,
      }),
    ]).start();
  };

  const handleTabLayout = (key: T) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    layoutsRef.current[key] = { x, width };

    if (key === activeTab) {
      indicatorX.setValue(x);
      indicatorWidth.setValue(width);
      setIndicatorReady(true);
    }
  };

  const handlePress = (key: T) => {
    onChangeTab(key);
    const layout = layoutsRef.current[key];
    if (layout) animateTo(layout);
  };

  return (
    <View
      style={{
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
        marginTop: 12,
        paddingBottom: 10,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          paddingHorizontal: 20,
        }}
      >
        {/* Sliding active-pill indicator */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            borderRadius: 16,
            backgroundColor: activePillBg,
            opacity: indicatorReady ? 1 : 0,
            transform: [{ translateX: indicatorX }],
            width: indicatorWidth,
          }}
        />

        {tabs.map(({ key, label, Icon }) => {
          const active = activeTab === key;
          const color = active ? activeColor : inactiveColor;

          return (
            <Pressable
              key={key}
              onPress={() => handlePress(key)}
              onLayout={handleTabLayout(key)}
              style={({ pressed }) => ({
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingVertical: 8,
                  paddingHorizontal: iconOnly ? 12 : 14,
                  borderRadius: 16,
                }}
              >
                {iconOnly ? (
                  <Icon size={20} color={color} />
                ) : (
                  <>
                    <Icon size={18} color={color} />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: active ? '700' : '500',
                        color: color,
                      }}
                    >
                      {label}
                    </Text>
                  </>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
