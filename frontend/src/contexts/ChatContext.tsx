import { createContext, ReactNode, useContext, useState } from 'react';
import { CURRENT_USER_ID } from '../constants';
import { mockChatMessages, mockChatRooms } from '../data/mockData';
import { ChatMessageData, ChatRoomData, OnlineUser } from '../types';
import { useAuth } from './AuthContext';

function sortRooms(rooms: ChatRoomData[]): ChatRoomData[] {
  return [...rooms].sort((a, b) => {
    if (!a.lastMessageTime && !b.lastMessageTime) return 0;
    if (!a.lastMessageTime) return 1;
    if (!b.lastMessageTime) return -1;
    return (
      new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    );
  });
}

type ChatContextValue = {
  rooms: ChatRoomData[];
  getMessages: (chatId: string) => ChatMessageData[];
  sendMessage: (chatId: string, content: string) => void;
  // Trả về chatId của phòng chat với friend này — tạo phòng mới nếu chưa từng nhắn
  getOrCreateRoomByFriend: (friend: OnlineUser) => string;
};

const ChatContext = createContext<ChatContextValue | null>(null);

// Giữ rooms/messages ở đây (thay vì trong từng screen) để MessagesListScreen và
// ChatDetailScreen luôn đồng bộ dữ liệu khi điều hướng qua lại giữa 2 màn.
export function ChatProvider({ children }: { children: ReactNode }) {
  const { currentUserId, currentUser } = useAuth();
  const [rooms, setRooms] = useState<ChatRoomData[]>(() => sortRooms(mockChatRooms));
  const [messagesByChat, setMessagesByChat] =
    useState<Record<string, ChatMessageData[]>>(mockChatMessages);

  const getMessages = (chatId: string) => messagesByChat[chatId] ?? [];

  const sendMessage = (chatId: string, content: string) => {
    const timestamp = new Date().toISOString();
    const newMessage: ChatMessageData = {
      id: `msg-${Date.now()}`,
      chatId,
      senderId: currentUserId ?? CURRENT_USER_ID,
      senderName: currentUser?.fullName ?? 'You',
      content,
      timestamp,
    };

    setMessagesByChat(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] ?? []), newMessage],
    }));

    setRooms(prev =>
      sortRooms(
        prev.map(room =>
          room.chatId === chatId
            ? { ...room, lastMessage: content, lastMessageTime: timestamp }
            : room,
        ),
      ),
    );
  };

  const getOrCreateRoomByFriend = (friend: OnlineUser) => {
    const existing = rooms.find(r => r.friendId === friend.id);
    if (existing) return existing.chatId;

    const chatId = `chat-${friend.id}`;
    const newRoom: ChatRoomData = {
      chatId,
      friendId: friend.id,
      friendName: friend.name,
      friendAvatar: friend.avatar,
      friendIsOnline: friend.isOnline,
      lastMessage: null,
      lastMessageTime: null,
    };
    setRooms(prev => sortRooms([...prev, newRoom]));
    return chatId;
  };

  return (
    <ChatContext.Provider
      value={{ rooms, getMessages, sendMessage, getOrCreateRoomByFriend }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within a ChatProvider');
  return ctx;
}
