import { apiGet, apiPut } from './client';
import { AppNotification, PageResponse } from '../types';

export const getNotifications = (page: number, size: number) =>
  apiGet<PageResponse<AppNotification>>('/api/notifications', { page, size });

export const getUnreadNotificationCount = () =>
  apiGet<{ unreadCount: number }>('/api/notifications/unread-count');

export const markNotificationRead = (notificationId: string) =>
  apiPut<void>(`/api/notifications/${notificationId}/read`);

export const markAllNotificationsRead = () =>
  apiPut<void>('/api/notifications/read-all');
