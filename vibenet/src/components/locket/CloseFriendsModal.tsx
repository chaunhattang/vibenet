import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { getUserFriends } from '../../services/api/friends';
import { getCloseFriends, addCloseFriend, removeCloseFriend } from '../../services/api/locket';
import { resolveMediaUrl } from '../../services/config';
import type { UserResponse } from '../../services/api/types';

interface CloseFriendsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CloseFriendsModal: React.FC<CloseFriendsModalProps> = ({ visible, onClose }) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<UserResponse[]>([]);
  const [closeFriendIds, setCloseFriendIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [friendList, closeFriendList] = await Promise.all([
        getUserFriends(user.id),
        getCloseFriends(),
      ]);
      setFriends(friendList);
      setCloseFriendIds(new Set(closeFriendList.closeFriends.map((cf) => cf.userId)));
    } catch (err) {
      console.warn('Failed to load friends / close friends', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleOpen = useCallback(() => {
    load();
  }, [load]);

  const handleToggle = async (friendId: string) => {
    const isClose = closeFriendIds.has(friendId);
    setPendingId(friendId);
    try {
      if (isClose) {
        await removeCloseFriend(friendId);
        setCloseFriendIds((prev) => {
          const next = new Set(prev);
          next.delete(friendId);
          return next;
        });
      } else {
        await addCloseFriend(friendId);
        setCloseFriendIds((prev) => new Set(prev).add(friendId));
      }
    } catch (err) {
      Alert.alert('Could not update close friends', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onShow={handleOpen}
      onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.headerBtn}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Close Friends</Text>
          <View style={styles.headerBtn} />
        </View>

        <Text style={styles.subtitle}>
          Moments you send only reach people on this list.
        </Text>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#FFFFFF" />
          </View>
        ) : friends.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="people-outline" size={32} color="rgba(255,255,255,0.4)" />
            <Text style={styles.emptyText}>You don't have any friends yet. Add friends first, then mark them as close friends.</Text>
          </View>
        ) : (
          <FlatList
            data={friends}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isClose = closeFriendIds.has(item.id);
              const displayName = item.profileResponse?.fullName || item.username;
              return (
                <View style={styles.row}>
                  <Image
                    source={{ uri: resolveMediaUrl(item.profileResponse?.avatarUrl ?? null) }}
                    style={styles.avatar}
                  />
                  <View style={styles.rowText}>
                    <Text style={styles.rowName}>{displayName}</Text>
                    <Text style={styles.rowUsername}>@{item.username}</Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    disabled={pendingId === item.id}
                    onPress={() => handleToggle(item.id)}
                    style={[styles.toggleBtn, isClose && styles.toggleBtnActive]}>
                    {pendingId === item.id ? (
                      <ActivityIndicator size="small" color={isClose ? '#0D0E11' : '#FFFFFF'} />
                    ) : (
                      <Text style={[styles.toggleText, isClose && styles.toggleTextActive]}>
                        {isClose ? 'Added' : 'Add'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D0E11',
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerBtn: {
    minWidth: 48,
    padding: Spacing.one,
  },
  headerTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  doneText: {
    ...Typography.bodyMedium,
    color: Colors.statusCloseFriend,
    fontWeight: '600',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.six,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    gap: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E1E22',
  },
  rowText: {
    flex: 1,
  },
  rowName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  rowUsername: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 2,
  },
  toggleBtn: {
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  toggleBtnActive: {
    backgroundColor: Colors.statusCloseFriend,
    borderColor: Colors.statusCloseFriend,
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: '#0D0E11',
  },
});
