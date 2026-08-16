import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors, Radii, Spacing, Typography, MaxContentWidth } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { getChatMessages, getOrCreateRoomWithFriend } from '../../services/api/chat';
import { getUserById } from '../../services/api/users';
import { onChatMessage, onRead, onTyping, sendChatMessage, sendRead, sendTyping } from '../../services/websocket';
import type { ChatMessageResponse, UserResponse } from '../../services/api/types';
import { resolveMediaUrl } from '../../services/config';

let typingTimeout: ReturnType<typeof setTimeout> | null = null;

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [friend, setFriend] = useState<UserResponse | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [inputText, setInputText] = useState('');
  const [friendIsTyping, setFriendIsTyping] = useState(false);
  const [lastReadByFriend, setLastReadByFriend] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!id || !currentUser) return;
    let cancelled = false;

    (async () => {
      try {
        const [friendRes, roomChatId] = await Promise.all([getUserById(id), getOrCreateRoomWithFriend(id)]);
        if (cancelled) return;
        setFriend(friendRes);
        setChatId(roomChatId);

        const history = await getChatMessages(roomChatId, 0, 50);
        if (cancelled) return;
        setMessages(history.data.slice().reverse());
      } catch (err) {
        console.warn('Failed to load chat', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = onChatMessage((msg) => {
      const isForThisChat =
        (msg.senderId === id && msg.recipientId === currentUser.id) ||
        (msg.senderId === currentUser.id && msg.recipientId === id);
      if (isForThisChat) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [id, currentUser]);

  useEffect(() => {
    if (!chatId) return;
    const unsubTyping = onTyping(chatId, (e) => {
      if (e.userId === id) setFriendIsTyping(e.isTyping);
    });
    const unsubRead = onRead(chatId, (e) => {
      if (e.userId === id) setLastReadByFriend(e.lastMessageId);
    });
    return () => {
      unsubTyping();
      unsubRead();
    };
  }, [chatId, id]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });

    // Mark the latest incoming message as read.
    if (chatId && currentUser && messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.senderId !== currentUser.id) {
        sendRead(chatId, last.id);
      }
    }
  }, [messages, chatId, currentUser]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !currentUser || !id) return;
    sendChatMessage(id, inputText.trim());
    setInputText('');
    if (chatId) sendTyping(chatId, false);
  };

  const handleChangeText = useCallback(
    (text: string) => {
      setInputText(text);
      if (!chatId) return;
      sendTyping(chatId, true);
      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => sendTyping(chatId, false), 2000);
    },
    [chatId]
  );

  const friendAvatarUrl = resolveMediaUrl(friend?.profileResponse?.avatarUrl);
  const friendDisplayName = friend?.profileResponse?.fullName ?? friend?.username ?? '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <View style={styles.contentWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.headerUser}>
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: friendAvatarUrl }} style={styles.headerAvatar} />
              </View>
              <View>
                <Text style={styles.userName}>{friendDisplayName}</Text>
                <Text style={styles.userStatus}>{friendIsTyping ? 'Typing…' : 'Active'}</Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity activeOpacity={0.7} style={styles.actionIconBtn}>
                <Ionicons name="call-outline" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} style={styles.actionIconBtn}>
                <Ionicons name="videocam-outline" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Messages Scroll Area */}
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.messagesScroll}
            showsVerticalScrollIndicator={false}>
            {messages.map((msg, idx) => {
              const isMine = msg.senderId === currentUser?.id;
              const isLastMine = isMine && idx === messages.length - 1;
              const wasSeen = isLastMine && lastReadByFriend === msg.id;

              return (
                <View key={msg.id}>
                  <View
                    style={[
                      styles.messageRow,
                      isMine ? styles.myMessageRow : styles.theirMessageRow,
                    ]}>
                    {!isMine && (
                      <Image source={{ uri: friendAvatarUrl }} style={styles.messageBubbleAvatar} />
                    )}

                    <View style={[styles.messageBubble, isMine ? styles.myBubble : styles.theirBubble]}>
                      <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>
                        {msg.content}
                      </Text>
                      <Text style={[styles.messageTimestamp, isMine ? styles.myTimestamp : styles.theirTimestamp]}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                  {wasSeen && <Text style={styles.seenLabel}>Seen</Text>}
                </View>
              );
            })}
            {friendIsTyping && (
              <View style={[styles.messageRow, styles.theirMessageRow]}>
                <Image source={{ uri: friendAvatarUrl }} style={styles.messageBubbleAvatar} />
                <View style={[styles.messageBubble, styles.theirBubble]}>
                  <Text style={styles.theirMessageText}>…</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom Message Input Bar */}
          <View style={styles.composerContainer}>
            <TouchableOpacity activeOpacity={0.7} style={styles.attachBtn}>
              <Ionicons name="add-circle" size={28} color={Colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Message..."
                placeholderTextColor={Colors.textPlaceholder}
                value={inputText}
                onChangeText={handleChangeText}
                style={styles.textInput}
                multiline
              />
            </View>

            {inputText.trim() ? (
              <TouchableOpacity activeOpacity={0.8} onPress={handleSendMessage} style={styles.sendBtn}>
                <Feather name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity activeOpacity={0.7} style={styles.micBtn}>
                <Ionicons name="mic-outline" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
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
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    padding: Spacing.one,
    marginLeft: -Spacing.two,
  },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
    flex: 1,
    marginLeft: Spacing.one,
  },
  avatarWrapper: {
    position: 'relative',
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceMuted,
  },
  userName: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  userStatus: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.statusOnline,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  actionIconBtn: {
    padding: Spacing.one,
  },
  messagesScroll: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.three,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  theirMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceMuted,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two + 2,
    borderRadius: Radii.lg,
  },
  myBubble: {
    backgroundColor: Colors.textPrimary,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  messageText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    lineHeight: 19,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {
    color: Colors.textPrimary,
  },
  messageTimestamp: {
    ...Typography.caption,
    fontSize: 9,
    marginTop: 4,
    textAlign: 'right',
  },
  myTimestamp: {
    color: 'rgba(255, 255, 255, 0.65)',
  },
  theirTimestamp: {
    color: Colors.textTertiary,
  },
  seenLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: 2,
  },
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EBEBEB',
    gap: Spacing.two,
  },
  attachBtn: {
    padding: 2,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.four,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    maxHeight: 100,
  },
  textInput: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtn: {
    padding: Spacing.two,
  },
});
