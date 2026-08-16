import { apiClient, unwrap } from './client';
import type { PageResponse, ReelCommentResponse, ReelResponse } from './types';

export function getReelsFeed(page = 0, size = 10) {
  return unwrap<PageResponse<ReelResponse>>(apiClient.get('/api/reels/feed', { params: { page, size } }));
}

export function getReel(reelId: string) {
  return unwrap<ReelResponse>(apiClient.get(`/api/reels/${reelId}`));
}

export function getUserReels(userId: string, page = 0, size = 12) {
  return unwrap<PageResponse<ReelResponse>>(apiClient.get(`/api/reels/user/${userId}`, { params: { page, size } }));
}

export function uploadReel(form: FormData) {
  return unwrap<ReelResponse>(apiClient.post('/api/reels', form, { headers: { 'Content-Type': 'multipart/form-data' } }));
}

export function deleteReel(reelId: string) {
  return unwrap<void>(apiClient.delete(`/api/reels/${reelId}`));
}

export function incrementReelView(reelId: string) {
  return unwrap<void>(apiClient.post(`/api/reels/${reelId}/view`));
}

export function toggleSaveReel(reelId: string) {
  return unwrap<{ isSaved: boolean }>(apiClient.post(`/api/reels/${reelId}/save`));
}

export function getReelComments(reelId: string, page = 0, size = 20) {
  return unwrap<PageResponse<ReelCommentResponse>>(apiClient.get(`/api/reels/${reelId}/comments`, { params: { page, size } }));
}

export function addReelComment(reelId: string, content: string) {
  return unwrap<ReelCommentResponse>(apiClient.post(`/api/reels/${reelId}/comments`, { content }));
}

export function deleteReelComment(reelId: string, commentId: string) {
  return unwrap<void>(apiClient.delete(`/api/reels/${reelId}/comments/${commentId}`));
}

export async function shareReel(reelId: string) {
  const res = await unwrap<{ sharesCount: number }>(apiClient.post(`/api/reels/${reelId}/share`));
  return res.sharesCount;
}
