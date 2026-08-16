export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  coverImageUrl: string;
  bio: string;
  website?: string;
  isVerified?: boolean;
  postsCount: number;
  friendsCount: number;
  momentsCount: number;
  isOnline?: boolean;
  lastActiveAt?: string;
}

export interface StoryFrame {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  durationSeconds: number;
  caption?: string;
  createdAt: string;
}

export interface StoryItem {
  id: string;
  user: UserProfile;
  isMyStory?: boolean;
  isLive?: boolean;
  isCloseFriend?: boolean;
  isViewed: boolean;
  frames: StoryFrame[];
}

export interface PostComment {
  id: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string;
  };
  content: string;
  createdAt: string;
  likesCount: number;
}

export interface PostItem {
  id: string;
  author: UserProfile;
  mediaUrls: string[];
  textContent: string;
  location?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  currentReaction?: 'LOVE' | 'FIRE' | null;
  isSaved: boolean;
  comments: PostComment[];
  tags?: string[];
}

export interface LocketReaction {
  id: string;
  emoji: string;
  user: UserProfile;
  createdAt: string;
}

export interface LocketMomentItem {
  id: string;
  author: UserProfile;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  location?: string;
  createdAt: string;
  timeAgo: string;
  recipientsCount: number;
  recipientGroup: 'All Close Friends' | 'Besties Only' | 'Family';
  reactions: LocketReaction[];
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatRoomItem {
  id: string;
  friend: UserProfile;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isTyping?: boolean;
  messages: ChatMessage[];
}

export interface NotificationItem {
  id: string;
  type: 'FRIEND_REQUEST' | 'FRIEND_ACCEPTED' | 'REACTION' | 'COMMENT' | 'LOCKET_MOMENT' | 'MENTION';
  actor: UserProfile;
  content: string;
  targetMediaUrl?: string;
  createdAt: string;
  timeAgo: string;
  isRead: boolean;
  friendRequestStatus?: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}

// ----------------------------------------------------
// CURATED UNSPLASH MEDIA ASSETS
// ----------------------------------------------------

export const CURRENT_USER: UserProfile = {
  id: 'u-me',
  username: 'alexrivera',
  fullName: 'Alex Rivera',
  email: 'alex.rivera@vibenet.io',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  coverImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  bio: 'Visual designer & shutterbug 📸 Living between Tokyo & San Francisco. Vibing in the future ✨',
  website: 'https://vibenet.design/alex',
  isVerified: true,
  postsCount: 42,
  friendsCount: 384,
  momentsCount: 128,
  isOnline: true,
  lastActiveAt: 'Just now',
};

export const MOCK_USERS: UserProfile[] = [
  CURRENT_USER,
  {
    id: 'u-1',
    username: 'elena_v',
    fullName: 'Elena Vance',
    email: 'elena@vibenet.io',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    bio: 'Golden hour hunter 🌅 Architecture & high fashion.',
    website: 'https://elena.design',
    isVerified: true,
    postsCount: 156,
    friendsCount: 1240,
    momentsCount: 310,
    isOnline: true,
    lastActiveAt: '2m ago',
  },
  {
    id: 'u-2',
    username: 'kai_zen',
    fullName: 'Kai Tanaka',
    email: 'kai@vibenet.io',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=1200&q=80',
    bio: 'Cyberpunk beats, specialty coffee, and street analog film 🎧☕',
    isVerified: false,
    postsCount: 88,
    friendsCount: 520,
    momentsCount: 95,
    isOnline: true,
    lastActiveAt: '5m ago',
  },
  {
    id: 'u-3',
    username: 'chloe.art',
    fullName: 'Chloe Dupont',
    email: 'chloe@vibenet.io',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    bio: 'Sculpting light and ceramic dreams in Paris 🥐🎨',
    isVerified: true,
    postsCount: 204,
    friendsCount: 2300,
    momentsCount: 450,
    isOnline: false,
    lastActiveAt: '1h ago',
  },
  {
    id: 'u-4',
    username: 'marcus_k',
    fullName: 'Marcus Kane',
    email: 'marcus@vibenet.io',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    bio: 'Alpine mountaineer & drone filmmaker 🏔️ Always off the grid.',
    isVerified: false,
    postsCount: 64,
    friendsCount: 410,
    momentsCount: 180,
    isOnline: true,
    lastActiveAt: 'Active now',
  },
  {
    id: 'u-5',
    username: 'maya.s',
    fullName: 'Maya Sharma',
    email: 'maya@vibenet.io',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    bio: 'Product engineer by day, techno DJ by night 🎛️⚡',
    isVerified: true,
    postsCount: 92,
    friendsCount: 890,
    momentsCount: 215,
    isOnline: false,
    lastActiveAt: '4h ago',
  },
];

export const MOCK_STORIES: StoryItem[] = [
  {
    id: 'story-me',
    user: CURRENT_USER,
    isMyStory: true,
    isViewed: false,
    frames: [
      {
        id: 'frame-me-1',
        mediaUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
        mediaType: 'image',
        durationSeconds: 5,
        caption: 'Design sprint late nights ☕⚡',
        createdAt: '2h ago',
      },
    ],
  },
  {
    id: 'story-1',
    user: MOCK_USERS[1], // Elena
    isLive: true,
    isCloseFriend: true,
    isViewed: false,
    frames: [
      {
        id: 'frame-1-1',
        mediaUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        mediaType: 'image',
        durationSeconds: 5,
        caption: 'First light in the valley 🌄',
        createdAt: '30m ago',
      },
      {
        id: 'frame-1-2',
        mediaUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80',
        mediaType: 'image',
        durationSeconds: 5,
        caption: 'Morning brew perfection',
        createdAt: '25m ago',
      },
    ],
  },
  {
    id: 'story-2',
    user: MOCK_USERS[2], // Kai
    isCloseFriend: true,
    isViewed: false,
    frames: [
      {
        id: 'frame-2-1',
        mediaUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
        mediaType: 'image',
        durationSeconds: 5,
        caption: 'Shibuya neon vibes tonight 🏮',
        createdAt: '1h ago',
      },
    ],
  },
  {
    id: 'story-3',
    user: MOCK_USERS[3], // Chloe
    isViewed: false,
    frames: [
      {
        id: 'frame-3-1',
        mediaUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
        mediaType: 'image',
        durationSeconds: 5,
        caption: 'New oil studies in studio 🎨',
        createdAt: '3h ago',
      },
    ],
  },
  {
    id: 'story-4',
    user: MOCK_USERS[4], // Marcus
    isViewed: true,
    frames: [
      {
        id: 'frame-4-1',
        mediaUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
        mediaType: 'image',
        durationSeconds: 5,
        caption: 'Peak reached! 3,800m 🏔️',
        createdAt: '5h ago',
      },
    ],
  },
];

export const MOCK_POSTS: PostItem[] = [
  {
    id: 'post-1',
    author: MOCK_USERS[1], // Elena Vance
    mediaUrls: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1000&q=85',
    ],
    textContent: 'Sunday architectural strolls through modern minimalist spaces. Nothing calms the mind like pure geometric harmony and soft natural diffused light. ✨🏢',
    location: 'Kyoto Museum of Modern Art',
    createdAt: '25m ago',
    likesCount: 1420,
    commentsCount: 38,
    sharesCount: 14,
    isLiked: true,
    currentReaction: 'LOVE',
    isSaved: true,
    tags: ['minimalism', 'architecture', 'japan', 'design'],
    comments: [
      {
        id: 'c-1',
        user: MOCK_USERS[2],
        content: 'That shadow play in the second slide is absolutely unreal!',
        createdAt: '18m ago',
        likesCount: 12,
      },
      {
        id: 'c-2',
        user: MOCK_USERS[3],
        content: 'Adding this to my wishlist for next trip to Kansai ❤️',
        createdAt: '10m ago',
        likesCount: 4,
      },
    ],
  },
  {
    id: 'post-2',
    author: MOCK_USERS[2], // Kai Tanaka
    mediaUrls: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1000&q=85',
    ],
    textContent: 'Late night sessions in Nakameguro. The street reflections on analog 35mm film just hit different after the monsoon rain 🌧️📸',
    location: 'Nakameguro, Tokyo',
    createdAt: '2h ago',
    likesCount: 890,
    commentsCount: 19,
    sharesCount: 9,
    isLiked: false,
    currentReaction: null,
    isSaved: false,
    tags: ['tokyo', 'filmphotography', 'nightwalk', '35mm'],
    comments: [
      {
        id: 'c-3',
        user: CURRENT_USER,
        content: 'Color grading on this is chef kiss 🤌 Which lens?',
        createdAt: '1h ago',
        likesCount: 8,
      },
    ],
  },
  {
    id: 'post-3',
    author: MOCK_USERS[4], // Marcus Kane
    mediaUrls: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=85',
    ],
    textContent: '4:30 AM alpine start was 100% worth it. Sunrise above the sea of clouds in the Swiss Alps. Breathe it in 🏔️☀️',
    location: 'Zermatt, Switzerland',
    createdAt: '6h ago',
    likesCount: 2310,
    commentsCount: 74,
    sharesCount: 42,
    isLiked: true,
    currentReaction: 'FIRE',
    isSaved: false,
    tags: ['alps', 'mountains', 'sunrise', 'adventure'],
    comments: [],
  },
];

export const MOCK_LOCKET_MOMENTS: LocketMomentItem[] = [
  {
    id: 'moment-1',
    author: MOCK_USERS[1], // Elena
    mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
    mediaType: 'image',
    caption: 'Sunset matcha run with the best crew 🍵✨',
    location: 'Roppongi Hills',
    createdAt: '12m ago',
    timeAgo: '12m ago',
    recipientsCount: 5,
    recipientGroup: 'All Close Friends',
    reactions: [
      { id: 'lr-1', emoji: '❤️', user: CURRENT_USER, createdAt: '10m ago' },
      { id: 'lr-2', emoji: '🔥', user: MOCK_USERS[2], createdAt: '8m ago' },
      { id: 'lr-3', emoji: '🥳', user: MOCK_USERS[3], createdAt: '5m ago' },
    ],
  },
  {
    id: 'moment-2',
    author: MOCK_USERS[2], // Kai
    mediaUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1000&q=85',
    mediaType: 'image',
    caption: 'New synth setup arrived! Time to cook some tracks 🎹🔊',
    createdAt: '45m ago',
    timeAgo: '45m ago',
    recipientsCount: 3,
    recipientGroup: 'Besties Only',
    reactions: [
      { id: 'lr-4', emoji: '🔥', user: CURRENT_USER, createdAt: '30m ago' },
    ],
  },
  {
    id: 'moment-3',
    author: MOCK_USERS[3], // Chloe
    mediaUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=85',
    mediaType: 'image',
    caption: 'Parisian rain through my balcony studio window 🌧️🥐',
    location: 'Montmartre, Paris',
    createdAt: '2h ago',
    timeAgo: '2h ago',
    recipientsCount: 5,
    recipientGroup: 'All Close Friends',
    reactions: [
      { id: 'lr-5', emoji: '❤️', user: MOCK_USERS[1], createdAt: '1h ago' },
      { id: 'lr-6', emoji: '👏', user: CURRENT_USER, createdAt: '1h ago' },
    ],
  },
];

export const MOCK_CHATS: ChatRoomItem[] = [
  {
    id: 'chat-1',
    friend: MOCK_USERS[1], // Elena
    lastMessage: 'Let’s check out that art exhibition tomorrow at 3pm!',
    lastMessageTime: '14:32',
    unreadCount: 2,
    isTyping: false,
    messages: [
      {
        id: 'm-1',
        chatId: 'chat-1',
        senderId: 'u-1',
        content: 'Hey Alex! Did you see the new gallery photos I posted?',
        timestamp: '14:28',
        isRead: true,
      },
      {
        id: 'm-2',
        chatId: 'chat-1',
        senderId: 'u-me',
        content: 'Yes! The lighting was incredible. Where was that?',
        timestamp: '14:30',
        isRead: true,
      },
      {
        id: 'm-3',
        chatId: 'chat-1',
        senderId: 'u-1',
        content: 'It’s right near Kyoto station! Let’s check out that art exhibition tomorrow at 3pm!',
        timestamp: '14:32',
        isRead: false,
      },
    ],
  },
  {
    id: 'chat-2',
    friend: MOCK_USERS[2], // Kai
    lastMessage: 'Sent you the audio sample pack. Check your email! 🎧',
    lastMessageTime: '11:15',
    unreadCount: 0,
    isTyping: false,
    messages: [
      {
        id: 'm-4',
        chatId: 'chat-2',
        senderId: 'u-2',
        content: 'Sent you the audio sample pack. Check your email! 🎧',
        timestamp: '11:15',
        isRead: true,
      },
    ],
  },
  {
    id: 'chat-3',
    friend: MOCK_USERS[3], // Chloe
    lastMessage: 'Merci beaucoup! See you in Paris next spring ✨',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    isTyping: false,
    messages: [
      {
        id: 'm-5',
        chatId: 'chat-3',
        senderId: 'u-3',
        content: 'Merci beaucoup! See you in Paris next spring ✨',
        timestamp: 'Yesterday',
        isRead: true,
      },
    ],
  },
  {
    id: 'chat-4',
    friend: MOCK_USERS[4], // Marcus
    lastMessage: 'Got back to basecamp safely. Photos coming soon!',
    lastMessageTime: 'Friday',
    unreadCount: 0,
    isTyping: false,
    messages: [
      {
        id: 'm-6',
        chatId: 'chat-4',
        senderId: 'u-4',
        content: 'Got back to basecamp safely. Photos coming soon!',
        timestamp: 'Friday',
        isRead: true,
      },
    ],
  },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'FRIEND_REQUEST',
    actor: MOCK_USERS[5] || {
      id: 'u-6',
      username: 'sophie.noir',
      fullName: 'Sophie Noir',
      email: 'sophie@vibenet.io',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      coverImageUrl: '',
      bio: '',
      postsCount: 12,
      friendsCount: 45,
      momentsCount: 8,
    },
    content: 'sent you a friend connection request.',
    createdAt: '10m ago',
    timeAgo: '10m ago',
    isRead: false,
    friendRequestStatus: 'PENDING',
  },
  {
    id: 'notif-2',
    type: 'LOCKET_MOMENT',
    actor: MOCK_USERS[1],
    content: 'shared a new Locket moment with Close Friends.',
    targetMediaUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
    createdAt: '25m ago',
    timeAgo: '25m ago',
    isRead: false,
  },
  {
    id: 'notif-3',
    type: 'REACTION',
    actor: MOCK_USERS[2],
    content: 'reacted ❤️ to your photo in Tokyo.',
    targetMediaUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&q=80',
    createdAt: '2h ago',
    timeAgo: '2h ago',
    isRead: true,
  },
  {
    id: 'notif-4',
    type: 'COMMENT',
    actor: MOCK_USERS[3],
    content: 'commented: "That shadow play is absolutely unreal!"',
    targetMediaUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
    createdAt: '4h ago',
    timeAgo: '4h ago',
    isRead: true,
  },
];
