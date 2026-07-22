import { createContext, ReactNode, useContext, useState } from 'react';
import { CURRENT_USER_ID } from '../constants';
import { mockChatMessages, mockChatRooms } from '../data/mockData';
import { ChatMessageData, ChatRoomData } from '../types';

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
};

const ChatContext = createContext<ChatContextValue | null>(null);

// Giữ rooms/messages ở đây (thay vì trong từng screen) để MessagesListScreen và
// ChatDetailScreen luôn đồng bộ dữ liệu khi điều hướng qua lại giữa 2 màn.
export function ChatProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<ChatRoomData[]>(() => sortRooms(mockChatRooms));
  const [messagesByChat, setMessagesByChat] =
    useState<Record<string, ChatMessageData[]>>(mockChatMessages);

  const getMessages = (chatId: string) => messagesByChat[chatId] ?? [];

  const sendMessage = (chatId: string, content: string) => {
    const timestamp = new Date().toISOString();
    const newMessage: ChatMessageData = {
      id: `msg-${Date.now()}`,
      chatId,
      senderId: CURRENT_USER_ID,
      senderName: 'You',
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

  return (
    <ChatContext.Provider value={{ rooms, getMessages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within a ChatProvider');
  return ctx;
}
