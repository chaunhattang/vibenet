import { apiClient, unwrap } from './client';
import type { ChatMessageResponse, ChatRoomResponse, PageResponse } from './types';

export function getChatRooms() {
  return unwrap<ChatRoomResponse[]>(apiClient.get('/api/chat/rooms'));
}

export function getChatMessages(chatId: string, page = 0, size = 30) {
  return unwrap<PageResponse<ChatMessageResponse>>(apiClient.get(`/api/chat/rooms/${chatId}/messages`, { params: { page, size } }));
}

export function getOrCreateRoomWithFriend(friendId: string) {
  return unwrap<string>(apiClient.get(`/api/chat/${friendId}/room`));
}
