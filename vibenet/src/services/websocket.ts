import { Client, IMessage } from '@stomp/stompjs';
import { WS_URL } from './config';
import { getAccessToken } from './api/client';
import type {
  ChatMessageResponse,
  PostReactionEvent,
  ReelReactionEvent,
  PostCommentEvent,
  ReelCommentEvent,
} from './api/types';

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
const postTopicSubscriptions = new Map<string, { reactions: Set<(e: PostReactionEvent) => void>; comments: Set<(e: PostCommentEvent) => void> }>();
const reelTopicSubscriptions = new Map<string, { reactions: Set<(e: ReelReactionEvent) => void>; comments: Set<(e: ReelCommentEvent) => void> }>();

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

  client.onStompError = (frame) => {
    console.warn('STOMP error:', frame.headers['message'], frame.body);
  };
  client.onWebSocketError = (event) => {
    console.warn('WebSocket error:', event);
  };

  client.onConnect = () => {
    client!.subscribe('/user/queue/messages', (frame: IMessage) => {
      const body = JSON.parse(frame.body) as ChatMessageResponse;
      messageSubscribers.forEach((cb) => cb(body));
    });
    // Re-subscribe to every chat's typing/read topics on (re)connect.
    chatTopicSubscriptions.forEach((entry, chatId) => subscribeChatTopics(chatId, entry));
    postTopicSubscriptions.forEach((entry, postId) => subscribePostTopics(postId, entry));
    reelTopicSubscriptions.forEach((entry, reelId) => subscribeReelTopics(reelId, entry));
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

function subscribePostTopics(
  postId: string,
  entry: { reactions: Set<(e: PostReactionEvent) => void>; comments: Set<(e: PostCommentEvent) => void> }
) {
  const c = ensureClient();
  c.subscribe(`/topic/posts/${postId}/reactions`, (frame: IMessage) => {
    const body = JSON.parse(frame.body) as PostReactionEvent;
    entry.reactions.forEach((cb) => cb(body));
  });
  c.subscribe(`/topic/posts/${postId}/comments`, (frame: IMessage) => {
    const body = JSON.parse(frame.body) as PostCommentEvent;
    entry.comments.forEach((cb) => cb(body));
  });
}

function subscribeReelTopics(
  reelId: string,
  entry: { reactions: Set<(e: ReelReactionEvent) => void>; comments: Set<(e: ReelCommentEvent) => void> }
) {
  const c = ensureClient();
  c.subscribe(`/topic/reels/${reelId}/reactions`, (frame: IMessage) => {
    const body = JSON.parse(frame.body) as ReelReactionEvent;
    entry.reactions.forEach((cb) => cb(body));
  });
  c.subscribe(`/topic/reels/${reelId}/comments`, (frame: IMessage) => {
    const body = JSON.parse(frame.body) as ReelCommentEvent;
    entry.comments.forEach((cb) => cb(body));
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
  if (!c.connected) return;
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
  const c = ensureClient();
  if (!c.connected) return;
  c.publish({ destination: '/app/chat.typing', body: JSON.stringify({ chatId, isTyping }) });
}

export function sendRead(chatId: string, lastMessageId: string) {
  const c = ensureClient();
  if (!c.connected) return;
  c.publish({ destination: '/app/chat.read', body: JSON.stringify({ chatId, lastMessageId }) });
}

function ensurePostTopicSubscribed(postId: string) {
  const c = ensureClient();
  if (postTopicSubscriptions.has(postId)) return;

  const entry = { reactions: new Set<(e: PostReactionEvent) => void>(), comments: new Set<(e: PostCommentEvent) => void>() };
  postTopicSubscriptions.set(postId, entry);

  if (c.connected) subscribePostTopics(postId, entry);
  // otherwise the shared onConnect handler above will pick it up once connected
}

function ensureReelTopicSubscribed(reelId: string) {
  const c = ensureClient();
  if (reelTopicSubscriptions.has(reelId)) return;

  const entry = { reactions: new Set<(e: ReelReactionEvent) => void>(), comments: new Set<(e: ReelCommentEvent) => void>() };
  reelTopicSubscriptions.set(reelId, entry);

  if (c.connected) subscribeReelTopics(reelId, entry);
  // otherwise the shared onConnect handler above will pick it up once connected
}

export function onPostReaction(postId: string, callback: (e: PostReactionEvent) => void): () => void {
  ensurePostTopicSubscribed(postId);
  const entry = postTopicSubscriptions.get(postId)!;
  entry.reactions.add(callback);
  return () => {
    entry.reactions.delete(callback);
  };
}

export function onPostComment(postId: string, callback: (e: PostCommentEvent) => void): () => void {
  ensurePostTopicSubscribed(postId);
  const entry = postTopicSubscriptions.get(postId)!;
  entry.comments.add(callback);
  return () => {
    entry.comments.delete(callback);
  };
}

export function onReelReaction(reelId: string, callback: (e: ReelReactionEvent) => void): () => void {
  ensureReelTopicSubscribed(reelId);
  const entry = reelTopicSubscriptions.get(reelId)!;
  entry.reactions.add(callback);
  return () => {
    entry.reactions.delete(callback);
  };
}

export function onReelComment(reelId: string, callback: (e: ReelCommentEvent) => void): () => void {
  ensureReelTopicSubscribed(reelId);
  const entry = reelTopicSubscriptions.get(reelId)!;
  entry.comments.add(callback);
  return () => {
    entry.comments.delete(callback);
  };
}
