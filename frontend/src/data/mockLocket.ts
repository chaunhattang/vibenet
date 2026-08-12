// Mock Locket data — used as a fallback when the real backend isn't running (LocketContext
// falls back to this on request failure). Sau này có be thì xoá file, các API call thật
// trong contexts/LocketContext.tsx đã sẵn sàng, không cần đổi gì khác.
import { CloseFriend, MomentFeedItem, SentMoment } from '../types';

const photo = (photoId: string) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=800&q=80`;

const avatar = (seed: string) => `https://i.pravatar.cc/150?u=${seed}`;

const minutesAgo = (mins: number) => new Date(Date.now() - mins * 60_000).toISOString();

export const MOCK_CLOSE_FRIENDS: CloseFriend[] = [
  { userId: 'lk-u1', userName: 'minhanh', fullName: 'Minh Anh', avatarUrl: avatar('minhanh'), addedAt: minutesAgo(60 * 24 * 30) },
  { userId: 'lk-u2', userName: 'duykhang', fullName: 'Duy Khang', avatarUrl: avatar('duykhang'), addedAt: minutesAgo(60 * 24 * 20) },
  { userId: 'lk-u3', userName: 'linhvu', fullName: 'Linh Vu', avatarUrl: avatar('linhvu'), addedAt: minutesAgo(60 * 24 * 10) },
  { userId: 'lk-u4', userName: 'baotran', fullName: 'Bao Tran', avatarUrl: avatar('baotran'), addedAt: minutesAgo(60 * 24 * 5) },
  { userId: 'lk-u5', userName: 'giahan', fullName: 'Gia Han', avatarUrl: avatar('giahan'), addedAt: minutesAgo(60 * 24 * 2) },
];

export const MOCK_MOMENT_FEED: MomentFeedItem[] = [
  {
    momentId: 'lk-m1',
    senderId: 'lk-u1',
    senderName: 'Minh Anh',
    senderAvatarUrl: avatar('minhanh'),
    mediaUrl: photo('1517841905240-472988babdf9'),
    mediaType: 'PHOTO',
    caption: 'Coffee before the chaos ☕️',
    createdAt: minutesAgo(4),
    viewedAt: null,
    myReaction: null,
  },
  {
    momentId: 'lk-m2',
    senderId: 'lk-u2',
    senderName: 'Duy Khang',
    senderAvatarUrl: avatar('duykhang'),
    mediaUrl: photo('1508182314998-e2e04d75d6d1'),
    mediaType: 'PHOTO',
    caption: null,
    createdAt: minutesAgo(37),
    viewedAt: null,
    myReaction: null,
  },
  {
    momentId: 'lk-m3',
    senderId: 'lk-u3',
    senderName: 'Linh Vu',
    senderAvatarUrl: avatar('linhvu'),
    mediaUrl: photo('1499244571948-7ccddb3583f1'),
    mediaType: 'PHOTO',
    caption: 'Golden hour hit different today 🌅',
    createdAt: minutesAgo(95),
    viewedAt: minutesAgo(80),
    myReaction: '🔥',
  },
  {
    momentId: 'lk-m4',
    senderId: 'lk-u4',
    senderName: 'Bao Tran',
    senderAvatarUrl: avatar('baotran'),
    mediaUrl: photo('1470252649378-9c29740c9fa8'),
    mediaType: 'PHOTO',
    caption: 'Study grind, send help',
    createdAt: minutesAgo(190),
    viewedAt: minutesAgo(150),
    myReaction: null,
  },
  {
    momentId: 'lk-m5',
    senderId: 'lk-u5',
    senderName: 'Gia Han',
    senderAvatarUrl: avatar('giahan'),
    mediaUrl: photo('1441057206919-63d19fac2369'),
    mediaType: 'PHOTO',
    caption: 'New plant baby 🌱',
    createdAt: minutesAgo(320),
    viewedAt: minutesAgo(300),
    myReaction: '❤️',
  },
];

export const MOCK_SENT_MOMENTS: SentMoment[] = [
  {
    momentId: 'lk-s1',
    mediaUrl: photo('1523419409543-a5e549c1faa8'),
    mediaType: 'PHOTO',
    caption: 'Sunset walk 🚶',
    createdAt: minutesAgo(50),
    recipientCount: 5,
    viewedCount: 3,
  },
  {
    momentId: 'lk-s2',
    mediaUrl: photo('1495474472287-4d71bcdd2085'),
    mediaType: 'PHOTO',
    caption: null,
    createdAt: minutesAgo(60 * 6),
    recipientCount: 5,
    viewedCount: 5,
  },
];

export const MOCK_UNREAD_COUNT = MOCK_MOMENT_FEED.filter(m => m.viewedAt === null).length;
