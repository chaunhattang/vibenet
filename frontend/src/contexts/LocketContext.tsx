import { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';
import { ApiError, resolveMediaUrl } from '../api/client';
import { addCloseFriendRequest, getCloseFriends, removeCloseFriendRequest } from '../api/closeFriends';
import { getMomentFeed, getUnreadMomentCount, markMomentViewed, reactToMoment } from '../api/locket';
import { CloseFriend, MomentFeedItem } from '../types';

const FEED_PAGE_SIZE = 20;

type NewCloseFriend = Omit<CloseFriend, 'addedAt'>;

type LocketContextValue = {
  // Close friends — wired to the real backend (GET/POST/DELETE /api/locket/close-friends).
  closeFriends: CloseFriend[];
  closeFriendsLimit: number;
  closeFriendsLoading: boolean;
  closeFriendsError: string | null;
  isCloseFriend: (userId: string) => boolean;
  loadCloseFriends: () => Promise<void>;
  addCloseFriend: (friend: NewCloseFriend) => Promise<void>;
  removeCloseFriend: (userId: string) => Promise<void>;

  // Moment feed — wired to the real backend (GET /api/locket/moments/*).
  feed: MomentFeedItem[];
  feedLoading: boolean;
  feedError: string | null;
  hasMoreFeed: boolean;
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  loadFeed: (opts?: { refresh?: boolean }) => Promise<void>;
  loadMoreFeed: () => Promise<void>;
  markViewed: (momentId: string) => Promise<void>;
  react: (momentId: string, emoji: string) => Promise<void>;
};

const LocketContext = createContext<LocketContextValue | null>(null);

export function LocketProvider({ children }: { children: ReactNode }) {
  const [closeFriends, setCloseFriends] = useState<CloseFriend[]>([]);
  const [closeFriendsLimit, setCloseFriendsLimit] = useState(0);
  const [closeFriendsLoading, setCloseFriendsLoading] = useState(false);
  const [closeFriendsError, setCloseFriendsError] = useState<string | null>(null);

  const [feed, setFeed] = useState<MomentFeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const viewedIdsRef = useRef(new Set<string>());

  const isCloseFriend = (userId: string) => closeFriends.some(f => f.userId === userId);

  const loadCloseFriends = useCallback(async () => {
    setCloseFriendsLoading(true);
    setCloseFriendsError(null);
    try {
      const result = await getCloseFriends();
      setCloseFriends(
        (result?.closeFriends ?? []).map(f => ({ ...f, avatarUrl: resolveMediaUrl(f.avatarUrl) })),
      );
      setCloseFriendsLimit(result?.limit ?? 0);
    } catch (err) {
      setCloseFriendsError(
        err instanceof ApiError ? err.message : 'Could not load your close friends.',
      );
    } finally {
      setCloseFriendsLoading(false);
    }
  }, []);

  // Not optimistic on purpose: the backend rejects this for real business reasons
  // (not an accepted friend yet, limit reached) that the caller needs to see accurately.
  const addCloseFriend = useCallback(async (friend: NewCloseFriend) => {
    if (closeFriends.some(f => f.userId === friend.userId)) return;
    const response = await addCloseFriendRequest(friend.userId);
    setCloseFriends(prev => [
      ...prev,
      { ...friend, addedAt: response?.addedAt ?? new Date().toISOString() },
    ]);
  }, [closeFriends]);

  // Optimistic: removal is idempotent/always-succeeds server-side, so roll back only
  // on an actual network/server failure.
  const removeCloseFriend = useCallback(async (userId: string) => {
    const removed = closeFriends.find(f => f.userId === userId);
    setCloseFriends(prev => prev.filter(f => f.userId !== userId));
    try {
      await removeCloseFriendRequest(userId);
    } catch {
      if (removed) setCloseFriends(prev => [...prev, removed]);
    }
  }, [closeFriends]);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const result = await getUnreadMomentCount();
      setUnreadCount(result?.unreadCount ?? 0);
    } catch {
      // Non-critical — leave the last known count on screen rather than erroring the feed.
    }
  }, []);

  const loadFeed = useCallback(async (opts?: { refresh?: boolean }) => {
    setFeedLoading(true);
    setFeedError(null);
    try {
      const result = await getMomentFeed(0, FEED_PAGE_SIZE);
      setFeed(result?.data ?? []);
      setPage(0);
      setHasMoreFeed((result?.totalPages ?? 0) > 1);
    } catch (err) {
      setFeedError(err instanceof ApiError ? err.message : 'Could not load your Locket feed.');
      if (!opts?.refresh) setFeed([]);
    } finally {
      setFeedLoading(false);
    }
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  const loadMoreFeed = useCallback(async () => {
    if (feedLoading || !hasMoreFeed) return;
    const nextPage = page + 1;
    setFeedLoading(true);
    try {
      const result = await getMomentFeed(nextPage, FEED_PAGE_SIZE);
      setFeed(prev => [...prev, ...(result?.data ?? [])]);
      setPage(nextPage);
      setHasMoreFeed((result?.totalPages ?? 0) > nextPage + 1);
    } catch (err) {
      setFeedError(err instanceof ApiError ? err.message : 'Could not load more moments.');
    } finally {
      setFeedLoading(false);
    }
  }, [feedLoading, hasMoreFeed, page]);

  const markViewed = useCallback(async (momentId: string) => {
    if (viewedIdsRef.current.has(momentId)) return;
    viewedIdsRef.current.add(momentId);
    // Optimistic — assume it sticks, since there's nothing meaningful to roll back to in the UI.
    setFeed(prev =>
      prev.map(m => (m.momentId === momentId ? { ...m, viewedAt: new Date().toISOString() } : m)),
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await markMomentViewed(momentId);
    } catch {
      viewedIdsRef.current.delete(momentId);
    }
  }, []);

  const react = useCallback(async (momentId: string, emoji: string) => {
    const previous = feed.find(m => m.momentId === momentId)?.myReaction ?? null;
    setFeed(prev => prev.map(m => (m.momentId === momentId ? { ...m, myReaction: emoji } : m)));
    try {
      await reactToMoment(momentId, emoji);
    } catch {
      setFeed(prev =>
        prev.map(m => (m.momentId === momentId ? { ...m, myReaction: previous } : m)),
      );
    }
  }, [feed]);

  return (
    <LocketContext.Provider
      value={{
        closeFriends,
        closeFriendsLimit,
        closeFriendsLoading,
        closeFriendsError,
        isCloseFriend,
        loadCloseFriends,
        addCloseFriend,
        removeCloseFriend,
        feed,
        feedLoading,
        feedError,
        hasMoreFeed,
        unreadCount,
        refreshUnreadCount,
        loadFeed,
        loadMoreFeed,
        markViewed,
        react,
      }}
    >
      {children}
    </LocketContext.Provider>
  );
}

export function useLocket() {
  const ctx = useContext(LocketContext);
  if (!ctx) throw new Error('useLocket must be used within a LocketProvider');
  return ctx;
}
