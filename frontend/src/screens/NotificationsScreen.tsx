import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FriendRequestCard from '../components/notificationScreen/FriendRequestCard';
import NotificationItem from '../components/notificationScreen/NotificationItem';
import SuggestedConnectionItem from '../components/notificationScreen/SuggestedConnectionItem';
import { useAuth } from '../contexts/AuthContext';
import { useFriends } from '../contexts/FriendsContext';
import { mockNotifications, mockOnlineUsers, mockProfiles } from '../data/mockData';
import FloatingTabBar, { TabKey } from '../layout/FloatingTabBar';
import { RootStackParamList } from '../navigation/types';
import { animateNextLayout, FadeInUp } from '../theme/motion';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Notifications'>;

export default function NotificationsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { getFriendStatus, sendRequest, acceptRequest, declineRequest } = useFriends();

  const [activeTab, setActiveTab] = useState<TabKey>('notifications');

  const pendingRequests = mockOnlineUsers.filter(
    u => getFriendStatus(u.id) === 'PENDING_RECEIVED',
  );
  const suggestions = mockOnlineUsers.filter(u => getFriendStatus(u.id) === 'NONE');

  const handleAccept = (id: string) => {
    animateNextLayout();
    acceptRequest(id);
  };

  const handleDecline = (id: string) => {
    animateNextLayout();
    declineRequest(id);
  };

  return (
    <View style={{ paddingTop: insets.top }} className="flex-1 bg-paper-base dark:bg-ink-base">
      <View className="px-5 pt-2 pb-3">
        <Text className="text-title text-content-strong dark:text-content-strong-dark">
          Notifications
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {pendingRequests.length > 0 && (
          <View className="px-5" style={{ gap: 12 }}>
            {pendingRequests.map(user => (
              <FriendRequestCard
                key={user.id}
                userId={user.id}
                name={user.name}
                message={
                  mockProfiles[user.id]?.bio ||
                  'wants to resonate with your vibe.'
                }
                avatarUrl={user.avatar}
                onAccept={() => handleAccept(user.id)}
                onDrift={() => handleDecline(user.id)}
              />
            ))}
          </View>
        )}

        <View className="px-3">
          <Text className="px-2 mb-1 text-xs font-bold text-content-faint dark:text-content-faint-dark uppercase tracking-wider">
            Recent Activity
          </Text>
          {mockNotifications.map((notification, i) => (
            <FadeInUp key={notification.id} delay={Math.min(i, 6) * 30}>
              <NotificationItem notification={notification} />
            </FadeInUp>
          ))}
        </View>

        {suggestions.length > 0 && (
          <View className="px-3">
            <Text className="px-2 mb-1 text-xs font-bold text-content-faint dark:text-content-faint-dark uppercase tracking-wider">
              Suggested Connections
            </Text>
            {suggestions.map(user => (
              <SuggestedConnectionItem
                key={user.id}
                userId={user.id}
                name={user.name}
                reason={
                  mockProfiles[user.id]?.bio || 'You might know each other'
                }
                avatarUrl={user.avatar}
                onConnect={() => sendRequest(user.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <FloatingTabBar
        activeTab={activeTab}
        onChangeTab={tab => {
          setActiveTab(tab);
          if (tab === 'home') navigation.navigate('Home');
          else if (tab === 'explore') navigation.navigate('Home');
          else if (tab === 'profile') navigation.navigate('Profile');
        }}
        onLogout={() => {
          logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }}
      />
    </View>
  );
}
