import { apiClient, unwrap } from './client';
import type { PageResponse, PostResponse } from './types';

export function getFeed(page = 0, size = 20) {
  return unwrap<PageResponse<PostResponse>>(apiClient.get('/api/posts/feed', { params: { page, size } }));
}

export function getPost(postId: string) {
  return unwrap<PostResponse>(apiClient.get(`/api/posts/${postId}`));
}

export function getPostsByUser(userId: string, page = 0, size = 20) {
  return unwrap<PageResponse<PostResponse>>(apiClient.get(`/api/posts/user/${userId}/page`, { params: { page, size } }));
}

export function createPost(form: FormData) {
  return unwrap<PostResponse>(apiClient.post('/api/posts', form));
}

export function updatePost(postId: string, textContent: string) {
  return unwrap<PostResponse>(apiClient.put(`/api/posts/${postId}`, null, { params: { textContent } }));
}

export function deletePost(postId: string) {
  return unwrap<void>(apiClient.delete(`/api/posts/${postId}`));
}

export function toggleSavePost(postId: string) {
  return unwrap<{ isSaved: boolean }>(apiClient.post(`/api/posts/${postId}/save`));
}

export function getSavedPosts(page = 0, size = 20) {
  return unwrap<PageResponse<PostResponse>>(apiClient.get('/api/posts/saved', { params: { page, size } }));
}

export function getLikedPosts(page = 0, size = 20) {
  return unwrap<PageResponse<PostResponse>>(apiClient.get('/api/posts/liked', { params: { page, size } }));
}

export async function sharePost(postId: string) {
  const res = await unwrap<{ sharesCount: number }>(apiClient.post(`/api/posts/${postId}/share`));
  return res.sharesCount;
}
