import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { CommentResponse } from '../../services/api/types';
import { resolveMediaUrl } from '../../services/config';
import { Colors, Spacing, Typography } from '../../constants/theme';

interface CommentListItemProps {
  comment: CommentResponse;
  isMine: boolean;
  index: number;
  onReply: (comment: CommentResponse) => void;
  onDelete: (commentId: string) => void;
  onToggleLike: (commentId: string) => void;
}

export const CommentListItem: React.FC<CommentListItemProps> = ({
  comment,
  isMine,
  index,
  onReply,
  onDelete,
  onToggleLike,
}) => (
  <Animated.View
    entering={FadeInUp.springify().damping(16).delay(Math.min(index * 30, 200))}
    style={styles.commentItem}>
    <Image source={{ uri: resolveMediaUrl(comment.owner.avatarUrl) }} style={styles.commentAvatar} />
    <View style={styles.commentBody}>
      <View style={styles.commentUserRow}>
        <Text style={styles.commentUsername}>{comment.owner.username}</Text>
        <Text style={styles.commentTime}>{new Date(comment.createdAt).toLocaleDateString()}</Text>
      </View>
      {comment.parentCommentId ? <Text style={styles.replyIndicator}>replying to a comment</Text> : null}
      <Text style={styles.commentText}>{comment.content}</Text>
      <View style={styles.commentActionRow}>
        <TouchableOpacity style={styles.replyAction} onPress={() => onReply(comment)}>
          <Text style={styles.replyText}>Reply</Text>
        </TouchableOpacity>
        {isMine && (
          <TouchableOpacity onPress={() => onDelete(comment.id)} style={styles.deleteAction}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>

    <TouchableOpacity onPress={() => onToggleLike(comment.id)} style={styles.likeCommentBtn}>
      <Ionicons
        name={comment.liked ? 'heart' : 'heart-outline'}
        size={16}
        color={comment.liked ? Colors.statusLive : Colors.textTertiary}
      />
      {comment.likesCount > 0 ? <Text style={styles.commentLikesCount}>{comment.likesCount}</Text> : null}
    </TouchableOpacity>
  </Animated.View>
);

const styles = StyleSheet.create({
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
});
