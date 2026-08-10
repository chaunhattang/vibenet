/**
 * ProfileTabs — Babagang icon-only tabs with solid bottom-bar indicator.
 * Phase G: dark-mode aware indicator, border, and icon colours.
 *           iconOnly={false} fallback retains label+icon for OtherProfileScreen.
 */
import { ComponentType } from 'react';
import { Pressable, View, useColorScheme } from 'react-native';
import { Text } from 'react-native';
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

export default function ProfileTabs<T extends string>({
  tabs,
  activeTab,
  onChangeTab,
  iconOnly = true,
}: ProfileTabsProps<T>) {
  const isDark = useColorScheme() === 'dark';

  const borderColor = isDark ? C.inkOverlay : '#F0F0F3';
  const activeIconColor = isDark ? '#FFFFFF' : '#0D0E11';
  const inactiveIconColor = C.contentFaint;
  const indicatorColor = isDark ? '#FFFFFF' : '#0D0E11';
  const labelActive = isDark ? C.onDark : '#0D0E11';
  const labelInactive = isDark ? C.faintDark : C.contentMuted;

  return (
    <View
      style={{
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
        marginTop: 8,
      }}
    >
      {tabs.map(({ key, label, Icon }) => {
        const active = activeTab === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChangeTab(key)}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: 'center',
              paddingVertical: 12,
              position: 'relative',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            {iconOnly ? (
              <Icon size={20} color={active ? activeIconColor : inactiveIconColor} />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon size={15} color={active ? C.brand : inactiveIconColor} />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '500',
                    color: active ? labelActive : labelInactive,
                  }}
                >
                  {label}
                </Text>
              </View>
            )}

            {/* Solid 32×3px bottom indicator */}
            {active && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: 32,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: indicatorColor,
                }}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
