export type MediaFeedPost = {
  id: string;
  media: string; // image URI
  author: {
    name: string;
    handle: string;
    avatarUri: string;
    verified: boolean;
  };
  caption: string;
  hashtags: string[];
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
};

export const MOCK_MEDIA_FEED: MediaFeedPost[] = [
  {
    id: 'mf-1',
    media: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80',
    author: {
      name: 'Elena Rostova',
      handle: '@elena_design',
      avatarUri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      verified: true,
    },
    caption: 'Capturing the golden hour glow over brutalist architecture. Pure bliss! ✨',
    hashtags: ['#Modernism', '#Architecture'],
    stats: { likes: 1245, comments: 173, shares: 229 },
  },
  {
    id: 'mf-2',
    media: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    author: {
      name: 'Marcus Vance',
      handle: '@marcus_v',
      avatarUri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      verified: false,
    },
    caption: 'Mist creeping through the valley mornings. Unplugged for the weekend 🌲',
    hashtags: [],
    stats: { likes: 3890, comments: 412, shares: 580 },
  },
];
