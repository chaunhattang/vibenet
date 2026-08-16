import { Client, IMessage } from '@stomp/stompjs';
import { WS_URL } from './config';
import { getAccessToken } from './api/client';
import type { ChatMessageResponse } from './api/types';

interface TypingEvent {
  userId: string;
  isTyping: boolean;
}

interface ReadEvent {
  userId: string;
  lastMessageId: string;
}

let client: Client | null = null;
const messageSubscribers = new Set<(msg: ChatMessageResponse) => void>();
const chatTopicSubscriptions = new Map<string, { typing: Set<(e: TypingEvent) => void>; read: Set<(e: ReadEvent) => void> }>();

function ensureClient(): Client {
  if (client) return client;

  client = new Client({
    brokerURL: WS_URL,
    connectHeaders: {},
    reconnectDelay: 3000,
    beforeConnect: () => {
      const token = getAccessToken();
      if (client) {
        client.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      }
    },
  });

  client.onConnect = () => {
    client!.subscribe('/user/queue/messages', (frame: IMessage) => {
      const body = JSON.parse(frame.body) as ChatMessageResponse;
      messageSubscribers.forEach((cb) => cb(body));
    });
    // Re-subscribe to every chat's typing/read topics on (re)connect.
    chatTopicSubscriptions.forEach((entry, chatId) => subscribeChatTopics(chatId, entry));
  };

  return client;
}

function subscribeChatTopics(
  chatId: string,
  entry: { typing: Set<(e: TypingEvent) => void>; read: Set<(e: ReadEvent) => void> }
) {
  const c = ensureClient();
  c.subscribe(`/topic/chat/${chatId}/typing`, (frame: IMessage) => {
    const body = JSON.parse(frame.body) as TypingEvent;
    entry.typing.forEach((cb) => cb(body));
  });
  c.subscribe(`/topic/chat/${chatId}/read`, (frame: IMessage) => {
    const body = JSON.parse(frame.body) as ReadEvent;
    entry.read.forEach((cb) => cb(body));
  });
}

export function connectWebSocket() {
  const c = ensureClient();
  if (!c.active) c.activate();
}

export function disconnectWebSocket() {
  client?.deactivate();
}

export function onChatMessage(callback: (msg: ChatMessageResponse) => void) {
  messageSubscribers.add(callback);
  return () => messageSubscribers.delete(callback);
}

export function sendChatMessage(recipientId: string, content: string) {
  const c = ensureClient();
  c.publish({ destination: '/app/chat.send', body: JSON.stringify({ recipientId, content }) });
}

function ensureChatTopicSubscribed(chatId: string) {
  const c = ensureClient();
  if (chatTopicSubscriptions.has(chatId)) return;

  const entry = { typing: new Set<(e: TypingEvent) => void>(), read: new Set<(e: ReadEvent) => void>() };
  chatTopicSubscriptions.set(chatId, entry);

  if (c.connected) subscribeChatTopics(chatId, entry);
  // otherwise the shared onConnect handler above will pick it up once connected
}

export function onTyping(chatId: string, callback: (e: TypingEvent) => void) {
  ensureChatTopicSubscribed(chatId);
  const entry = chatTopicSubscriptions.get(chatId)!;
  entry.typing.add(callback);
  return () => entry.typing.delete(callback);
}

export function onRead(chatId: string, callback: (e: ReadEvent) => void) {
  ensureChatTopicSubscribed(chatId);
  const entry = chatTopicSubscriptions.get(chatId)!;
  entry.read.add(callback);
  return () => entry.read.delete(callback);
}

export function sendTyping(chatId: string, isTyping: boolean) {
  ensureClient().publish({ destination: '/app/chat.typing', body: JSON.stringify({ chatId, isTyping }) });
}

export function sendRead(chatId: string, lastMessageId: string) {
  ensureClient().publish({ destination: '/app/chat.read', body: JSON.stringify({ chatId, lastMessageId }) });
}
