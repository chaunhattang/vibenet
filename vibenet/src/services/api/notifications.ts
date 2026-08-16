import { apiClient, unwrap } from './client';
import type { NotificationResponse, PageResponse } from './types';

export function getNotifications(page = 0, size = 20) {
  return unwrap<PageResponse<NotificationResponse>>(apiClient.get('/api/notifications', { params: { page, size } }));
}

export async function getUnreadCount() {
  const res = await unwrap<{ unreadCount: number }>(apiClient.get('/api/notifications/unread-count'));
  return res.unreadCount;
}

export function markNotificationRead(id: string) {
  return unwrap<void>(apiClient.put(`/api/notifications/${id}/read`));
}

export function markAllNotificationsRead() {
  return unwrap<void>(apiClient.put('/api/notifications/read-all'));
}
