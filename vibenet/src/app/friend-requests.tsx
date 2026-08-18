import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { BottomTabInset, Colors, MaxContentWidth, Radii, Spacing, Typography } from '../constants/theme';
import { acceptFriendRequest, declineFriendRequest, getIncomingFriendRequests } from '../services/api/friends';
import type { FriendRequestResponse } from '../services/api/types';
import { resolveMediaUrl } from '../services/config';

export default function FriendRequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<FriendRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingActionIds, setPendingActionIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      const data = await getIncomingFriendRequests();
      setRequests(data);
    } catch (err) {
      console.warn('Failed to load friend requests', err);
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
    setPendingActionIds((prev) => new Set(prev).add(requestId));
    try {
      await acceptFriendRequest(requestId);
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    } catch (err) {
      console.warn('Failed to accept friend request', err);
    } finally {
      setPendingActionIds((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const handleDecline = async (requestId: string) => {
    setPendingActionIds((prev) => new Set(prev).add(requestId));
    try {
      await declineFriendRequest(requestId);
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    } catch (err) {
      console.warn('Failed to decline friend request', err);
    } finally {
      setPendingActionIds((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Friend Requests</Text>
          </View>

          {isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={Colors.textPrimary} />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {requests.length === 0 ? (
                <View style={styles.centered}>
                  <Feather name="users" size={32} color={Colors.textTertiary} />
                  <Text style={styles.emptyText}>No pending friend requests</Text>
                </View>
              ) : (
                requests.map((request) => {
                  const isBusy = pendingActionIds.has(request.requestId);
                  return (
                    <View key={request.requestId} style={styles.requestRow}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => router.push(`/profile/${request.requesterId}` as any)}
                        style={styles.requestUserInfo}>
                        <Image
                          source={{ uri: resolveMediaUrl(request.avatarUrl) }}
                          style={styles.avatar}
                        />
                        <View>
                          <Text style={styles.fullName}>{request.fullName || request.username}</Text>
                          <Text style={styles.username}>@{request.username}</Text>
                        </View>
                      </TouchableOpacity>

                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          disabled={isBusy}
                          onPress={() => handleAccept(request.requestId)}
                          style={styles.acceptBtn}>
                          <Text style={styles.acceptBtnText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          disabled={isBusy}
                          onPress={() => handleDecline(request.requestId)}
                          style={styles.declineBtn}>
                          <Text style={styles.declineBtnText}>Decline</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
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
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  backBtn: {
    paddingVertical: 4,
    paddingRight: 4,
  },
  headerTitle: {
    ...Typography.titleSmall,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.six,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.eight * 2,
  },
  emptyText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EFEFEF',
  },
  requestUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.surfaceMuted,
  },
  fullName: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  username: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  acceptBtn: {
    backgroundColor: '#0D0E11',
    paddingHorizontal: Spacing.four,
    paddingVertical: 8,
    borderRadius: Radii.md,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  declineBtn: {
    backgroundColor: '#EFEFEF',
    paddingHorizontal: Spacing.four,
    paddingVertical: 8,
    borderRadius: Radii.md,
  },
  declineBtnText: {
    color: '#0D0E11',
    fontSize: 13,
    fontWeight: '600',
  },
});
