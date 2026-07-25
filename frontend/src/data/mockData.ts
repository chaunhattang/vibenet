import { CURRENT_USER_AVATAR, CURRENT_USER_ID } from '../constants';
import {
  ChatMessageData,
  ChatRoomData,
  CommentData,
  Drifter,
  FriendStatus,
  NotificationData,
  OnlineUser,
  PostData,
  ProfileDetails,
} from '../types';

// Toàn bộ file này là data giả — sau này có be thì xoá file, thay bằng:
// getOnlineUsers() -> mockOnlineUsers, getFeedPosts() -> mockPosts, getCommentsByPostId() -> mockComments
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

export const mockPosts: PostData[] = [
  {
    id: 'p1',
    author: 'Minh Anh',
    handle: '@minhanh',
    avatar: mockOnlineUsers.find(u => u.id === 'u1')!.avatar,
    content: 'Cà phê sáng nay ngon xuất sắc, ai muốn qua uống cùng không?',
    type: 'thought',
    likes: 12,
    comments: 3,
    timestamp: '5M AGO',
    timeLeft: '00H 45M REMAINING',
    isNew: true,
    ownerId: 'u1',
  },
  {
    id: 'p2',
    author: 'Duy Khang',
    handle: '@duykhang',
    avatar: mockOnlineUsers.find(u => u.id === 'u2')!.avatar,
    content: 'Hoàng hôn hôm nay ở ban công, đẹp không chịu nổi.',
    media: 'https://picsum.photos/seed/fade1/800/600',
    mediaType: 'image',
    type: 'moment',
    likes: 34,
    comments: 8,
    timestamp: '20M AGO',
    timeLeft: '02H 10M REMAINING',
    ownerId: 'u2',
  },
  {
    id: 'p3',
    author: 'Linh Vu',
    handle: '@linhvu',
    avatar: mockOnlineUsers.find(u => u.id === 'u3')!.avatar,
    content:
      'Deadline dí sát rồi mà vẫn chưa xong slide, cầu nguyện giúp mình.',
    type: 'thought',
    likes: 7,
    comments: 5,
    timestamp: '1 HOURS AGO',
    ownerId: 'u3',
  },
  {
    id: 'p4',
    author: 'Bao Tran',
    handle: '@baotran',
    avatar: mockOnlineUsers.find(u => u.id === 'u4')!.avatar,
    content: 'Chill cuối tuần với playlist lofi.',
    media: 'https://picsum.photos/seed/fade2/800/600',
    mediaType: 'image',
    type: 'moment',
    likes: 21,
    comments: 2,
    timestamp: '3 HOURS AGO',
    ownerId: 'u4',
  },
];

// Comment có sẵn cho từng post, key = post.id
export const mockComments: Record<string, CommentData[]> = {
  p1: [
    {
      id: 'c1',
      author: 'Duy Khang',
      userId: 'u2',
      avatar: mockOnlineUsers.find(u => u.id === 'u2')!.avatar,
      content: 'Cho mình xin địa chỉ quán với!',
      timestamp: '3M AGO',
    },
  ],
  p2: [
    {
      id: 'c2',
      author: 'Linh Vu',
      userId: 'u3',
      avatar: mockOnlineUsers.find(u => u.id === 'u3')!.avatar,
      content: 'Đẹp quá trời luôn',
      timestamp: '15M AGO',
    },
    {
      id: 'c3',
      author: 'Gia Han',
      userId: 'u5',
      avatar: mockOnlineUsers.find(u => u.id === 'u5')!.avatar,
      content: 'View này chụp ở đâu vậy bạn',
      timestamp: '10M AGO',
    },
  ],
};

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

// Thông báo giả cho trang Notifications — sau này có be thì bỏ, gọi getNotifications()
export const mockNotifications: NotificationData[] = [
  {
    id: 'n1',
    type: 'like',
    userId: 'u1',
    userName: 'Minh Anh',
    message: 'liked your whisper "Cà phê sáng nay ngon xuất sắc..."',
    timeAgo: '2M AGO',
    avatarUrl: mockOnlineUsers.find(u => u.id === 'u1')!.avatar,
  },
  {
    id: 'n2',
    type: 'reply',
    userId: 'u2',
    userName: 'Duy Khang',
    message: 'replied: "Cho mình xin địa chỉ quán với!"',
    timeAgo: '10M AGO',
    avatarUrl: mockOnlineUsers.find(u => u.id === 'u2')!.avatar,
  },
  {
    id: 'n3',
    type: 'mention',
    userId: 'u3',
    userName: 'Linh Vu',
    message: 'mentioned you in a comment',
    timeAgo: '30M AGO',
    avatarUrl: mockOnlineUsers.find(u => u.id === 'u3')!.avatar,
  },
  {
    id: 'n4',
    type: 'faded',
    userId: 'u4',
    userName: 'Bao Tran',
    message: 'Your whisper faded away after reaching its time limit.',
    timeAgo: '5H AGO',
    avatarUrl: mockOnlineUsers.find(u => u.id === 'u4')!.avatar,
  },
];
