import { apiClient, unwrap } from './client';
import type { StoryItemResponse, StoryUserGroupResponse } from './types';

export function getStoriesFeed() {
  return unwrap<StoryUserGroupResponse[]>(apiClient.get('/api/stories/feed'));
}

export function getUserStories(userId: string) {
  return unwrap<StoryItemResponse[]>(apiClient.get(`/api/stories/user/${userId}`));
}

export function uploadStory(form: FormData) {
  return unwrap<StoryItemResponse>(apiClient.post('/api/stories', form));
}

export function markStoryViewed(storyId: string) {
  return unwrap<void>(apiClient.post(`/api/stories/${storyId}/view`));
}

export function deleteStory(storyId: string) {
  return unwrap<void>(apiClient.delete(`/api/stories/${storyId}`));
}
