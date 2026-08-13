import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { ApiError } from '../api/client';
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications';
import { AppNotification } from '../types';

const PAGE_SIZE = 20;

type NotificationsContextValue = {
  notifications: AppNotification[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  unreadCount: number;
  load: (opts?: { refresh?: boolean }) => Promise<void>;
  loadMore: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

// Wired vào backend thật (/api/notifications). Mirror feed slice của PostsContext/LocketContext.
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const result = await getUnreadNotificationCount();
      setUnreadCount(result?.unreadCount ?? 0);
    } catch {
      // Non-critical — giữ số cũ trên màn hình thay vì báo lỗi.
    }
  }, []);

  const load = useCallback(async (opts?: { refresh?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getNotifications(0, PAGE_SIZE);
      setNotifications(result?.data ?? []);
      setPage(0);
      setHasMore((result?.totalPages ?? 0) > 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load notifications.');
      if (!opts?.refresh) setNotifications([]);
    } finally {
      setLoading(false);
    }
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setLoading(true);
    try {
      const result = await getNotifications(nextPage, PAGE_SIZE);
      setNotifications(prev => [...prev, ...(result?.data ?? [])]);
      setPage(nextPage);
      setHasMore((result?.totalPages ?? 0) > nextPage + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load more.');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  // Optimistic: đánh dấu đã đọc + giảm unread ngay, rollback nếu request fail.
  const markRead = useCallback(async (id: string) => {
    const target = notifications.find(n => n.id === id);
    if (!target || target.read) return;
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await markNotificationRead(id);
    } catch {
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: false } : n)));
      setUnreadCount(prev => prev + 1);
    }
  }, [notifications]);

  const markAllRead = useCallback(async () => {
    const previous = notifications;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      setNotifications(previous);
      refreshUnreadCount();
    }
  }, [notifications, refreshUnreadCount]);

  const value = useMemo(
    () => ({
      notifications,
      loading,
      error,
      hasMore,
      unreadCount,
      load,
      loadMore,
      markRead,
      markAllRead,
      refreshUnreadCount,
    }),
    [notifications, loading, error, hasMore, unreadCount, load, loadMore, markRead, markAllRead, refreshUnreadCount],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider');
  return ctx;
}
