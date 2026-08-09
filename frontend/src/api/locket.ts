import { apiGet, apiPost } from './client';
import { LocketMoment, MomentFeedItem, MomentReaction, MomentViewers, PageResponse } from '../types';

export const getMomentFeed = (page: number, size: number) =>
  apiGet<PageResponse<MomentFeedItem>>('/api/locket/moments/feed', { page, size });

export const getLatestMoment = () => apiGet<LocketMoment>('/api/locket/moments/latest');

export const getUnreadMomentCount = () =>
  apiGet<{ unreadCount: number }>('/api/locket/moments/unread-count');

export const markMomentViewed = (momentId: string) =>
  apiPost<void>(`/api/locket/moments/${momentId}/view`);

export const getMomentViewers = (momentId: string) =>
  apiGet<MomentViewers>(`/api/locket/moments/${momentId}/viewers`);

export const reactToMoment = (momentId: string, emoji: string) =>
  apiPost<MomentReaction>(`/api/locket/moments/${momentId}/react`, { emoji });
