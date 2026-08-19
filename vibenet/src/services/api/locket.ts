import { apiClient, unwrap } from './client';
import type { MediaType, PageResponse } from './types';

export interface MomentFeedItemResponse {
  momentId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  mediaUrl: string;
  mediaType: MediaType;
  caption: string | null;
  createdAt: string;
  viewedAt: string | null;
  myReaction: string | null;
}

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

export interface CloseFriendResponse {
  userId: string;
  userName: string;
  fullName: string | null;
  avatarUrl: string | null;
  addedAt: string;
}

export interface CloseFriendsListResponse {
  closeFriends: CloseFriendResponse[];
  count: number;
  limit: number;
}

export function createMoment(form: FormData) {
  return unwrap<MomentCreationResponse>(
    apiClient.post('/api/locket/moments', form)
  );
}

export function getLatestMoment() {
  return unwrap<LatestMomentResponse>(apiClient.get('/api/locket/moments/latest'));
}

export function getMomentsFeed(page = 0, size = 20) {
  return unwrap<PageResponse<MomentFeedItemResponse>>(apiClient.get('/api/locket/moments/feed', { params: { page, size } }));
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

export function viewMoment(momentId: string) {
  return unwrap<void>(apiClient.post(`/api/locket/moments/${momentId}/view`));
}

export function getMomentViewers(momentId: string) {
  return unwrap<MomentViewersResponse>(apiClient.get(`/api/locket/moments/${momentId}/viewers`));
}

export function reactToMoment(momentId: string, emoji: string) {
  return unwrap<unknown>(apiClient.post(`/api/locket/moments/${momentId}/react`, { emoji }));
}

export function getCloseFriends() {
  return unwrap<CloseFriendsListResponse>(apiClient.get('/api/locket/close-friends'));
}

export function addCloseFriend(friendId: string) {
  return unwrap<{ friendId: string; addedAt: string }>(apiClient.post(`/api/locket/close-friends/${friendId}`));
}

export function removeCloseFriend(friendId: string) {
  return unwrap<void>(apiClient.delete(`/api/locket/close-friends/${friendId}`));
}
