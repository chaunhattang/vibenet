import { apiClient, unwrap } from './client';
import type { PageResponse, UserResponse } from './types';

export function getUserById(id: string) {
  return unwrap<UserResponse>(apiClient.get(`/api/users/${id}`));
}

export function searchUsers(username: string) {
  return unwrap<UserResponse[]>(apiClient.get('/api/users/search', { params: { username } }));
}

export function getOnlineUsers() {
  return unwrap<UserResponse[]>(apiClient.get('/api/users/online'));
}

export function sendHeartbeat() {
  return unwrap<void>(apiClient.post('/api/users/heartbeat'));
}

export function follow(userId: string) {
  return unwrap<{ isFollowing: boolean; followersCount: number }>(apiClient.post(`/api/users/${userId}/follow`));
}

export function unfollow(userId: string) {
  return unwrap<{ isFollowing: boolean; followersCount: number }>(apiClient.delete(`/api/users/${userId}/follow`));
}

export function getFollowers(userId: string, page = 0, size = 20) {
  return unwrap<PageResponse<UserResponse>>(apiClient.get(`/api/users/${userId}/followers`, { params: { page, size } }));
}

export function getFollowing(userId: string, page = 0, size = 20) {
  return unwrap<PageResponse<UserResponse>>(apiClient.get(`/api/users/${userId}/following`, { params: { page, size } }));
}

export function updateProfile(form: FormData) {
  return unwrap<UserResponse['profileResponse']>(
    apiClient.put('/api/profile', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  );
}

export function createProfile(form: FormData) {
  return unwrap<UserResponse['profileResponse']>(
    apiClient.post('/api/profile', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  );
}
