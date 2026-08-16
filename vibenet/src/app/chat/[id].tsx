import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import { MOCK_USERS, MOCK_CHATS, ChatMessage } from '../../data/mockData';
import { Colors, Radii, Spacing, Typography, MaxContentWidth } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const friend = MOCK_USERS.find((u) => u.id === id) || MOCK_USERS[1];
  const initialChat = MOCK_CHATS.find((c) => c.friend.id === id);

  const [messages, setMessages] = useState<ChatMessage[]>(
    initialChat?.messages || [
      {
        id: 'm-default-1',
        chatId: `chat-${id}`,
        senderId: friend.id,
        content: `Hey! Glad to connect on VibeNet ✨`,
        timestamp: '10:00 AM',
        isRead: true,
      },
    ]
  );
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !currentUser) return;

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      chatId: `chat-${id}`,
      senderId: currentUser.id,
      content: inputText.trim(),
      timestamp: 'Just now',
      isRead: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Mock echo response after 1s for realistic feel
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `m-reply-${Date.now()}`,
        chatId: `chat-${id}`,
        senderId: friend.id,
        content: `Sounds awesome! 🔥 Let's sync up later today.`,
        timestamp: 'Just now',
        isRead: true,
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1200);
  };

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

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/profile')}
              style={styles.headerUser}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: friend.avatarUrl }}
                  style={styles.headerAvatar}
                />
                {friend.isOnline && <View style={styles.onlineDot} />}
              </View>
              <View>
                <Text style={styles.userName}>{friend.fullName}</Text>
                <Text style={styles.userStatus}>
                  {friend.isOnline ? 'Active now' : friend.lastActiveAt || 'Offline'}
                </Text>
              </View>
            </TouchableOpacity>

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
            {/* Timestamp Divider */}
            <View style={styles.timeDivider}>
              <Text style={styles.timeDividerText}>TODAY</Text>
            </View>

            {messages.map((msg) => {
              const isMine = msg.senderId === currentUser?.id || msg.senderId === 'u-me';

              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageRow,
                    isMine ? styles.myMessageRow : styles.theirMessageRow,
                  ]}>
                  {!isMine && (
                    <Image
                      source={{ uri: friend.avatarUrl }}
                      style={styles.messageBubbleAvatar}
                    />
                  )}

                  <View
                    style={[
                      styles.messageBubble,
                      isMine ? styles.myBubble : styles.theirBubble,
                    ]}>
                    <Text
                      style={[
                        styles.messageText,
                        isMine ? styles.myMessageText : styles.theirMessageText,
                      ]}>
                      {msg.content}
                    </Text>
                    <Text
                      style={[
                        styles.messageTimestamp,
                        isMine ? styles.myTimestamp : styles.theirTimestamp,
                      ]}>
                      {msg.timestamp}
                    </Text>
                  </View>
                </View>
              );
            })}
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
                onChangeText={setInputText}
                style={styles.textInput}
                multiline
              />
            </View>

            {inputText.trim() ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSendMessage}
                style={styles.sendBtn}>
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
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.statusOnline,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
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
  timeDivider: {
    alignItems: 'center',
    marginVertical: Spacing.two,
  },
  timeDividerText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.5,
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
    backgroundColor: Colors.textPrimary, // High-contrast black/charcoal
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
