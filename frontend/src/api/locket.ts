import { apiGet, apiPost, apiPostMultipart } from './client';
import {
  CreateMomentInput,
  LocketMoment,
  MomentCreation,
  MomentFeedItem,
  MomentReaction,
  MomentViewers,
  PageResponse,
  SentMoment,
} from '../types';

export const getMomentFeed = (page: number, size: number) =>
  apiGet<PageResponse<MomentFeedItem>>('/api/locket/moments/feed', { page, size });

export const getSentMoments = (page: number, size: number) =>
  apiGet<PageResponse<SentMoment>>('/api/locket/moments/sent', { page, size });

export const getLatestMoment = () => apiGet<LocketMoment>('/api/locket/moments/latest');

export const getUnreadMomentCount = () =>
  apiGet<{ unreadCount: number }>('/api/locket/moments/unread-count');

export const markMomentViewed = (momentId: string) =>
  apiPost<void>(`/api/locket/moments/${momentId}/view`);

export const getMomentViewers = (momentId: string) =>
  apiGet<MomentViewers>(`/api/locket/moments/${momentId}/viewers`);

export const reactToMoment = (momentId: string, emoji: string) =>
  apiPost<MomentReaction>(`/api/locket/moments/${momentId}/react`, { emoji });

export const createMoment = (input: CreateMomentInput) => {
  const formData = new FormData();
  formData.append('media', {
    uri: input.assetUri,
    type: input.assetMimeType,
    name: input.assetFileName,
  } as unknown as Blob);
  if (input.caption) formData.append('caption', input.caption);
  if (input.replyToMomentId) formData.append('replyToMomentId', input.replyToMomentId);
  if (input.scope === 'SPECIFIC') {
    (input.recipientIds ?? []).forEach(id => formData.append('recipientIds', id));
  }
  return apiPostMultipart<MomentCreation>('/api/locket/moments', formData);
};
