// Mock stories — sau này có be thì thay bằng GET /api/stories/feed (mỗi user 1 nhóm frame,
// TTL 24h). Frame content ở đây là ảnh Unsplash; "My Story" bắt đầu rỗng (chưa đăng).

export type StoryFrame = {
  id: string;
  /** ảnh/video của 1 khung story */
  uri: string;
  createdAt: string; // ISO — dùng để hiện "3h" và tính TTL 24h sau này
};

export type StoryItem = {
  id: string;
  name: string;
  /** local require() or { uri: string } */
  avatarSource: { uri: string } | number;
  isLive: boolean;
  hasStory: boolean;
  frames: StoryFrame[];
};

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

export const MOCK_STORIES: StoryItem[] = [
  {
    id: 'mine',
    name: 'My Story',
    avatarSource: require('../assets/memoji/15.png'),
    isLive: false,
    hasStory: false,
    frames: [],
  },
  {
    id: 'elena',
    name: 'elena_r',
    avatarSource: { uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80' },
    isLive: true,
    hasStory: true,
    frames: [
      { id: 'elena-1', uri: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80', createdAt: hoursAgo(2) },
      { id: 'elena-2', uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80', createdAt: hoursAgo(1) },
    ],
  },
  {
    id: 'marcus',
    name: 'marcus_v',
    avatarSource: { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
    isLive: false,
    hasStory: true,
    frames: [
      { id: 'marcus-1', uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80', createdAt: hoursAgo(5) },
    ],
  },
  {
    id: 'chloe',
    name: 'chloe_d',
    avatarSource: require('../assets/memoji/6.png'),
    isLive: false,
    hasStory: true,
    frames: [
      { id: 'chloe-1', uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80', createdAt: hoursAgo(8) },
      { id: 'chloe-2', uri: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80', createdAt: hoursAgo(7) },
      { id: 'chloe-3', uri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', createdAt: hoursAgo(6) },
    ],
  },
  {
    id: 'david',
    name: 'david_k',
    avatarSource: require('../assets/memoji/14.png'),
    isLive: false,
    hasStory: false,
    frames: [],
  },
  {
    id: 'maya',
    name: 'maya_w',
    avatarSource: require('../assets/memoji/22.png'),
    isLive: false,
    hasStory: true,
    frames: [
      { id: 'maya-1', uri: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80', createdAt: hoursAgo(11) },
    ],
  },
];
