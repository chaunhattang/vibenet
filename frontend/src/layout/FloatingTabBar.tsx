import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfirmModal from '../components/HomeScreen/ConfirmModal';
import {
  BellIcon,
  HomeIcon,
  LogoutIcon,
  MessageIcon,
  PlusIcon,
  UserIcon,
} from '../assets/Icon';

export type TabKey = 'home' | 'messages' | 'notifications' | 'profile';

type FloatingTabBarProps = {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
  onPressCreate: () => void;
  onLogout: () => void;
};

export default function FloatingTabBar({
  activeTab,
  onChangeTab,
  onPressCreate,
  onLogout,
}: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <>
      <View
        style={{ bottom: insets.bottom + 12 }}
        className="absolute left-6 right-6 flex-row items-center justify-between bg-white dark:bg-[#181825] rounded-full px-5 py-3 shadow-lg border border-gray-100 dark:border-white/5"
      >
        <Pressable onPress={() => onChangeTab('home')} hitSlop={10}>
          <HomeIcon color={activeTab === 'home' ? '#6366F1' : '#9CA3AF'} />
        </Pressable>

        <Pressable onPress={() => onChangeTab('messages')} hitSlop={10}>
          <MessageIcon
            color={activeTab === 'messages' ? '#6366F1' : '#9CA3AF'}
          />
        </Pressable>

        <Pressable
          onPress={onPressCreate}
          className="w-12 h-12 rounded-full bg-indigo-600 items-center justify-center -mt-8 shadow-lg shadow-indigo-500/40"
        >
          <PlusIcon />
        </Pressable>

        <Pressable onPress={() => onChangeTab('notifications')} hitSlop={10}>
          <BellIcon
            color={activeTab === 'notifications' ? '#6366F1' : '#9CA3AF'}
          />
        </Pressable>

        <Pressable
          onPress={() => onChangeTab('profile')}
          onLongPress={() => setShowLogoutConfirm(true)}
          hitSlop={10}
        >
          <UserIcon color={activeTab === 'profile' ? '#6366F1' : '#9CA3AF'} />
        </Pressable>
      </View>

      <ConfirmModal
        visible={showLogoutConfirm}
        icon={<LogoutIcon size={28} color="#EF4444" />}
        title="Log Out"
        message="Are you sure you want to let your session fade away? You will need to sign back in."
        confirmLabel="Log Out"
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          onLogout();
        }}
      />
    </>
  );
}
