import { apiDelete, apiGet, apiPost, apiPostMultipart, apiPut } from './client';
import { CURRENT_USER_AVATAR, CURRENT_USER_ID } from '../constants';
import { mockComments, mockPosts } from '../data/mockData';
import {
  Comment,
  CreatePostInput,
  PageResponse,
  Post,
  ReactionType,
} from '../types';

let localPosts: Post[] = [...mockPosts];
let localComments: Record<string, Comment[]> = { ...mockComments };

function paginate<T>(items: T[], page: number, size: number): PageResponse<T> {
  const totalElements = items.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const data = items.slice(page * size, (page + 1) * size);
  return {
    currentPage: page,
    totalPages,
    pageSize: size,
    totalElements,
    data,
  };
}

export const getFeed = async (
  page: number,
  size: number,
): Promise<PageResponse<Post> | undefined> => {
  try {
    return await apiGet<PageResponse<Post>>('/api/posts/feed', { page, size });
  } catch {
    return paginate(localPosts, page, size);
  }
};

export const getUserPosts = async (
  userId: string,
  page: number,
  size: number,
): Promise<PageResponse<Post> | undefined> => {
  try {
    return await apiGet<PageResponse<Post>>(`/api/posts/user/${userId}/page`, {
      page,
      size,
    });
  } catch {
    const userPosts = localPosts.filter(p => p.owner.id === userId);
    return paginate(userPosts, page, size);
  }
};

export const getPost = async (postId: string): Promise<Post | undefined> => {
  try {
    return await apiGet<Post>(`/api/posts/${postId}`);
  } catch {
    return localPosts.find(p => p.id === postId);
  }
};

export const createPost = async (
  input: CreatePostInput,
): Promise<Post | undefined> => {
  try {
    const formData = new FormData();
    if (input.textContent) formData.append('textContent', input.textContent);
    input.media.forEach(asset => {
      formData.append('mediaFiles', {
        uri: asset.uri,
        type: asset.mimeType,
        name: asset.fileName,
      } as unknown as Blob);
    });
    const created = await apiPostMultipart<Post>('/api/posts', formData);
    if (created) {
      localPosts = [created, ...localPosts];
      return created;
    }
  } catch {
    // Backend offline — proceed to fallback mock creation below
  }

  const newPost: Post = {
    id: `post-local-${Date.now()}`,
    owner: {
      id: CURRENT_USER_ID,
      username: 'me',
      fullName: 'You',
      avatarUrl: CURRENT_USER_AVATAR,
    },
    textContent: input.textContent ?? '',
    mediaUrl: input.media.map(m => m.uri),
    commentCount: 0,
    reactionCount: 0,
    currentReaction: null,
    createdAt: new Date().toISOString(),
  };
  localPosts = [newPost, ...localPosts];
  return newPost;
};

export const updatePost = async (
  postId: string,
  textContent: string,
): Promise<Post | undefined> => {
  try {
    const updated = await apiPut<Post>(
      `/api/posts/${postId}?textContent=${encodeURIComponent(textContent)}`,
    );
    if (updated) {
      localPosts = localPosts.map(p => (p.id === postId ? updated : p));
      return updated;
    }
  } catch {
    // Backend offline fallback
  }

  let localUpdated: Post | undefined;
  localPosts = localPosts.map(p => {
    if (p.id === postId) {
      localUpdated = { ...p, textContent };
      return localUpdated;
    }
    return p;
  });
  return localUpdated;
};

export const deletePostRequest = async (postId: string): Promise<void> => {
  try {
    await apiDelete<void>(`/api/posts/${postId}`);
  } catch {
    // Backend offline fallback
  }
  localPosts = localPosts.filter(p => p.id !== postId);
};

export const reactToPost = async (
  postId: string,
  type: ReactionType,
): Promise<ReactionType | null> => {
  try {
    const res = await apiPost<ReactionType | null>(
      `/api/posts/${postId}/reactions`,
      undefined,
      { type },
    );
    return res ?? null;
  } catch {
    // Backend offline fallback
    let nextReaction: ReactionType | null = null;
    localPosts = localPosts.map(p => {
      if (p.id === postId) {
        const had = p.currentReaction !== null;
        if (p.currentReaction === type) {
          nextReaction = null;
        } else {
          nextReaction = type;
        }
        const has = nextReaction !== null;
        const delta = (has ? 1 : 0) - (had ? 1 : 0);
        return {
          ...p,
          currentReaction: nextReaction,
          reactionCount: Math.max(0, p.reactionCount + delta),
        };
      }
      return p;
    });
    return nextReaction;
  }
};

export const getComments = async (
  postId: string,
  page: number,
  size: number,
): Promise<PageResponse<Comment> | undefined> => {
  try {
    return await apiGet<PageResponse<Comment>>(`/api/posts/${postId}/comments`, {
      page,
      size,
    });
  } catch {
    const list = localComments[postId] ?? [];
    return paginate(list, page, size);
  }
};

export const addComment = async (
  postId: string,
  content: string,
): Promise<Comment | undefined> => {
  try {
    const res = await apiPost<Comment>(`/api/posts/${postId}/comments`, { content });
    if (res) return res;
  } catch {
    // Backend offline fallback
  }

  const newComment: Comment = {
    id: `comment-local-${Date.now()}`,
    postId,
    owner: {
      id: CURRENT_USER_ID,
      username: 'me',
      fullName: 'You',
      avatarUrl: CURRENT_USER_AVATAR,
    },
    content,
    createdAt: new Date().toISOString(),
  };
  if (!localComments[postId]) localComments[postId] = [];
  localComments[postId] = [newComment, ...localComments[postId]];
  localPosts = localPosts.map(p =>
    p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p,
  );
  return newComment;
};

