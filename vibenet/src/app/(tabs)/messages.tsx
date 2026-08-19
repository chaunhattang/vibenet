import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import { getChatRooms } from '../../services/api/chat';
import { getOnlineUsers } from '../../services/api/users';
import type { ChatRoomResponse, UserResponse } from '../../services/api/types';
import { resolveMediaUrl } from '../../services/config';
import { onChatMessage } from '../../services/websocket';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Radii, Spacing, Typography, BottomTabInset, MaxContentWidth } from '../../constants/theme';

export default function MessagesScreen() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<ChatRoomResponse[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<UserResponse[]>([]);

  const load = useCallback(async () => {
    try {
      const [rooms, online] = await Promise.all([getChatRooms(), getOnlineUsers()]);
      setChats(rooms);
      setOnlineUsers(online);
    } catch (err) {
      console.warn('Failed to load messages', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Live-update the inbox as messages arrive, instead of only refreshing on
  // screen focus — bump the matching chat's preview/time and move it to the
  // top; a message from a brand-new conversation isn't in `chats` yet, so
  // just reload to pick it up.
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = onChatMessage((msg) => {
      const friendId = msg.senderId === currentUser.id ? msg.recipientId : msg.senderId;
      setChats((prev) => {
        const idx = prev.findIndex((c) => c.friendId === friendId);
        if (idx === -1) {
          load();
          return prev;
        }
        const updated: ChatRoomResponse = {
          ...prev[idx],
          lastMessage: msg.content,
          lastMessageTime: msg.timestamp,
        };
        const next = prev.filter((_, i) => i !== idx);
        next.unshift(updated);
        return next;
      });
    });
    return () => {
      unsubscribe();
    };
  }, [currentUser, load]);

  const filteredChats = chats.filter(
    (c) =>
      c.friendName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Messages</Text>
            <TouchableOpacity activeOpacity={0.7} style={styles.newChatBtn}>
              <Feather name="edit" size={18} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={Colors.textTertiary} />
              <TextInput
                placeholder="Search messages & friends..."
                placeholderTextColor={Colors.textPlaceholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* Active Online Friends Row */}
            {onlineUsers.length > 0 && (
              <View style={styles.onlineSection}>
                <Text style={styles.sectionTitle}>ONLINE NOW</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.onlineScroll}>
                  {onlineUsers.map((user) => (
                    <TouchableOpacity
                      key={user.id}
                      activeOpacity={0.8}
                      onPress={() => router.push(`/chat/${user.id}` as any)}
                      style={styles.onlineUserItem}>
                      <View style={styles.onlineAvatarWrapper}>
                        <Image
                          source={{ uri: resolveMediaUrl(user.profileResponse?.avatarUrl) }}
                          style={styles.onlineAvatarImg}
                        />
                        <View style={styles.onlineDot} />
                      </View>
                      <Text numberOfLines={1} style={styles.onlineUserName}>
                        {(user.profileResponse?.fullName ?? user.username).split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Conversation List */}
            <View style={styles.chatsList}>
              <Text style={styles.sectionTitle}>DIRECT MESSAGES</Text>

              {filteredChats.map((chat) => (
                <TouchableOpacity
                  key={chat.chatId}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/chat/${chat.friendId}` as any)}
                  style={styles.chatRowItem}>
                  <View style={styles.avatarContainer}>
                    <Image
                      source={{ uri: resolveMediaUrl(chat.friendAvatar) }}
                      style={styles.chatAvatar}
                    />
                  </View>

                  <View style={styles.chatInfo}>
                    <View style={styles.chatHeaderRow}>
                      <Text style={styles.friendName}>{chat.friendName}</Text>
                      <Text style={styles.messageTime}>
                        {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </Text>
                    </View>

                    <View style={styles.messagePreviewRow}>
                      <Text numberOfLines={1} style={styles.messageSnippet}>
                        {chat.lastMessage || 'Say hi 👋'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {filteredChats.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTitle}>No conversations found</Text>
                  <Text style={styles.emptySubtitle}>
                    Try searching for another friend
                  </Text>
                </View>
              )}
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
  newChatBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: Radii.pill,
    backgroundColor: '#EBECEF',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: BottomTabInset + Spacing.six,
  },
  sectionTitle: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.two,
  },
  onlineSection: {
    marginBottom: Spacing.four,
  },
  onlineScroll: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  onlineUserItem: {
    alignItems: 'center',
    width: 60,
  },
  onlineAvatarWrapper: {
    position: 'relative',
  },
  onlineAvatarImg: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.surfaceMuted,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: Colors.statusOnline,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineUserName: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textPrimary,
    marginTop: 4,
    textAlign: 'center',
  },
  chatsList: {
    paddingTop: Spacing.two,
  },
  chatRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.three,
  },
  avatarContainer: {
    position: 'relative',
  },
  chatAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surfaceMuted,
  },
  chatInfo: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: Spacing.three,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  friendName: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  messageTime: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textTertiary,
  },
  messagePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  messageSnippet: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.eight,
  },
  emptyTitle: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
