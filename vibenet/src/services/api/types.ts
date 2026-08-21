// Mirrors backend DTOs in vibe.net.backend.models.dtos.*
// Keep field names/casing identical to the Java response classes (Jackson default serialization).

export interface ApiResponse<T> {
  code: number;
  message?: string;
  result: T;
}

export interface PageResponse<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  data: T[];
}

export type ReactionType = 'LOVE' | 'FIRE';
export type MediaType = 'PHOTO' | 'VIDEO';
export type Role = 'USER' | 'ADMIN';
export type Status = 'ACTIVE' | 'BANNED' | 'DELETED';

export interface ProfileResponse {
  id: string;
  fullName: string | null;
  bio: string | null;
  phoneNumber: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: Role;
  status: Status;
  lastActiveAt: string | null;
  profileResponse: ProfileResponse | null;
}

export interface PostOwnerResponse {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface PostResponse {
  id: string;
  owner: PostOwnerResponse;
  textContent: string | null;
  location: string | null;
  textGradient: string[];
  mediaUrl: string[];
  commentCount: number;
  reactionCount: number;
  sharesCount: number;
  currentReaction: ReactionType | null;
  saved: boolean;
  createdAt: string;
}

export interface CommentResponse {
  id: string;
  postId: string;
  parentCommentId: string | null;
  owner: PostOwnerResponse;
  content: string;
  likesCount: number;
  liked: boolean;
  createdAt: string;
}

export interface ReelResponse {
  id: string;
  creator: PostOwnerResponse;
  videoUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number;
  caption: string | null;
  audioTitle: string | null;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  liked: boolean;
  saved: boolean;
  tags: string[];
  createdAt: string;
}

export interface PostReactionEvent {
  postId: string;
  reactionCount: number;
  actorUserId: string;
  actorReaction: ReactionType | null;
}

export interface PostCommentEvent {
  postId: string;
  commentCount: number;
  comment: CommentResponse;
}

export interface StoryItemResponse {
  id: string;
  mediaUrl: string;
  mediaType: MediaType;
  caption: string | null;
  durationSeconds: number;
  createdAt: string;
  expiresAt: string;
  isViewed: boolean;
  viewersCount: number;
}

export interface StoryUserGroupResponse {
  userId: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  hasUnseenStories: boolean;
  stories: StoryItemResponse[];
}

export interface ExploreAuthorResponse {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface ExploreItemResponse {
  id: string;
  type: 'POST' | 'REEL';
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  textContent: string | null;
  textGradient: string[] | null;
  likesCount: number;
  commentsCount: number;
  author: ExploreAuthorResponse;
  createdAt: string;
}

export interface FriendRequestResponse {
  requestId: string;
  requesterId: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export type NotificationType =
  | 'FRIEND_REQUEST'
  | 'FRIEND_ACCEPTED'
  | 'REACTION'
  | 'COMMENT'
  | 'MOMENT_REPLY'
  | 'LOCKET_MOMENT_RECEIVED'
  | 'LOCKET_REACTION'
  | 'FOLLOW';

export interface NotificationResponse {
  id: string;
  actorId: string;
  actorName: string | null;
  actorAvatar: string | null;
  type: NotificationType;
  relatedEntityId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationEvent {
  notificationId: string;
  recipientId: string;
  actorId: string;
  type: NotificationType;
  relatedEntityId: string | null;
  createdAt: string;
}

export interface ChatRoomResponse {
  chatId: string;
  friendId: string;
  friendName: string;
  friendAvatar: string | null;
  lastMessage: string | null;
  lastMessageTime: string | null;
  friendLastActiveAt: string | null;
}

export interface ChatMessageResponse {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  recipientId: string;
  content: string;
  timestamp: string;
  isRead?: boolean;
  readAt?: string | null;
}

export interface MomentCreationResponse {
  id: string;
  mediaUrl: string;
  mediaType: MediaType;
  caption: string | null;
  createdAt: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}
