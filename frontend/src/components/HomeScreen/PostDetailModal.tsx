import { useRef, useState } from 'react';
import {
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
import { CURRENT_USER_AVATAR } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { useGoToProfile } from '../../hooks/useGoToProfile';
import { PLACEHOLDER } from '../../theme/colors';
import { CommentData, PostData } from '../../types';
import { CloseIcon } from '../../assets/Icon';
import Avatar from '../ui/Avatar';

type PostDetailModalProps = {
  visible: boolean;
  post: PostData;
  comments: CommentData[];
  onClose: () => void;
  onAddComment: (content: string, parentId?: string) => void;
};

export default function PostDetailModal({
  visible,
  post,
  comments,
  onClose,
  onAddComment,
}: PostDetailModalProps) {
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuth();
  const goToProfile = useGoToProfile();
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(
    null,
  );

  const topLevelComments = comments.filter(c => !c.parentId);
  const repliesFor = (id: string) => comments.filter(c => c.parentId === id);

  const handleReply = (comment: CommentData) => {
    setReplyTo({ id: comment.id, author: comment.author });
    setText(`@${comment.author} `);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyTo(null);
    setText('');
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onAddComment(text.trim(), replyTo?.id);
    setText('');
    setReplyTo(null);
  };

  const renderComment = (comment: CommentData, isReply: boolean) => (
    <View key={comment.id} className="flex-row gap-3">
      <Pressable onPress={() => goToProfile(comment.userId)}>
        <Avatar uri={comment.avatar} size={isReply ? 28 : 32} />
      </Pressable>
      <View className="flex-1">
        <Text className="text-sm text-content-strong dark:text-content-strong-dark">
          <Text className="font-semibold">{comment.author} </Text>
          {comment.content}
        </Text>
        <View className="flex-row items-center gap-3 mt-0.5">
          <Text className="text-xs text-content-muted dark:text-content-muted-dark">
            {comment.timestamp}
          </Text>
          {!isReply && (
            <Pressable onPress={() => handleReply(comment)} hitSlop={6}>
              <Text className="text-xs font-semibold text-content-muted dark:text-content-muted-dark">
                Reply
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 justify-end bg-black/50">
          <Pressable className="flex-1" onPress={onClose} />
          <View
            style={{ height: '75%', paddingBottom: insets.bottom }}
            className="bg-paper-base dark:bg-ink-overlay rounded-t-hero overflow-hidden"
          >
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-hairline-light dark:border-hairline-dark">
              <Text className="text-headline text-content-strong dark:text-content-strong-dark">
                Whisper
              </Text>
              <Pressable onPress={onClose} hitSlop={8}>
                <CloseIcon />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
              <View className="flex-row items-center gap-3">
                <Pressable onPress={() => post.ownerId && goToProfile(post.ownerId)}>
                  <Avatar uri={post.avatar} size={36} />
                </Pressable>
                <View>
                  <Text className="text-sm font-semibold text-content-strong dark:text-content-strong-dark">
                    {post.author}
                  </Text>
                  <Text className="text-xs text-content-muted dark:text-content-muted-dark">
                    {post.timestamp}
                  </Text>
                </View>
              </View>

              {!!post.content && (
                <Text className="text-[15px] text-content-strong dark:text-content-strong-dark leading-relaxed">
                  {post.content}
                </Text>
              )}

              <View
                className="border-t border-hairline-light dark:border-hairline-dark pt-4"
                style={{ gap: 14 }}
              >
                {topLevelComments.length === 0 ? (
                  <Text className="text-sm text-content-muted dark:text-content-muted-dark text-center py-6">
                    No comments yet. Be the first!
                  </Text>
                ) : (
                  topLevelComments.map(comment => (
                    <View key={comment.id} style={{ gap: 12 }}>
                      {renderComment(comment, false)}
                      {repliesFor(comment.id).map(reply => (
                        <View key={reply.id} className="ml-10">
                          {renderComment(reply, true)}
                        </View>
                      ))}
                    </View>
                  ))
                )}
              </View>
            </ScrollView>

            {replyTo && (
              <View className="flex-row items-center justify-between px-4 py-2 bg-paper-raised dark:bg-ink-input border-t border-hairline-light dark:border-hairline-dark">
                <Text className="text-xs text-content-muted dark:text-content-muted-dark">
                  Replying to{' '}
                  <Text className="font-semibold">@{replyTo.author}</Text>
                </Text>
                <Pressable onPress={cancelReply} hitSlop={8}>
                  <CloseIcon size={14} />
                </Pressable>
              </View>
            )}

            <View className="flex-row items-center gap-3 px-4 py-3 border-t border-hairline-light dark:border-hairline-dark">
              <Pressable onPress={() => currentUser && goToProfile(currentUser.userId)}>
                <Avatar uri={currentUser?.avatar ?? CURRENT_USER_AVATAR} size={32} />
              </Pressable>
              <TextInput
                ref={inputRef}
                value={text}
                onChangeText={setText}
                placeholder="Add a comment..."
                placeholderTextColor={PLACEHOLDER}
                textBreakStrategy="simple"
                className="flex-1 text-sm text-content-strong dark:text-content-strong-dark"
              />
              <Pressable
                onPress={handleSend}
                disabled={!text.trim()}
                hitSlop={8}
              >
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
