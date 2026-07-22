import { createContext, ReactNode, useContext, useState } from 'react';
import { mockPosts } from '../data/mockData';
import { PostData } from '../types';

type PostsContextValue = {
  posts: PostData[];
  addPost: (post: PostData) => void;
  deletePost: (id: string) => void;
};

const PostsContext = createContext<PostsContextValue | null>(null);

// Giữ posts ở đây (thay vì trong NewsfeedScreen) để Home feed và trang Profile
// (mục "Current Thoughts") luôn thấy cùng 1 danh sách post.
export function PostsProvider({ children }: { children: ReactNode }) {
  // Sau này có be thì: khởi tạo [] rồi getFeedPosts() trong useEffect, giống ChatContext
  const [posts, setPosts] = useState<PostData[]>(mockPosts);

  const addPost = (post: PostData) => setPosts(prev => [post, ...prev]);
  const deletePost = (id: string) => setPosts(prev => prev.filter(p => p.id !== id));

  return (
    <PostsContext.Provider value={{ posts, addPost, deletePost }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePosts must be used within a PostsProvider');
  return ctx;
}
