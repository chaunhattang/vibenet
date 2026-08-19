import { apiClient, unwrap } from './client';
import type { ReactionType } from './types';

export function togglePostReaction(postId: string, type: ReactionType) {
  return unwrap<ReactionType | null>(apiClient.post(`/api/posts/${postId}/reactions`, null, { params: { type } }));
}
