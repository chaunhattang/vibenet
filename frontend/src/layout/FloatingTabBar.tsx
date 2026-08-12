import { useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfirmModal from '../components/HomeScreen/ConfirmModal';
import { ExploreIcon, HeartIcon, HomeIcon, LogoutIcon, UserIcon } from '../assets/Icon';
import { C } from '../theme/colors';
import { PressableScale } from '../theme/motion';

export type TabKey = 'home' | 'explore' | 'notifications' | 'profile';

type FloatingTabBarProps = {
  activeTab: TabKey | null;
  onChangeTab: (tab: TabKey) => void;
  onLogout: () => void;
};

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
      <View style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <Animated.View
          style={{
            transform: [{ scale: pill }],
            opacity: pill,
            position: 'absolute',
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 4,
          }}
        />
        <View style={{ zIndex: 10 }}>
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

  const handlePressTab = (tab: TabKey) => {
    if (activeTab === tab) return;
    onChangeTab(tab);
  };

  return (
    <>
      <View
        style={{
          position: 'absolute',
          left: 24,
          right: 24,
          bottom: insets.bottom + 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(28, 28, 32, 0.88)',
          borderRadius: 9999,
          paddingHorizontal: 20,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.16)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.35,
          shadowRadius: 20,
          elevation: 10,
        }}
      >
        <TabIcon active={activeTab === 'home'} onPress={() => handlePressTab('home')}>
          <HomeIcon size={22} color={activeTab === 'home' ? '#000000' : 'rgba(255, 255, 255, 0.70)'} />
        </TabIcon>

        <TabIcon active={activeTab === 'explore'} onPress={() => handlePressTab('explore')}>
          <ExploreIcon size={22} color={activeTab === 'explore' ? '#000000' : 'rgba(255, 255, 255, 0.70)'} />
        </TabIcon>

        <TabIcon active={activeTab === 'notifications'} onPress={() => handlePressTab('notifications')}>
          <HeartIcon size={22} color={activeTab === 'notifications' ? '#000000' : 'rgba(255, 255, 255, 0.70)'} />
        </TabIcon>

        <TabIcon
          active={activeTab === 'profile'}
          onPress={() => handlePressTab('profile')}
          onLongPress={() => setShowLogoutConfirm(true)}
        >
          <UserIcon size={22} color={activeTab === 'profile' ? '#000000' : 'rgba(255, 255, 255, 0.70)'} />
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
