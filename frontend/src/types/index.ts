export type OnlineUser = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  isOnline: boolean;
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

// Khớp trực tiếp NotificationResponse của backend (/api/notifications).
// Lưu ý: JSON key là "read" (không phải "isRead").
export type NotificationKind =
  | 'FRIEND_REQUEST'
  | 'FRIEND_ACCEPTED'
  | 'REACTION'
  | 'COMMENT'
  | 'MOMENT_REPLY'
  | 'LOCKET_MOMENT_RECEIVED'
  | 'LOCKET_REACTION';

export type AppNotification = {
  id: string;
  actorId: string;
  actorName: string;
  actorAvatar: string;
  type: NotificationKind;
  relatedEntityId: string;
  read: boolean;
  createdAt: string;
};

// Locket feature — moment ảnh/video ephemeral, tách biệt hẳn với Post thường (/api/posts).
export type CloseFriend = {
  userId: string;
  userName: string;
  fullName: string;
  avatarUrl: string;
  addedAt: string;
};

export type MomentMediaType = 'PHOTO' | 'VIDEO';

// Khớp trực tiếp với LatestMomentResponse / MomentFeedItemResponse của backend — không
// cần lớp map riêng vì field trùng tên.
export type LocketMoment = {
  momentId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string;
  mediaUrl: string;
  mediaType: MomentMediaType;
  caption: string | null;
  createdAt: string;
};

export type MomentFeedItem = LocketMoment & {
  viewedAt: string | null;
  myReaction: string | null;
};

export type MomentReaction = {
  emoji: string;
  reactedAt: string;
};

export type MomentViewer = {
  userId: string;
  userName: string;
  avatarUrl: string;
  viewedAt: string;
};

// Backend leaves omitted-recipientIds semantics undefined — modeled explicitly here.
// Only 'CLOSE_FRIENDS' (omit recipientIds) and 'SPECIFIC' (explicit subset) are exposed
// in the UI today; 'ALL_FRIENDS' is reserved until there's a real all-friends picker.
export type RecipientScope = 'CLOSE_FRIENDS' | 'ALL_FRIENDS' | 'SPECIFIC';

export type CreateMomentInput = {
  assetUri: string;
  assetType: MomentMediaType;
  assetMimeType: string;
  assetFileName: string;
  durationSeconds?: number;
  caption?: string;
  scope: RecipientScope;
  recipientIds?: string[]; // only when scope === 'SPECIFIC'
  replyToMomentId?: string;
};

export type MomentCreation = {
  momentId: string;
  mediaUrl: string;
  mediaType: MomentMediaType;
  durationSeconds: number | null;
  caption: string | null;
  replyToMomentId: string | null;
  createdAt: string;
  recipientCount: number;
};

export type SentMoment = {
  momentId: string;
  mediaUrl: string;
  mediaType: MomentMediaType;
  caption: string | null;
  createdAt: string;
  recipientCount: number;
  viewedCount: number;
};

export type MomentViewers = {
  viewedCount: number;
  totalRecipients: number;
  viewers: MomentViewer[];
};

// --- Backend response shapes (dùng bởi lớp src/api/*, tách khỏi type "cho UI" ở trên) ---

export type PageResponse<T> = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  data: T[];
};

export type ProfileResponse = {
  id: string;
  fullName: string;
  bio: string;
  phoneNumber: string;
  gender: Gender;
  dateOfBirth: string;
  avatarUrl: string;
  coverImageUrl: string;
};

export type UserResponse = {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'GUEST';
  status: 'ACTIVE' | 'BANNED' | 'INACTIVE' | 'LOCKED' | 'DELETED';
  lastActiveAt: string;
  profileResponse: ProfileResponse | null;
};

// --- Posts / Comments / Reactions (khớp trực tiếp backend /api/posts*) -------------
// Post "thật" (Instagram-style), wired vào /api/posts.

export type ReactionType = 'LOVE' | 'FIRE';

export type PostOwner = {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
};

export type Post = {
  id: string;
  owner: PostOwner;
  textContent: string;
  mediaUrl: string[]; // 0..n media — card render carousel khi > 1
  commentCount: number;
  reactionCount: number;
  currentReaction: ReactionType | null; // reaction của chính mình, nếu có
  createdAt: string;
};

export type Comment = {
  id: string;
  postId: string;
  owner: PostOwner;
  content: string;
  createdAt: string;
};

export type CreatePostInput = {
  textContent?: string;
  media: { uri: string; mimeType: string; fileName: string }[]; // từ image-picker asset
};
