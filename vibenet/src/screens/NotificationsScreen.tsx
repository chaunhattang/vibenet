import { useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FriendRequestCard from '../components/notificationScreen/FriendRequestCard';
import NotificationItem from '../components/notificationScreen/NotificationItem';
import SuggestedConnectionItem from '../components/notificationScreen/SuggestedConnectionItem';
import { useFriends } from '../contexts/FriendsContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { useGoToProfile } from '../hooks/useGoToProfile';
import { mockOnlineUsers, mockProfiles } from '../data/mockData';
import { C } from '../theme/colors';
import { animateNextLayout, FadeInUp } from '../theme/motion';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { getFriendStatus, sendRequest, acceptRequest, declineRequest } = useFriends();
  const { notifications, loading, error, unreadCount, load, markRead, markAllRead } =
    useNotifications();
  const goToProfile = useGoToProfile();

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Friend requests + suggestions vẫn mock (Bucket B2 — Friends chưa migrate).
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
      <View className="px-5 pt-2 pb-3 flex-row items-center justify-between">
        <Text className="text-title text-content-strong dark:text-content-strong-dark">
          Notifications
        </Text>
        {unreadCount > 0 && (
          <Pressable onPress={markAllRead} hitSlop={8}>
            <Text className="text-xs font-semibold text-brand">Mark all read</Text>
          </Pressable>
        )}
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
          {loading && notifications.length === 0 ? (
            <View className="py-8">
              <ActivityIndicator color={C.brand} />
            </View>
          ) : notifications.length === 0 ? (
            <Text className="px-2 py-6 text-sm text-content-muted dark:text-content-muted-dark text-center">
              {error ?? 'No activity yet.'}
            </Text>
          ) : (
            notifications.map((notification, i) => (
              <FadeInUp key={notification.id} delay={Math.min(i, 6) * 30}>
                <NotificationItem
                  notification={notification}
                  onPress={() => {
                    markRead(notification.id);
                    if (
                      notification.type === 'FRIEND_REQUEST' ||
                      notification.type === 'FRIEND_ACCEPTED'
                    ) {
                      goToProfile(notification.actorId);
                    }
                  }}
                />
              </FadeInUp>
            ))
          )}
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
    </View>
  );
}
