import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Feather, Ionicons } from '@expo/vector-icons';
import { BottomTabInset, MaxContentWidth } from '../../constants/theme';
import { NotificationSkeleton } from '../../components/skeletons/NotificationSkeleton';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/api/notifications';
import { acceptFriendRequest, declineFriendRequest, getIncomingFriendRequests } from '../../services/api/friends';
import type { FriendRequestResponse, NotificationResponse } from '../../services/api/types';
import { resolveMediaUrl } from '../../services/config';

function describeNotification(n: NotificationResponse): string {
  switch (n.type) {
    case 'FRIEND_REQUEST':
      return 'sent you a friend request.';
    case 'FRIEND_ACCEPTED':
      return 'accepted your friend request.';
    case 'REACTION':
      return 'reacted to your post.';
    case 'COMMENT':
      return 'commented on your post.';
    case 'MOMENT_REPLY':
      return 'replied to your moment.';
    case 'LOCKET_MOMENT_RECEIVED':
      return 'sent you a Locket moment.';
    case 'LOCKET_REACTION':
      return 'reacted to your moment.';
    case 'FOLLOW':
      return 'started following you.';
    default:
      return 'sent you a notification.';
  }
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondedRequestIds, setRespondedRequestIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      const [feed, requests] = await Promise.all([getNotifications(0, 50), getIncomingFriendRequests()]);
      setNotifications(feed.data);
      setIncomingRequests(requests);
      markAllNotificationsRead().catch(() => {});
    } catch (err) {
      console.warn('Failed to load notifications', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleAccept = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      setRespondedRequestIds((prev) => new Set(prev).add(requestId));
    } catch (err) {
      console.warn('Failed to accept friend request', err);
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await declineFriendRequest(requestId);
      setRespondedRequestIds((prev) => new Set(prev).add(requestId));
    } catch (err) {
      console.warn('Failed to decline friend request', err);
    }
  };

  const renderNotificationRow = (item: NotificationResponse) => {
    const matchingRequest = item.type === 'FRIEND_REQUEST'
      ? incomingRequests.find((r) => r.requestId === item.relatedEntityId)
      : undefined;
    const alreadyResponded = matchingRequest ? respondedRequestIds.has(matchingRequest.requestId) : false;

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.7}
        onPress={() => {
          if (!item.isRead) markNotificationRead(item.id).catch(() => {});
          if (item.type === 'FRIEND_REQUEST' || item.type === 'FRIEND_ACCEPTED') {
            router.push(`/profile/${item.actorId}` as any);
          } else {
            router.push('/(tabs)');
          }
        }}
        style={styles.notificationRow}>
        <View style={styles.avatarContainer}>
          <View style={styles.singleAvatarWrap}>
            <Image source={{ uri: resolveMediaUrl(item.actorAvatar) }} style={styles.avatarImg} />
          </View>
        </View>

        <View style={styles.textContent}>
          <Text style={styles.mainNotificationText}>
            <Text style={styles.actorHighlight}>{item.actorName ?? 'Someone'}</Text>
            {' ' + describeNotification(item) + ' '}
            <Text style={styles.timeAgoText}>{timeAgo(item.createdAt)}</Text>
          </Text>

          {item.type === 'FRIEND_REQUEST' && matchingRequest && !alreadyResponded && (
            <View style={styles.friendActionRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleAccept(matchingRequest.requestId)}
                style={styles.acceptBtn}>
                <Text style={styles.acceptBtnText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleDecline(matchingRequest.requestId)}
                style={styles.declineBtn}>
                <Text style={styles.declineBtnText}>Decline</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              style={styles.backBtn}>
              <Feather name="arrow-left" size={24} color="#000000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>

          {isLoading ? (
            <NotificationSkeleton />
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}>
              {incomingRequests.length > 0 && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push('/friend-requests' as any)}
                  style={styles.followRequestsRow}>
                  <View style={styles.followRequestIcon}>
                    <Feather name="user" size={24} color="#8E8E93" />
                  </View>
                  <View style={styles.followRequestInfo}>
                    <Text style={styles.followRequestTitle}>Friend requests</Text>
                    <Text style={styles.followRequestSub}>
                      {incomingRequests.length} pending
                    </Text>
                  </View>
                  <View style={styles.followRequestRight}>
                    <View style={styles.blueUnreadDot} />
                    <Feather name="chevron-right" size={18} color="#C7C7CC" />
                  </View>
                </TouchableOpacity>
              )}

              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeader}>All notifications</Text>
                {notifications.length === 0 ? (
                  <Text style={styles.emptyText}>You&apos;re all caught up.</Text>
                ) : (
                  notifications.map(renderNotificationRow)
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  backBtn: {
    paddingVertical: 4,
    paddingRight: 4,
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.4,
  },
  scrollContent: {
    paddingBottom: BottomTabInset + 40,
  },
  followRequestsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EFEFEF',
  },
  followRequestIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  followRequestInfo: {
    flex: 1,
  },
  followRequestTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.2,
  },
  followRequestSub: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 1,
  },
  followRequestRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  blueUnreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3897F0',
  },
  sectionBlock: {
    marginTop: 18,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    paddingHorizontal: 16,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  emptyText: {
    paddingHorizontal: 16,
    fontSize: 13,
    color: '#8E8E93',
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 14,
  },
  avatarContainer: {
    width: 44,
    height: 44,
  },
  singleAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    position: 'relative',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
  },
  mainNotificationText: {
    fontSize: 13.5,
    color: '#000000',
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  actorHighlight: {
    fontWeight: '700',
  },
  timeAgoText: {
    color: '#8E8E93',
    fontSize: 13,
  },
  friendActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  acceptBtn: {
    backgroundColor: '#000000',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  declineBtn: {
    backgroundColor: '#EFEFEF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  declineBtnText: {
    color: '#000000',
    fontSize: 12.5,
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3897F0',
  },
});
