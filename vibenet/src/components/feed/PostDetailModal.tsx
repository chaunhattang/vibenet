import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PostResponse } from '../../services/api/types';
import { PostCard } from './PostCard';
import { CommentListItem } from './CommentListItem';
import { CommentInputBar } from './CommentInputBar';
import { useComments } from '../../hooks/use-comments';
import { Colors, Spacing, Typography } from '../../constants/theme';

interface PostDetailModalProps {
  visible: boolean;
  post: PostResponse | null;
  onClose: () => void;
  onPressAuthor?: (authorId: string) => void;
}

// Single-post detail view opened by tapping a grid thumbnail (profile posts grid).
// Reuses PostCard for the media/reactions and renders comments inline in the same
// screen — deliberately NOT a nested <Modal> (comments used to open as a second
// stacked Modal here, which double-layers native modal surfaces the same way the
// story viewer route used to, and is what left the close button sitting outside
// the safe-area inset since insets got measured against the wrong surface).
export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  visible,
  post,
  onClose,
  onPressAuthor,
}) => {
  const insets = useSafeAreaInsets();
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
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Post</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <ScrollView
          style={styles.scrollFlex}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <PostCard post={post} onOpenComments={() => {}} onPressAuthor={onPressAuthor} />

          <View style={styles.commentsSection}>
            <Text style={styles.commentsSectionTitle}>Comments</Text>

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
                <Text style={styles.emptySubtext}>Start the conversation! ✨</Text>
              </View>
            )}
          </View>
        </ScrollView>

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
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
  },
  closeBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  topBarSpacer: {
    width: 38,
  },
  scrollFlex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Spacing.two,
  },
  commentsSection: {
    flex: 1,
    backgroundColor: Colors.surfaceWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -Spacing.four,
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.eight,
    gap: Spacing.four,
  },
  commentsSectionTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.one,
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
