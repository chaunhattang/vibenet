import { apiDelete, apiGet, apiPost } from './client';
import { CloseFriend } from '../types';

export type CloseFriendsListResponse = { closeFriends: CloseFriend[]; count: number; limit: number };
export type AddCloseFriendResponse = { friendId: string; addedAt: string };

export const getCloseFriends = () => apiGet<CloseFriendsListResponse>('/api/locket/close-friends');

export const addCloseFriendRequest = (friendId: string) =>
  apiPost<AddCloseFriendResponse>(`/api/locket/close-friends/${friendId}`);

export const removeCloseFriendRequest = (friendId: string) =>
  apiDelete<void>(`/api/locket/close-friends/${friendId}`);
