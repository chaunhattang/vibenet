import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { Post } from '../types';

type LikedContextValue = {
  liked: Post[]; // giữ object Post để render lưới "Liked" khỏi fetch lại
  isLiked: (postId: string) => boolean;
  // Đồng bộ theo currentReaction của post (LOVE/FIRE => on, null => off).
  // PostCard gọi cái này trong effect mỗi khi reaction đổi.
  setLikedEntry: (post: Post, on: boolean) => void;
};

const LikedContext = createContext<LikedContextValue | null>(null);

// Mock-first (in-memory). Sau này có be thì: GET /api/posts/liked (cần endpoint mới —
// backend hiện chỉ có currentReaction trên từng post, chưa có danh sách "bài mình đã thả").
export function LikedProvider({ children }: { children: ReactNode }) {
  const [liked, setLiked] = useState<Post[]>([]);

  const isLiked = useCallback((postId: string) => liked.some(p => p.id === postId), [liked]);

  const setLikedEntry = useCallback((post: Post, on: boolean) => {
    setLiked(prev => {
      const exists = prev.some(p => p.id === post.id);
      if (on) {
        return exists ? prev.map(p => (p.id === post.id ? post : p)) : [post, ...prev];
      }
      return exists ? prev.filter(p => p.id !== post.id) : prev;
    });
  }, []);

  const value = useMemo(() => ({ liked, isLiked, setLikedEntry }), [liked, isLiked, setLikedEntry]);

  return <LikedContext.Provider value={value}>{children}</LikedContext.Provider>;
}

export function useLiked() {
  const ctx = useContext(LikedContext);
  if (!ctx) throw new Error('useLiked must be used within a LikedProvider');
  return ctx;
}
