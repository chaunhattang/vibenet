import { apiGet } from './client';
import { UserResponse } from '../types';

// Only what close-friends candidate selection needs right now — the rest of the
// Friends feature (requests, status, unfriend) is still mock, not wired here.
export const getFriends = (userId: string) => apiGet<UserResponse[]>(`/api/friends/${userId}`);
