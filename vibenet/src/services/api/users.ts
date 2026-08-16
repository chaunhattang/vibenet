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
    apiClient.put('/api/profile', form)
  );
}

export function createProfile(form: FormData) {
  return unwrap<UserResponse['profileResponse']>(
    apiClient.post('/api/profile', form)
  );
}

export async function saveOrUpdateProfile(form: FormData) {
  try {
    // Try updating first (PUT /api/profile)
    return await updateProfile(form);
  } catch (err: any) {
    // If profile doesn't exist yet, create it (POST /api/profile)
    if (
      err?.message?.toLowerCase().includes('not found') ||
      err?.response?.status === 404
    ) {
      return await createProfile(form);
    }
    // If create was attempted and failed because it already existed (409), retry with update
    if (
      err?.message?.toLowerCase().includes('already exists') ||
      err?.response?.status === 409
    ) {
      return await updateProfile(form);
    }
    throw err;
  }
}

