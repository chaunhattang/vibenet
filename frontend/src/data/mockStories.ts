export type StoryItem = {
  id: string;
  name: string;
  /** local require() or { uri: string } */
  avatarSource: { uri: string } | number;
  isLive: boolean;
  hasStory: boolean;
};

export const MOCK_STORIES: StoryItem[] = [
  {
    id: 'mine',
    name: 'My Story',
    avatarSource: require('../assets/memoji/15.png'),
    isLive: false,
    hasStory: false,
  },
  {
    id: 'elena',
    name: 'elena_r',
    avatarSource: { uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80' },
    isLive: true,
    hasStory: true,
  },
  {
    id: 'marcus',
    name: 'marcus_v',
    avatarSource: { uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
    isLive: false,
    hasStory: true,
  },
  {
    id: 'chloe',
    name: 'chloe_d',
    avatarSource: require('../assets/memoji/6.png'),
    isLive: false,
    hasStory: true,
  },
  {
    id: 'david',
    name: 'david_k',
    avatarSource: require('../assets/memoji/14.png'),
    isLive: false,
    hasStory: false,
  },
  {
    id: 'maya',
    name: 'maya_w',
    avatarSource: require('../assets/memoji/22.png'),
    isLive: false,
    hasStory: true,
  },
];
