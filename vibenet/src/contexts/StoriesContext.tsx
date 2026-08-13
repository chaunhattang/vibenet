import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { MOCK_STORIES, StoryFrame, StoryItem } from '../data/mockStories';

type StoriesContextValue = {
  stories: StoryItem[];
  viewedIds: Set<string>;
  // Đánh dấu đã xem cả nhóm story của 1 user (mock). Sau này có be thì:
  // POST /api/stories/{userId}/view cho từng frame.
  markViewed: (userId: string) => void;
  // "My Story" — thêm 1 frame ảnh vừa chọn (mock). Sau này có be thì:
  // POST /api/stories (multipart) rồi refetch feed.
  addMyStoryFrame: (uri: string) => void;
};

const StoriesContext = createContext<StoriesContextValue | null>(null);

export function StoriesProvider({ children }: { children: ReactNode }) {
  const [stories, setStories] = useState<StoryItem[]>(MOCK_STORIES);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  const markViewed = useCallback((userId: string) => {
    setViewedIds(prev => {
      if (prev.has(userId)) return prev;
      const next = new Set(prev);
      next.add(userId);
      return next;
    });
  }, []);

  const addMyStoryFrame = useCallback((uri: string) => {
    const frame: StoryFrame = {
      id: `mine-${Date.now()}`,
      uri,
      createdAt: new Date().toISOString(),
    };
    setStories(prev =>
      prev.map(s =>
        s.id === 'mine'
          ? { ...s, hasStory: true, frames: [...s.frames, frame] }
          : s,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({ stories, viewedIds, markViewed, addMyStoryFrame }),
    [stories, viewedIds, markViewed, addMyStoryFrame],
  );

  return <StoriesContext.Provider value={value}>{children}</StoriesContext.Provider>;
}

export function useStories() {
  const ctx = useContext(StoriesContext);
  if (!ctx) throw new Error('useStories must be used within a StoriesProvider');
  return ctx;
}
