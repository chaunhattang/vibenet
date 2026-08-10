import { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfirmModal from '../components/HomeScreen/ConfirmModal';
import { ExploreIcon, HeartIcon, HomeIcon, LogoutIcon, UserIcon } from '../assets/Icon';
import { C } from '../theme/colors';
import { PressableScale } from '../theme/motion';

// Sketch nav is exactly 4 icons — Home / Explore / Notifications / Profile —
// with no centre "+" and no messages tab (see GLASSMORPHIC_MOBILE_RESTRUCTURE_PLAN.md Phase H).
export type TabKey = 'home' | 'explore' | 'notifications' | 'profile';

type FloatingTabBarProps = {
  // null when the current screen (e.g. Messages) has no corresponding tab —
  // all four icons render inactive rather than falsely highlighting one.
  activeTab: TabKey | null;
  onChangeTab: (tab: TabKey) => void;
  onLogout: () => void;
};

// Animated active-state pill behind a tab icon — fades/scales in rather than sliding
// (a sliding indicator needs onLayout measurement of sibling positions, which can't be
// visually verified without a device in this environment; see UI_REDESIGN_PLAN.md §4).
function TabIcon({ active, onPress, onLongPress, children }: {
  active: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  children: React.ReactNode;
}) {
  const pill = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(pill, { toValue: active ? 1 : 0, useNativeDriver: true, speed: 30, bounciness: 4 }).start();
  }, [active, pill]);

  return (
    <PressableScale onPress={onPress} onLongPress={onLongPress} hitSlop={10}>
      <View className="w-11 h-11 items-center justify-center">
        <Animated.View
          style={{ transform: [{ scale: pill }], opacity: pill }}
          className="absolute w-11 h-11 rounded-full bg-white"
        />
        <View style={{ opacity: active ? 1 : 0.55 }}>
          {children}
        </View>
      </View>
    </PressableScale>
  );
}

export default function FloatingTabBar({
  activeTab,
  onChangeTab,
  onLogout,
}: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <>
      <View
        style={{ bottom: insets.bottom + 12 }}
        className="absolute left-6 right-6 flex-row items-center justify-between bg-paper-base dark:bg-ink-overlay rounded-full px-5 py-3 shadow-lg border border-hairline-light dark:border-hairline-dark"
      >
        <TabIcon active={activeTab === 'home'} onPress={() => onChangeTab('home')}>
          <HomeIcon color={activeTab === 'home' ? '#0F0F0F' : C.contentFaint} />
        </TabIcon>

        <TabIcon active={activeTab === 'explore'} onPress={() => onChangeTab('explore')}>
          <ExploreIcon color={activeTab === 'explore' ? '#0F0F0F' : C.contentFaint} />
        </TabIcon>

        <TabIcon active={activeTab === 'notifications'} onPress={() => onChangeTab('notifications')}>
          <HeartIcon color={activeTab === 'notifications' ? '#0F0F0F' : C.contentFaint} />
        </TabIcon>

        <TabIcon
          active={activeTab === 'profile'}
          onPress={() => onChangeTab('profile')}
          onLongPress={() => setShowLogoutConfirm(true)}
        >
          <UserIcon color={activeTab === 'profile' ? '#0F0F0F' : C.contentFaint} />
        </TabIcon>
      </View>

      <ConfirmModal
        visible={showLogoutConfirm}
        icon={<LogoutIcon size={28} color={C.danger} />}
        title="Log Out"
        message="Are you sure you want to let your session fade away? You will need to sign back in."
        confirmLabel="Log Out"
        confirmColor={C.danger}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          onLogout();
        }}
      />
    </>
  );
}
