import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { Post } from '../types';

type SavedContextValue = {
  saved: Post[]; // giữ nguyên object Post để render lưới Saved khỏi phải fetch lại
  isSaved: (postId: string) => boolean;
  toggleSave: (post: Post) => void;
};

const SavedContext = createContext<SavedContextValue | null>(null);

// Mock-first: lưu ở state trong memory. Sau này có be thì:
// POST/DELETE /api/posts/{id}/save + GET /api/saved.
export function SavedProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Post[]>([]);

  const isSaved = useCallback((postId: string) => saved.some(p => p.id === postId), [saved]);

  const toggleSave = useCallback((post: Post) => {
    setSaved(prev =>
      prev.some(p => p.id === post.id)
        ? prev.filter(p => p.id !== post.id)
        : [post, ...prev],
    );
  }, []);

  const value = useMemo(() => ({ saved, isSaved, toggleSave }), [saved, isSaved, toggleSave]);

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error('useSaved must be used within a SavedProvider');
  return ctx;
}
