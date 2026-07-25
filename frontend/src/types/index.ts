export type PostData = {
  id: string;
  author: string;
  handle?: string;
  avatar: string;
  content: string;
  media?: string;
  mediaType?: 'image' | 'video' | 'audio';
  type: 'moment' | 'thought';
  likes: number;
  comments: number;
  timestamp: string;
  timeLeft?: string;
  isNew?: boolean;
  // Khớp với post do chính "mình" tạo (dùng để hiện nút Edit/Delete), giống ownerId bên web
  ownerId?: string;
};

export type OnlineUser = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  isOnline: boolean;
};

export type CommentData = {
  id: string;
  author: string;
  // userId của người comment — dùng để bấm avatar nhảy sang profile của họ
  userId: string;
  avatar: string;
  content: string;
  timestamp: string;
  // Có giá trị khi đây là reply — trỏ tới id của comment gốc (chỉ nested 1 cấp)
  parentId?: string;
};

export type ChatRoomData = {
  chatId: string;
  friendId: string;
  friendName: string;
  friendAvatar: string;
  friendIsOnline: boolean;
  lastMessage?: string | null;
  lastMessageTime?: string | null;
};

export type ChatMessageData = {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
};

export type Drifter = {
  id: string;
  name: string;
  avatar: string;
};

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type ProfileDetails = {
  userId: string;
  fullName: string;
  handle: string;
  bio: string;
  avatar: string;
  coverImage: string;
  phoneNumber?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: Gender;
};

export type FriendStatus = 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'FRIENDS';

export type NotificationType = 'like' | 'reply' | 'mention' | 'faded';

export type NotificationData = {
  id: string;
  type: NotificationType;
  // userId của người gây ra thông báo — dùng để bấm avatar nhảy sang profile của họ
  userId?: string;
  userName: string;
  message: string;
  timeAgo: string;
  avatarUrl?: string;
};
