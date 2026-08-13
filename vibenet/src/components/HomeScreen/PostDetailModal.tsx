import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resolveMediaUrl } from '../../api/client';
import { addComment as addCommentRequest, getComments } from '../../api/posts';
import { CURRENT_USER_AVATAR } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { useGoToProfile } from '../../hooks/useGoToProfile';
import { formatRelativeTime } from '../../utils/time';
import { PLACEHOLDER, C } from '../../theme/colors';
import { Comment, Post } from '../../types';
import { CloseIcon } from '../../assets/Icon';
import Avatar from '../ui/Avatar';

import { BlurView } from 'expo-blur';

type PostDetailModalProps = {
  visible: boolean;
  post: Post;
  onClose: () => void;
};

const COMMENTS_PAGE_SIZE = 20;

export default function PostDetailModal({ visible, post, onClose }: PostDetailModalProps) {
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuth();
  const goToProfile = useGoToProfile();
  const inputRef = useRef<TextInput>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getComments(post.id, 0, COMMENTS_PAGE_SIZE);
      setComments(result?.data ?? []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [post.id]);

  useEffect(() => {
    if (visible) loadComments();
  }, [visible, loadComments]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const created = await addCommentRequest(post.id, content);
      if (created) setComments(prev => [created, ...prev]);
      setText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="flex-1 justify-end">
          <BlurView
            className="absolute inset-0"
            tint="light"
            intensity={40}
          />

          <Pressable className="absolute inset-0 flex-1" onPress={onClose} />
          <View
            style={{ height: '75%', paddingBottom: insets.bottom }}
            className="bg-paper-base dark:bg-ink-overlay rounded-t-hero overflow-hidden"
          >
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-hairline-light dark:border-hairline-dark">
              <Text className="text-headline text-content-strong dark:text-content-strong-dark">
                Comments
              </Text>
              <Pressable onPress={onClose} hitSlop={8}>
                <CloseIcon />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
              {/* Original post */}
              <View className="flex-row items-start gap-3">
                <Pressable onPress={() => goToProfile(post.owner.id)}>
                  <Avatar uri={resolveMediaUrl(post.owner.avatarUrl)} size={36} />
                </Pressable>
                <View className="flex-1">
                  <Text className="text-sm text-content-strong dark:text-content-strong-dark">
                    <Text className="font-semibold">{post.owner.username} </Text>
                    {post.textContent}
                  </Text>
                  <Text className="text-xs text-content-muted dark:text-content-muted-dark mt-0.5">
                    {formatRelativeTime(post.createdAt)}
                  </Text>
                </View>
              </View>
avatar
              <View
                className="border-t border-hairline-light dark:border-hairline-dark pt-4"
                style={{ gap: 14 }}
              >
                {loading ? (
                  <ActivityIndicator color={C.brand} />
                ) : comments.length === 0 ? (
                  <Text className="text-sm text-content-muted dark:text-content-muted-dark text-center py-6">
                    No comments yet. Be the first!
                  </Text>
                ) : (
                  comments.map(comment => (
                    <View key={comment.id} className="flex-row gap-3">
                      <Pressable onPress={() => goToProfile(comment.owner.id)}>
                        <Avatar uri={resolveMediaUrl(comment.owner.avatarUrl)} size={32} />
                      </Pressable>
                      <View className="flex-1">
                        <Text className="text-sm text-content-strong dark:text-content-strong-dark">
                          <Text className="font-semibold">{comment.owner.username} </Text>
                          {comment.content}
                        </Text>
                        <Text className="text-xs text-content-muted dark:text-content-muted-dark mt-0.5">
                          {formatRelativeTime(comment.createdAt)}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>

            <View className="flex-row items-center gap-3 px-4 py-3 border-t border-hairline-light dark:border-hairline-dark">
              <Avatar uri={currentUser?.avatar ?? CURRENT_USER_AVATAR} size={32} />
              <TextInput
                ref={inputRef}
                value={text}
                onChangeText={setText}
                placeholder="Add a comment..."
                placeholderTextColor={PLACEHOLDER}
                textBreakStrategy="simple"
                className="flex-1 text-sm text-content-strong dark:text-content-strong-dark"
              />
              <Pressable onPress={handleSend} disabled={!text.trim() || sending} hitSlop={8}>
                <Text
                  className={
                    text.trim()
                      ? 'text-brand font-semibold text-sm'
                      : 'text-content-faint dark:text-content-faint-dark font-semibold text-sm'
                  }
                >
                  Send
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
