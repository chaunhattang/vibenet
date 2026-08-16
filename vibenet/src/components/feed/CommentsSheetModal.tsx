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
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import { PostComment, PostItem } from '../../data/mockData';
import { Colors, Radii, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

interface CommentsSheetModalProps {
  visible: boolean;
  post: PostItem | null;
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
  const [comments, setComments] = useState<PostComment[]>(post?.comments || []);

  // Sync comments whenever post changes
  React.useEffect(() => {
    if (post) {
      setComments(post.comments || []);
    }
  }, [post]);

  const handleAddComment = () => {
    if (!commentText.trim() || !user) return;

    const newComment: PostComment = {
      id: `c-${Date.now()}`,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
      content: commentText.trim(),
      createdAt: 'Just now',
      likesCount: 0,
    };

    setComments((prev) => [newComment, ...prev]);
    setCommentText('');
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
                source={{ uri: post.author.avatarUrl }}
                style={styles.commentAvatar}
              />
              <View style={styles.commentBody}>
                <View style={styles.commentUserRow}>
                  <Text style={styles.commentUsername}>
                    {post.author.username}
                  </Text>
                  <Text style={styles.authorBadge}>Author</Text>
                  <Text style={styles.commentTime}>{post.createdAt}</Text>
                </View>
                <Text style={styles.commentText}>{post.textContent}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Other Comments */}
            {comments.map((item) => (
              <View key={item.id} style={styles.commentItem}>
                <Image
                  source={{ uri: item.user.avatarUrl }}
                  style={styles.commentAvatar}
                />
                <View style={styles.commentBody}>
                  <View style={styles.commentUserRow}>
                    <Text style={styles.commentUsername}>
                      {item.user.username}
                    </Text>
                    <Text style={styles.commentTime}>{item.createdAt}</Text>
                  </View>
                  <Text style={styles.commentText}>{item.content}</Text>
                  <TouchableOpacity style={styles.replyAction}>
                    <Text style={styles.replyText}>Reply</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.likeCommentBtn}>
                  <Ionicons
                    name="heart-outline"
                    size={16}
                    color={Colors.textTertiary}
                  />
                  {item.likesCount > 0 ? (
                    <Text style={styles.commentLikesCount}>
                      {item.likesCount}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              </View>
            ))}

            {comments.length === 0 && (
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
              source={{ uri: user?.avatarUrl }}
              style={styles.myInputAvatar}
            />
            <TextInput
              placeholder={`Add a comment for @${post.author.username}...`}
              placeholderTextColor={Colors.textPlaceholder}
              value={commentText}
              onChangeText={setCommentText}
              style={styles.textInput}
            />
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
  commentText: {
    ...Typography.bodySmall,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  replyAction: {
    marginTop: 4,
  },
  replyText: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
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
