import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import FriendRequestCard from '../components/notificationScreen/FriendRequestCard';
import NotificationItem from '../components/notificationScreen/NotificationItem';
import SuggestedConnectionItem from '../components/notificationScreen/SuggestedConnectionItem';
import { useAuth } from '../contexts/AuthContext';
import { useFriends } from '../contexts/FriendsContext';
import { mockNotifications, mockOnlineUsers, mockProfiles } from '../data/mockData';
import FloatingTabBar, { TabKey } from '../layout/FloatingTabBar';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Notifications'>;

export default function NotificationsScreen() {
  const navigation = useNavigation<Nav>();
  const { logout } = useAuth();
  const { getFriendStatus, sendRequest, acceptRequest, declineRequest } = useFriends();

  const [activeTab, setActiveTab] = useState<TabKey>('notifications');

  const pendingRequests = mockOnlineUsers.filter(
    u => getFriendStatus(u.id) === 'PENDING_RECEIVED',
  );
  const suggestions = mockOnlineUsers.filter(u => getFriendStatus(u.id) === 'NONE');

  return (
    <View className="flex-1 bg-white dark:bg-[#0a0a0a] mt-10">
      <View className="px-4 pt-2 pb-3">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          Notifications
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {pendingRequests.length > 0 && (
          <View className="px-4" style={{ gap: 12 }}>
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
                onAccept={() => acceptRequest(user.id)}
                onDrift={() => declineRequest(user.id)}
              />
            ))}
          </View>
        )}

        <View className="px-2">
          <Text className="px-2 mb-1 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Recent Activity
          </Text>
          {mockNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </View>

        {suggestions.length > 0 && (
          <View className="px-2">
            <Text className="px-2 mb-1 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
          else if (tab === 'messages') navigation.navigate('MessagesList');
          else if (tab === 'profile') navigation.navigate('Profile');
        }}
        onPressCreate={() => navigation.navigate('Home')}
        onLogout={() => {
          logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }}
      />
    </View>
  );
}
