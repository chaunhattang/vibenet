import { CURRENT_USER_AVATAR, CURRENT_USER_ID } from '../constants';
import {
  ChatMessageData,
  ChatRoomData,
  Comment,
  Drifter,
  FriendStatus,
  OnlineUser,
  Post,
  PostOwner,
  ProfileDetails,
} from '../types';

// Toàn bộ file này là data giả — sau này có be thì xoá file, thay bằng:
// getOnlineUsers() -> mockOnlineUsers (posts/comments giờ đã dùng API thật /api/posts)
export const mockOnlineUsers: OnlineUser[] = [
  {
    id: 'u1',
    name: 'Minh Anh',
    handle: 'minhanh',
    avatar:
      'https://tse1.mm.bing.net/th/id/OIP.2a-O0-W06eTvDLlgqW5_rwHaHa?r=0&pid=Api&h=220&P=0',
    isOnline: true,
  },
  {
    id: 'u2',
    name: 'Duy Khang',
    handle: 'duykhang',
    avatar:
      'https://tse2.mm.bing.net/th/id/OIP.GzggTND5SbALtKQgF-ZdwwHaHv?r=0&pid=Api&h=220&P=0',
    isOnline: true,
  },
  {
    id: 'u3',
    name: 'Linh Vu',
    handle: 'linhvu',
    avatar:
      'https://tse3.mm.bing.net/th/id/OIP.cBjasYgWAcwsWwQmzoOjawHaHa?r=0&pid=Api&h=220&P=0',
    isOnline: true,
  },
  {
    id: 'u4',
    name: 'Bao Tran',
    handle: 'baotran',
    avatar:
      'https://tse1.mm.bing.net/th/id/OIP.7VaY8F8AVQ7HoemWEO3_CgHaHa?r=0&pid=Api&h=220&P=0',
    isOnline: false,
  },
  {
    id: 'u5',
    name: 'Gia Han',
    handle: 'giahan',
    avatar:
      'https://tse1.mm.bing.net/th/id/OIP.2a-O0-W06eTvDLlgqW5_rwHaHa?r=0&pid=Api&h=220&P=0',
    isOnline: true,
  },
];

export const mockChatRooms: ChatRoomData[] = [
  {
    chatId: 'chat-u1',
    friendId: 'u1',
    friendName: 'Minh Anh',
    friendAvatar: mockOnlineUsers.find(u => u.id === 'u1')!.avatar,
    friendIsOnline: mockOnlineUsers.find(u => u.id === 'u1')!.isOnline,
    lastMessage: 'Hẹn 8h sáng mai nhé!',
    lastMessageTime: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    chatId: 'chat-u2',
    friendId: 'u2',
    friendName: 'Duy Khang',
    friendAvatar: mockOnlineUsers.find(u => u.id === 'u2')!.avatar,
    friendIsOnline: mockOnlineUsers.find(u => u.id === 'u2')!.isOnline,
    lastMessage: 'Ok để mình gửi ảnh sau',
    lastMessageTime: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    chatId: 'chat-u3',
    friendId: 'u3',
    friendName: 'Linh Vu',
    friendAvatar: mockOnlineUsers.find(u => u.id === 'u3')!.avatar,
    friendIsOnline: mockOnlineUsers.find(u => u.id === 'u3')!.isOnline,
    lastMessage: null,
    lastMessageTime: null,
  },
  {
    chatId: 'chat-u4',
    friendId: 'u4',
    friendName: 'Bao Tran',
    friendAvatar: mockOnlineUsers.find(u => u.id === 'u4')!.avatar,
    friendIsOnline: mockOnlineUsers.find(u => u.id === 'u4')!.isOnline,
    lastMessage: 'Playlist đỉnh thật sự',
    lastMessageTime: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
];

export const mockChatMessages: Record<string, ChatMessageData[]> = {
  'chat-u1': [
    {
      id: 'm1',
      chatId: 'chat-u1',
      senderId: 'u1',
      senderName: 'Minh Anh',
      senderAvatar: mockOnlineUsers.find(u => u.id === 'u1')!.avatar,
      content: 'Sáng mai đi cà phê không?',
      timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
    },
    {
      id: 'm2',
      chatId: 'chat-u1',
      senderId: CURRENT_USER_ID,
      senderName: 'You',
      content: 'Đi chứ, mấy giờ?',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      id: 'm3',
      chatId: 'chat-u1',
      senderId: 'u1',
      senderName: 'Minh Anh',
      senderAvatar: mockOnlineUsers.find(u => u.id === 'u1')!.avatar,
      content: 'Hẹn 8h sáng mai nhé!',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    },
  ],
  'chat-u2': [
    {
      id: 'm4',
      chatId: 'chat-u2',
      senderId: CURRENT_USER_ID,
      senderName: 'You',
      content: 'Ảnh hoàng hôn đẹp quá',
      timestamp: new Date(Date.now() - 50 * 60000).toISOString(),
    },
    {
      id: 'm5',
      chatId: 'chat-u2',
      senderId: 'u2',
      senderName: 'Duy Khang',
      senderAvatar: mockOnlineUsers.find(u => u.id === 'u2')!.avatar,
      content: 'Ok để mình gửi ảnh sau',
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    },
  ],
  'chat-u4': [
    {
      id: 'm6',
      chatId: 'chat-u4',
      senderId: 'u4',
      senderName: 'Bao Tran',
      senderAvatar: mockOnlineUsers.find(u => u.id === 'u4')!.avatar,
      content: 'Nghe playlist chưa?',
      timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
    {
      id: 'm7',
      chatId: 'chat-u4',
      senderId: CURRENT_USER_ID,
      senderName: 'You',
      content: 'Playlist đỉnh thật sự',
      timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
  ],
};

export const mockDrifters: Drifter[] = [
  { id: 'd1', name: 'Nova', avatar: 'https://i.pravatar.cc/150?u=Nova' },
  { id: 'd2', name: 'Kai', avatar: 'https://i.pravatar.cc/150?u=Kai' },
  { id: 'd3', name: 'Raine', avatar: 'https://i.pravatar.cc/150?u=Raine' },
  { id: 'd4', name: 'Zephyr', avatar: 'https://i.pravatar.cc/150?u=Zephyr' },
  { id: 'd5', name: 'Sol', avatar: 'https://i.pravatar.cc/150?u=Sol' },
];

export const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2070&auto=format&fit=crop';

// Chi tiết profile, key = userId ('me' hoặc id trong mockOnlineUsers)
export const mockProfiles: Record<string, ProfileDetails> = {
  [CURRENT_USER_ID]: {
    userId: CURRENT_USER_ID,
    fullName: 'You',
    handle: 'me',
    bio: 'Sống chậm, nghĩ nhiều, whisper vừa đủ.',
    avatar: CURRENT_USER_AVATAR,
    coverImage: DEFAULT_COVER,
    phoneNumber: '+84 912 345 678',
    email: 'me@vibenet.app',
    dateOfBirth: '2000-01-01',
    gender: 'OTHER',
  },
  u1: {
    userId: 'u1',
    fullName: 'Minh Anh',
    handle: 'minhanh',
    bio: 'Cà phê mỗi sáng, deadline mỗi tối.',
    avatar: mockOnlineUsers.find(u => u.id === 'u1')!.avatar,
    coverImage: DEFAULT_COVER,
    email: 'minhanh@vibenet.app',
    dateOfBirth: '1999-05-12',
    gender: 'FEMALE',
  },
  u2: {
    userId: 'u2',
    fullName: 'Duy Khang',
    handle: 'duykhang',
    bio: 'Săn hoàng hôn, lưu giữ khoảnh khắc.',
    avatar: mockOnlineUsers.find(u => u.id === 'u2')!.avatar,
    coverImage: DEFAULT_COVER,
    email: 'duykhang@vibenet.app',
    gender: 'MALE',
  },
  u3: {
    userId: 'u3',
    fullName: 'Linh Vu',
    handle: 'linhvu',
    bio: 'Sinh viên năm cuối, đang vật lộn với đồ án.',
    avatar: mockOnlineUsers.find(u => u.id === 'u3')!.avatar,
    coverImage: DEFAULT_COVER,
    dateOfBirth: '2002-09-30',
    gender: 'FEMALE',
  },
  u4: {
    userId: 'u4',
    fullName: 'Bao Tran',
    handle: 'baotran',
    bio: 'Lofi, playlist và cuối tuần chill.',
    avatar: mockOnlineUsers.find(u => u.id === 'u4')!.avatar,
    coverImage: DEFAULT_COVER,
    gender: 'MALE',
  },
  u5: {
    userId: 'u5',
    fullName: 'Gia Han',
    handle: 'giahan',
    bio: 'Yêu nhiếp ảnh và những buổi chiều rảnh rỗi.',
    avatar: mockOnlineUsers.find(u => u.id === 'u5')!.avatar,
    coverImage: DEFAULT_COVER,
    gender: 'FEMALE',
  },
};

// Danh sách bạn bè, key = userId — mock đơn giản: bạn bè của ai đó là những người còn lại
export const mockFriendsByUser: Record<string, OnlineUser[]> = {
  [CURRENT_USER_ID]: mockOnlineUsers,
  u1: mockOnlineUsers.filter(u => u.id !== 'u1'),
  u2: mockOnlineUsers.filter(u => u.id !== 'u2'),
  u3: mockOnlineUsers.filter(u => u.id !== 'u3'),
  u4: mockOnlineUsers.filter(u => u.id !== 'u4'),
  u5: mockOnlineUsers.filter(u => u.id !== 'u5'),
};

// Trạng thái kết bạn của "mình" với từng người — đủ 4 trạng thái để demo UI
export const mockFriendStatusByUser: Record<string, FriendStatus> = {
  u1: 'FRIENDS',
  u2: 'FRIENDS',
  u3: 'PENDING_SENT',
  u4: 'NONE',
  u5: 'PENDING_RECEIVED',
};

export const mockPosts: Post[] = [
  {
    id: 'post-1',
    owner: {
      id: 'u2',
      username: 'duykhang',
      fullName: 'Duy Khang',
      avatarUrl: mockOnlineUsers.find(u => u.id === 'u2')!.avatar,
    },
    textContent:
      'Hoàng hôn chiều nay ở Phú Quốc đẹp ngỡ ngàng 🌅 Vừa săn được góc này siêu chill! #sunset #phuquoc #travel #vibenet',
    mediaUrl: [
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    ],
    commentCount: 4,
    reactionCount: 42,
    currentReaction: 'LOVE',
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
  },
  {
    id: 'post-2',
    owner: {
      id: 'u1',
      username: 'minhanh',
      fullName: 'Minh Anh',
      avatarUrl: mockOnlineUsers.find(u => u.id === 'u1')!.avatar,
    },
    textContent:
      'Góc làm việc nhỏ xinh đón nắng sáng ☕💻 Hôm nay quyết tâm làm xong UI cho Vibenet. Fighting! #workspace #coding #coffee',
    mediaUrl: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    ],
    commentCount: 2,
    reactionCount: 28,
    currentReaction: 'FIRE',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'post-3',
    owner: {
      id: CURRENT_USER_ID,
      username: 'me',
      fullName: 'You',
      avatarUrl: CURRENT_USER_AVATAR,
    },
    textContent:
      'Cuối tuần đi trốn ở Đà Lạt, không khí mát lành dễ chịu cực kỳ 🌿🍃 #dalat #chill #nature',
    mediaUrl: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
    ],
    commentCount: 1,
    reactionCount: 65,
    currentReaction: null,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'post-4',
    owner: {
      id: 'u4',
      username: 'baotran',
      fullName: 'Bao Tran',
      avatarUrl: mockOnlineUsers.find(u => u.id === 'u4')!.avatar,
    },
    textContent:
      'Thêm một bản Lofi mix cho những đêm thức muộn. Ai nghe cùng không? 🎧✨ #lofi #music #vibes',
    mediaUrl: [],
    commentCount: 0,
    reactionCount: 19,
    currentReaction: null,
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: 'post-5',
    owner: {
      id: 'u5',
      username: 'giahan',
      fullName: 'Gia Han',
      avatarUrl: mockOnlineUsers.find(u => u.id === 'u5')!.avatar,
    },
    textContent:
      'Sài Gòn ngày nắng đẹp. Bữa trưa nhẹ nhàng tại quán ruột 🥗🍹 #saigon #foody #lifestyle',
    mediaUrl: [
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80',
    ],
    commentCount: 0,
    reactionCount: 34,
    currentReaction: 'LOVE',
    createdAt: new Date(Date.now() - 14 * 3600000).toISOString(),
  },
  {
    id: 'post-6',
    owner: {
      id: 'u3',
      username: 'linhvu',
      fullName: 'Linh Vu',
      avatarUrl: mockOnlineUsers.find(u => u.id === 'u3')!.avatar,
    },
    textContent:
      'Chuyến đi khám phá phố cổ Hà Nội vừa qua. Mùa thu Hà Nội thật sự rất đặc biệt 🍂🍁 #hanoi #autumn #photography',
    mediaUrl: [
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
    ],
    commentCount: 0,
    reactionCount: 51,
    currentReaction: 'FIRE',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

export const mockComments: Record<string, Comment[]> = {
  'post-1': [
    {
      id: 'c1',
      postId: 'post-1',
      owner: {
        id: 'u1',
        username: 'minhanh',
        fullName: 'Minh Anh',
        avatarUrl: mockOnlineUsers.find(u => u.id === 'u1')!.avatar,
      },
      content: 'Góc chụp đỉnh quá Khang ơi! 🌅',
      createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: 'c2',
      postId: 'post-1',
      owner: {
        id: 'u5',
        username: 'giahan',
        fullName: 'Gia Han',
        avatarUrl: mockOnlineUsers.find(u => u.id === 'u5')!.avatar,
      },
      content: 'Đẹp tuyệt vời luôn ✨ Cho xin location cụ thể đi bạn!',
      createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
    },
    {
      id: 'c3',
      postId: 'post-1',
      owner: {
        id: 'u2',
        username: 'duykhang',
        fullName: 'Duy Khang',
        avatarUrl: mockOnlineUsers.find(u => u.id === 'u2')!.avatar,
      },
      content: '@giahan ở Sunset Sanato nha Han!',
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      id: 'c4',
      postId: 'post-1',
      owner: {
        id: CURRENT_USER_ID,
        username: 'me',
        fullName: 'You',
        avatarUrl: CURRENT_USER_AVATAR,
      },
      content: 'Chất lượng ảnh nét căng luôn!',
      createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    },
  ],
  'post-2': [
    {
      id: 'c5',
      postId: 'post-2',
      owner: {
        id: 'u3',
        username: 'linhvu',
        fullName: 'Linh Vu',
        avatarUrl: mockOnlineUsers.find(u => u.id === 'u3')!.avatar,
      },
      content: 'Góc làm việc xịn xò ghê, cố lên nè! 🔥',
      createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    },
    {
      id: 'c6',
      postId: 'post-2',
      owner: {
        id: 'u4',
        username: 'baotran',
        fullName: 'Bao Tran',
        avatarUrl: mockOnlineUsers.find(u => u.id === 'u4')!.avatar,
      },
      content: 'Nhìn chill ghê, xin list nhạc code với nha haha',
      createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
    },
  ],
  'post-3': [
    {
      id: 'c7',
      postId: 'post-3',
      owner: {
        id: 'u1',
        username: 'minhanh',
        fullName: 'Minh Anh',
        avatarUrl: mockOnlineUsers.find(u => u.id === 'u1')!.avatar,
      },
      content: 'Đà Lạt mùa này đẹp nhất rồi, ghen tị quá!',
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
  ],
};

