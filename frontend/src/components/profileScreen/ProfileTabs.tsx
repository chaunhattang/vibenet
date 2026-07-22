import { ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';

type TabItem<T extends string> = {
  key: T;
  label: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
};

type ProfileTabsProps<T extends string> = {
  tabs: TabItem<T>[];
  activeTab: T;
  onChangeTab: (tab: T) => void;
};

export default function ProfileTabs<T extends string>({
  tabs,
  activeTab,
  onChangeTab,
}: ProfileTabsProps<T>) {
  return (
    <View className="flex-row items-center gap-6 mt-6 px-5 border-b border-gray-200 dark:border-white/10">
      {tabs.map(({ key, label, Icon }) => {
        const active = activeTab === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChangeTab(key)}
            className="flex-row items-center gap-1.5 pb-3"
            style={
              active
                ? { borderBottomWidth: 2, borderBottomColor: '#6366F1', marginBottom: -1 }
                : undefined
            }
          >
            <Icon size={15} color={active ? '#6366F1' : '#9CA3AF'} />
            <Text
              className={
                active
                  ? 'text-sm font-medium text-gray-900 dark:text-white'
                  : 'text-sm font-medium text-gray-500'
              }
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
