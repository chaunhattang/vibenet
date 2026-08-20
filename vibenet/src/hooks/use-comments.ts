import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as commentsApi from '../services/api/comments';
import { onPostComment } from '../services/websocket';
import { useAuth } from '../contexts/AuthContext';
import type { CommentResponse, PostResponse } from '../services/api/types';

// Shared comment list/compose state for a single post — used both by the Feed's
// bottom-sheet CommentsSheetModal and PostDetailModal's inline comments section,
// so add/delete/like/reply behavior stays identical in both places.
export function useComments(post: PostResponse | null, active: boolean) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<CommentResponse | null>(null);

  useEffect(() => {
    if (!active || !post) {
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
  }, [active, post]);

  useEffect(() => {
    if (!active || !post) return;
    return onPostComment(post.id, (event) => {
      setComments((prev) =>
        prev.some((c) => c.id === event.comment.id) ? prev : [event.comment, ...prev]
      );
    });
  }, [active, post]);

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

  return {
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
  };
}
