import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { ApiError } from '../api/client';
import {
  createPost as createPostRequest,
  deletePostRequest,
  getFeed,
  reactToPost,
  updatePost as updatePostRequest,
} from '../api/posts';
import { CreatePostInput, Post, ReactionType } from '../types';

const FEED_PAGE_SIZE = 20;

type PostsContextValue = {
  feed: Post[];
  feedLoading: boolean;
  feedError: string | null;
  hasMoreFeed: boolean;
  loadFeed: (opts?: { refresh?: boolean }) => Promise<void>;
  loadMoreFeed: () => Promise<void>;
  createPost: (input: CreatePostInput) => Promise<Post | undefined>;
  updatePost: (postId: string, textContent: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  react: (postId: string, type: ReactionType) => Promise<void>;
};

const PostsContext = createContext<PostsContextValue | null>(null);

// Đếm lại reactionCount từ trạng thái gốc + reaction kết quả (dùng cho cả optimistic
// lẫn khi reconcile theo giá trị server trả về — xem toggle semantics ở BE §4.7).
function applyReaction(post: Post, next: ReactionType | null, baseCount: number): Post {
  const had = post.currentReaction !== null;
  const has = next !== null;
  const delta = (has ? 1 : 0) - (had ? 1 : 0);
  return { ...post, currentReaction: next, reactionCount: baseCount + delta };
}

function predictReaction(current: ReactionType | null, tapped: ReactionType): ReactionType | null {
  if (current === null) return tapped; // chưa react → set
  if (current === tapped) return null; // react lại cùng loại → gỡ
  return tapped; // đang react loại khác → đổi
}

export function PostsProvider({ children }: { children: ReactNode }) {
  const [feed, setFeed] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);

  const loadFeed = useCallback(async (opts?: { refresh?: boolean }) => {
    setFeedLoading(true);
    setFeedError(null);
    try {
      const result = await getFeed(0, FEED_PAGE_SIZE);
      setFeed(result?.data ?? []);
      setPage(0);
      setHasMoreFeed((result?.totalPages ?? 0) > 1);
    } catch (err) {
      setFeedError(err instanceof ApiError ? err.message : 'Could not load your feed.');
      if (!opts?.refresh) setFeed([]);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  const loadMoreFeed = useCallback(async () => {
    if (feedLoading || !hasMoreFeed) return;
    const nextPage = page + 1;
    setFeedLoading(true);
    try {
      const result = await getFeed(nextPage, FEED_PAGE_SIZE);
      setFeed(prev => [...prev, ...(result?.data ?? [])]);
      setPage(nextPage);
      setHasMoreFeed((result?.totalPages ?? 0) > nextPage + 1);
    } catch (err) {
      setFeedError(err instanceof ApiError ? err.message : 'Could not load more posts.');
    } finally {
      setFeedLoading(false);
    }
  }, [feedLoading, hasMoreFeed, page]);

  const createPost = useCallback(async (input: CreatePostInput) => {
    const created = await createPostRequest(input);
    if (created) setFeed(prev => [created, ...prev]);
    return created;
  }, []);

  const updatePost = useCallback(async (postId: string, textContent: string) => {
    const updated = await updatePostRequest(postId, textContent);
    if (updated) setFeed(prev => prev.map(p => (p.id === postId ? updated : p)));
  }, []);

  // Optimistic + rollback: xoá khỏi feed ngay, khôi phục nếu server trả lỗi.
  const deletePost = useCallback(async (postId: string) => {
    let removed: { post: Post; index: number } | null = null;
    setFeed(prev => {
      const index = prev.findIndex(p => p.id === postId);
      if (index >= 0) removed = { post: prev[index], index };
      return prev.filter(p => p.id !== postId);
    });
    try {
      await deletePostRequest(postId);
    } catch {
      if (removed) {
        const { post, index } = removed;
        setFeed(prev => {
          const next = [...prev];
          next.splice(Math.min(index, next.length), 0, post);
          return next;
        });
      }
    }
  }, []);

  // Optimistic theo dự đoán toggle, rồi reconcile theo giá trị server trả về
  // (server là nguồn sự thật — tránh lệch khi có race). Rollback nếu request fail.
  const react = useCallback(async (postId: string, type: ReactionType) => {
    const target = feed.find(p => p.id === postId);
    if (!target) return;
    const baseReaction = target.currentReaction;
    const baseCount = target.reactionCount;

    const predicted = predictReaction(baseReaction, type);
    setFeed(prev => prev.map(p => (p.id === postId ? applyReaction(p, predicted, baseCount) : p)));

    try {
      const actual = await reactToPost(postId, type);
      const resolved = actual ?? null;
      if (resolved !== predicted) {
        setFeed(prev =>
          prev.map(p =>
            p.id === postId
              ? applyReaction({ ...p, currentReaction: baseReaction }, resolved, baseCount)
              : p,
          ),
        );
      }
    } catch {
      setFeed(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, currentReaction: baseReaction, reactionCount: baseCount }
            : p,
        ),
      );
    }
  }, [feed]);

  return (
    <PostsContext.Provider
      value={{
        feed,
        feedLoading,
        feedError,
        hasMoreFeed,
        loadFeed,
        loadMoreFeed,
        createPost,
        updatePost,
        deletePost,
        react,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePosts must be used within a PostsProvider');
  return ctx;
}
