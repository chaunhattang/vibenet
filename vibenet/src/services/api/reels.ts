import { apiClient, unwrap } from './client';
import type { PageResponse, ReelResponse } from './types';

export function getUserReels(userId: string, page = 0, size = 12) {
  return unwrap<PageResponse<ReelResponse>>(apiClient.get(`/api/reels/user/${userId}`, { params: { page, size } }));
}
