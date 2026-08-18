import { apiClient, unwrap } from './client';
import type { FriendRequestResponse, UserResponse } from './types';

export type FriendshipStatus = 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'FRIENDS' | 'SELF';

export interface FriendshipStatusResponse {
  status: FriendshipStatus;
  friendshipId: string | null;
}

export function sendFriendRequest(receiverId: string) {
  return unwrap<void>(apiClient.post(`/api/friends/${receiverId}/request`));
}

export function acceptFriendRequest(requestId: string) {
  return unwrap<void>(apiClient.put(`/api/friends/${requestId}/accept`));
}

export function declineFriendRequest(requestId: string) {
  return unwrap<void>(apiClient.put(`/api/friends/${requestId}/decline`));
}

export function unfriend(targetUserId: string) {
  return unwrap<void>(apiClient.delete(`/api/friends/${targetUserId}`));
}

export function getUserFriends(userId: string) {
  return unwrap<UserResponse[]>(apiClient.get(`/api/friends/${userId}`));
}

export function getIncomingFriendRequests() {
  return unwrap<FriendRequestResponse[]>(apiClient.get('/api/friends/requests/incoming'));
}

export function checkFriendshipStatus(targetUserId: string) {
  return unwrap<FriendshipStatusResponse>(apiClient.get(`/api/friends/${targetUserId}/status`));
}
