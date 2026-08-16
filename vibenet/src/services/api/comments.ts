import { apiClient, unwrap } from './client';
import type { CommentResponse, PageResponse } from './types';

export function getComments(postId: string, page = 0, size = 20) {
  return unwrap<PageResponse<CommentResponse>>(apiClient.get(`/api/posts/${postId}/comments`, { params: { page, size } }));
}

export function addComment(postId: string, content: string, parentCommentId?: string) {
  return unwrap<CommentResponse>(apiClient.post(`/api/posts/${postId}/comments`, { content, parentCommentId }));
}

export function deleteComment(postId: string, commentId: string) {
  return unwrap<void>(apiClient.delete(`/api/posts/${postId}/comments/${commentId}`));
}

export function toggleCommentReaction(commentId: string, type: 'LOVE' | 'FIRE' = 'LOVE') {
  return unwrap<{ likesCount: number; isLiked: boolean }>(
    apiClient.post(`/api/posts/comments/${commentId}/reactions`, null, { params: { type } })
  );
}
