import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_NOTIFICATIONS, NotificationItem } from '../../data/mockData';
import { Colors, Radii, Spacing, Typography, BottomTabInset, MaxContentWidth } from '../../constants/theme';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const handleAcceptRequest = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, friendRequestStatus: 'ACCEPTED' as const } : n
      )
    );
  };

  const handleDeclineRequest = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, friendRequestStatus: 'DECLINED' as const } : n
      )
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const friendRequests = notifications.filter((n) => n.type === 'FRIEND_REQUEST');
  const activityItems = notifications.filter((n) => n.type !== 'FRIEND_REQUEST');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleMarkAllRead}
              style={styles.markReadBtn}>
              <Text style={styles.markReadText}>Mark all as read</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* Friend Requests Section */}
            {friendRequests.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>FRIEND REQUESTS</Text>
                {friendRequests.map((req) => (
                  <View key={req.id} style={styles.requestCard}>
                    <Image
                      source={{ uri: req.actor.avatarUrl }}
                      style={styles.requestAvatar}
                    />
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestName}>
                        {req.actor.fullName}
                      </Text>
                      <Text style={styles.requestSubtext}>
                        {req.actor.friendsCount} mutual connections • {req.timeAgo}
                      </Text>

                      {req.friendRequestStatus === 'ACCEPTED' ? (
                        <View style={styles.acceptedBadge}>
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={Colors.statusCloseFriend}
                          />
                          <Text style={styles.acceptedText}>Connected</Text>
                        </View>
                      ) : req.friendRequestStatus === 'DECLINED' ? (
                        <Text style={styles.declinedText}>Request declined</Text>
                      ) : (
                        <View style={styles.requestActions}>
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => handleAcceptRequest(req.id)}
                            style={styles.acceptBtn}>
                            <Text style={styles.acceptBtnText}>Confirm</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => handleDeclineRequest(req.id)}
                            style={styles.declineBtn}>
                            <Text style={styles.declineBtnText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Activity Notifications */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>

              {activityItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={() => router.push('/(tabs)')}
                  style={[
                    styles.activityItem,
                    !item.isRead && styles.unreadActivityItem,
                  ]}>
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={{ uri: item.actor.avatarUrl }}
                      style={styles.activityAvatar}
                    />
                    {/* Badge Icon for type */}
                    <View
                      style={[
                        styles.typeBadge,
                        item.type === 'REACTION'
                          ? styles.reactionBadge
                          : item.type === 'LOCKET_MOMENT'
                          ? styles.locketBadge
                          : styles.commentBadge,
                      ]}>
                      <Ionicons
                        name={
                          item.type === 'REACTION'
                            ? 'heart'
                            : item.type === 'LOCKET_MOMENT'
                            ? 'camera'
                            : 'chatbubble'
                        }
                        size={10}
                        color="#FFFFFF"
                      />
                    </View>
                  </View>

                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>
                      <Text style={styles.activityActor}>
                        {item.actor.fullName}{' '}
                      </Text>
                      {item.content}
                    </Text>
                    <Text style={styles.activityTime}>{item.timeAgo}</Text>
                  </View>

                  {/* Target Media Preview Thumbnail */}
                  {item.targetMediaUrl && (
                    <Image
                      source={{ uri: item.targetMediaUrl }}
                      style={styles.mediaThumbnail}
                    />
                  )}

                  {!item.isRead && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgMain,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.bgMain,
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
  },
  headerTitle: {
    ...Typography.titleLarge,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  markReadBtn: {
    padding: Spacing.one,
  },
  markReadText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accentBlue,
  },
  scrollContent: {
    paddingBottom: BottomTabInset + Spacing.six,
  },
  section: {
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.two,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    padding: Spacing.four,
    borderRadius: Radii.lg,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  requestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceMuted,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  requestSubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.two,
  },
  requestActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  acceptBtn: {
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: Spacing.four,
    paddingVertical: 7,
    borderRadius: Radii.pill,
  },
  acceptBtnText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  declineBtn: {
    backgroundColor: Colors.surfaceMuted,
    paddingHorizontal: Spacing.four,
    paddingVertical: 7,
    borderRadius: Radii.pill,
  },
  declineBtnText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  acceptedText: {
    ...Typography.caption,
    color: Colors.statusCloseFriend,
    fontWeight: '700',
  },
  declinedText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
    position: 'relative',
  },
  unreadActivityItem: {
    backgroundColor: 'rgba(0, 132, 255, 0.04)',
  },
  avatarWrapper: {
    position: 'relative',
  },
  activityAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceMuted,
  },
  typeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  reactionBadge: {
    backgroundColor: Colors.statusLive,
  },
  locketBadge: {
    backgroundColor: Colors.statusCloseFriend,
  },
  commentBadge: {
    backgroundColor: Colors.accentBlue,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  activityActor: {
    fontWeight: '700',
  },
  activityTime: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  mediaThumbnail: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceMuted,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.accentBlue,
  },
});
