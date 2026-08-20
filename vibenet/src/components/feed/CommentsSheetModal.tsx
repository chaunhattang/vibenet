import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { PostResponse } from '../../services/api/types';
import { Colors, Radii, Spacing, Typography } from '../../constants/theme';
import { resolveMediaUrl } from '../../services/config';
import { useComments } from '../../hooks/use-comments';
import { CommentListItem } from './CommentListItem';
import { CommentInputBar } from './CommentInputBar';

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
  const {
    user,
    comments,
    isLoading,
    commentText,
    setCommentText,
    replyingTo,
    setReplyingTo,
    handleAddComment,
    handleDeleteComment,
    handleToggleLikeComment,
  } = useComments(post, visible);

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
            {comments.map((item, idx) => (
              <CommentListItem
                key={item.id}
                comment={item}
                index={idx}
                isMine={item.owner.id === user?.id}
                onReply={setReplyingTo}
                onDelete={handleDeleteComment}
                onToggleLike={handleToggleLikeComment}
              />
            ))}

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
          <CommentInputBar
            avatarUrl={user?.profileResponse?.avatarUrl}
            authorUsername={post.owner.username}
            value={commentText}
            onChangeText={setCommentText}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
            onSubmit={handleAddComment}
          />
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
});
