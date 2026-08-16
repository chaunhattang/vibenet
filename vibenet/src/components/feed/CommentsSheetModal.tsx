import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { CommentResponse, PostResponse } from '../../services/api/types';
import * as commentsApi from '../../services/api/comments';
import { Colors, Radii, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { resolveMediaUrl } from '../../services/config';

interface CommentsSheetModalProps {
  visible: boolean;
  post: PostResponse | null;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const CommentsSheetModal: React.FC<CommentsSheetModalProps> = ({
  visible,
  post,
  onClose,
}) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<CommentResponse | null>(null);

  // Fetch this post's comments whenever the sheet opens for a (possibly new) post.
  React.useEffect(() => {
    if (!visible || !post) {
      setComments([]);
      setReplyingTo(null);
      return;
    }
    setIsLoading(true);
    commentsApi
      .getComments(post.id, 0, 50)
      .then((page) => setComments(page.data))
      .catch(() => setComments([]))
      .finally(() => setIsLoading(false));
  }, [visible, post]);

  const handleAddComment = async () => {
    if (!commentText.trim() || !user || !post) return;
    const content = commentText.trim();
    const parentCommentId = replyingTo?.id;
    setCommentText('');
    setReplyingTo(null);
    try {
      const created = await commentsApi.addComment(post.id, content, parentCommentId);
      setComments((prev) => [created, ...prev]);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to post comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!post) return;
    const prev = comments;
    setComments((c) => c.filter((item) => item.id !== commentId));
    try {
      await commentsApi.deleteComment(post.id, commentId);
    } catch (err) {
      setComments(prev);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete comment');
    }
  };

  const handleToggleLikeComment = async (commentId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, liked: !c.liked, likesCount: c.likesCount + (c.liked ? -1 : 1) } : c
      )
    );
    try {
      const result = await commentsApi.toggleCommentReaction(commentId, 'LOVE');
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, liked: result.isLiked, likesCount: result.likesCount } : c))
      );
    } catch {
      // best-effort; leave optimistic state as-is
    }
  };

  if (!visible || !post) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={onClose}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetContainer}>
          {/* Header Drag Handle & Title */}
          <View style={styles.header}>
            <View style={styles.dragHandle} />
            <Text style={styles.headerTitle}>Comments</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <ScrollView
            style={styles.commentsList}
            contentContainerStyle={styles.commentsListContent}
            showsVerticalScrollIndicator={false}>
            {/* Post Author Caption as first comment item */}
            <View style={styles.commentItem}>
              <Image
                source={{ uri: resolveMediaUrl(post.owner.avatarUrl) }}
                style={styles.commentAvatar}
              />
              <View style={styles.commentBody}>
                <View style={styles.commentUserRow}>
                  <Text style={styles.commentUsername}>
                    {post.owner.username}
                  </Text>
                  <Text style={styles.authorBadge}>Author</Text>
                  <Text style={styles.commentTime}>{new Date(post.createdAt).toLocaleDateString()}</Text>
                </View>
                {post.textContent ? <Text style={styles.commentText}>{post.textContent}</Text> : null}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Other Comments */}
            {comments.map((item, idx) => {
              const isMyComment = item.owner.id === user?.id;

              return (
                <Animated.View
                  key={item.id}
                  entering={FadeInUp.springify().damping(16).delay(Math.min(idx * 30, 200))}
                  style={styles.commentItem}>
                  <Image
                    source={{ uri: resolveMediaUrl(item.owner.avatarUrl) }}
                    style={styles.commentAvatar}
                  />
                  <View style={styles.commentBody}>
                    <View style={styles.commentUserRow}>
                      <Text style={styles.commentUsername}>
                        {item.owner.username}
                      </Text>
                      <Text style={styles.commentTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                    {item.parentCommentId ? (
                      <Text style={styles.replyIndicator}>replying to a comment</Text>
                    ) : null}
                    <Text style={styles.commentText}>{item.content}</Text>
                    <View style={styles.commentActionRow}>
                      <TouchableOpacity
                        style={styles.replyAction}
                        onPress={() => setReplyingTo(item)}>
                        <Text style={styles.replyText}>Reply</Text>
                      </TouchableOpacity>
                      {isMyComment && (
                        <TouchableOpacity
                          onPress={() => handleDeleteComment(item.id)}
                          style={styles.deleteAction}>
                          <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleToggleLikeComment(item.id)}
                    style={styles.likeCommentBtn}>
                    <Ionicons
                      name={item.liked ? 'heart' : 'heart-outline'}
                      size={16}
                      color={item.liked ? Colors.statusLive : Colors.textTertiary}
                    />
                    {item.likesCount > 0 ? (
                      <Text style={styles.commentLikesCount}>
                        {item.likesCount}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}

            {!isLoading && comments.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No comments yet.</Text>
                <Text style={styles.emptySubtext}>
                  Start the conversation! ✨
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Bottom Comment Input Bar */}
          <View style={styles.inputContainer}>
            <Image
              source={{ uri: resolveMediaUrl(user?.profileResponse?.avatarUrl) }}
              style={styles.myInputAvatar}
            />
            <TextInput
              placeholder={
                replyingTo
                  ? `Replying to @${replyingTo.owner.username}...`
                  : `Add a comment for @${post.owner.username}...`
              }
              placeholderTextColor={Colors.textPlaceholder}
              value={commentText}
              onChangeText={setCommentText}
              style={styles.textInput}
            />
            {replyingTo ? (
              <TouchableOpacity onPress={() => setReplyingTo(null)} style={styles.cancelReplyBtn}>
                <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            ) : null}
            {commentText.trim().length > 0 ? (
              <TouchableOpacity
                onPress={handleAddComment}
                style={styles.sendButton}>
                <Text style={styles.sendButtonText}>Post</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.quickEmojiRow}>
                {['❤️', '🔥', '👏'].map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => setCommentText((prev) => prev + emoji)}
                    style={styles.quickEmoji}>
                    <Text style={styles.quickEmojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: Colors.surfaceWhite,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    maxHeight: SCREEN_HEIGHT * 0.75,
    minHeight: SCREEN_HEIGHT * 0.5,
  },
  header: {
    position: 'relative',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginBottom: Spacing.two,
  },
  headerTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeBtn: {
    position: 'absolute',
    right: Spacing.four,
    top: Spacing.three,
    padding: 2,
  },
  commentsList: {
    flex: 1,
  },
  commentsListContent: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: Spacing.one,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceMuted,
  },
  commentBody: {
    flex: 1,
  },
  commentUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  commentUsername: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  authorBadge: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '700',
    backgroundColor: '#EEF2FF',
    color: Colors.accentBlue,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  commentTime: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textTertiary,
  },
  replyIndicator: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.accentBlue,
    marginBottom: 2,
  },
  commentText: {
    ...Typography.bodySmall,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  commentActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: 4,
  },
  replyAction: {
    paddingVertical: 2,
  },
  replyText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  deleteAction: {
    paddingVertical: 2,
  },
  deleteText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.statusLive,
  },
  likeCommentBtn: {
    alignItems: 'center',
    padding: Spacing.one,
  },
  commentLikesCount: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textTertiary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.eight,
  },
  emptyText: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptySubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    gap: Spacing.three,
  },
  myInputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceMuted,
  },
  textInput: {
    flex: 1,
    height: 40,
    borderRadius: Radii.pill,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: Spacing.four,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  cancelReplyBtn: {
    padding: 2,
  },
  sendButton: {
    paddingHorizontal: Spacing.two,
  },
  sendButtonText: {
    ...Typography.bodySmall,
    color: Colors.accentBlue,
    fontWeight: '700',
  },
  quickEmojiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickEmoji: {
    padding: 2,
  },
  quickEmojiText: {
    fontSize: 18,
  },
});
