import { apiClient, unwrap } from './client';
import type { MediaType, PageResponse } from './types';

export interface LatestMomentResponse {
  momentId: string | null;
  senderId: string | null;
  senderName: string | null;
  senderAvatarUrl: string | null;
  mediaUrl: string | null;
  mediaType: MediaType | null;
  caption: string | null;
  createdAt: string | null;
}

export interface PublicMomentResponse {
  momentId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  mediaUrl: string;
  mediaType: MediaType;
  caption: string | null;
  createdAt: string;
}

export interface MomentCreationResponse {
  momentId: string;
  mediaUrl: string;
  mediaType: MediaType;
  durationSeconds: number | null;
  caption: string | null;
  replyToMomentId: string | null;
  createdAt: string;
  recipientCount: number;
}

export interface SentMomentResponse {
  momentId: string;
  mediaUrl: string;
  mediaType: MediaType;
  caption: string | null;
  createdAt: string;
  recipientCount: number;
  viewedCount: number;
}

export interface MomentViewerResponse {
  userId: string;
  userName: string;
  avatarUrl: string | null;
  viewedAt: string | null;
}

export interface MomentViewersResponse {
  viewedCount: number;
  totalRecipients: number;
  viewers: MomentViewerResponse[];
}

export function createMoment(form: FormData) {
  return unwrap<MomentCreationResponse>(
    apiClient.post('/api/locket/moments', form)
  );
}

export function getLatestMoment() {
  return unwrap<LatestMomentResponse>(apiClient.get('/api/locket/moments/latest'));
}

export function getPublicMoments(page = 0, size = 30) {
  return unwrap<PageResponse<PublicMomentResponse>>(apiClient.get('/api/locket/moments/public', { params: { page, size } }));
}

export function deleteMoment(momentId: string) {
  return unwrap<void>(apiClient.delete(`/api/locket/moments/${momentId}`));
}

export function getSentMoments(page = 0, size = 20) {
  return unwrap<PageResponse<SentMomentResponse>>(apiClient.get('/api/locket/moments/sent', { params: { page, size } }));
}

export function getMomentsUnreadCount() {
  return unwrap<{ unreadCount: number }>(apiClient.get('/api/locket/moments/unread-count')).then((r) => r.unreadCount);
}

export function getMomentViewers(momentId: string) {
  return unwrap<MomentViewersResponse>(apiClient.get(`/api/locket/moments/${momentId}/viewers`));
}
