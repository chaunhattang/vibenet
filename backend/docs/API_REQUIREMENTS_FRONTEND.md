# VibeNet — Backend API Requirements & Missing Endpoints Specification

This document provides the complete, authoritative specification for all **unimplemented backend endpoints and schema requirements** needed by the VibeNet Expo frontend.

---

## 📌 Executive Status Matrix

| Domain | Status in Backend | Action Required |
| :--- | :--- | :--- |
| **Authentication** (`/api/auth/**`) | ✅ Complete (Register, Login, Refresh) | None |
| **Users & Profile** (`/api/users/**`, `/api/profile`) | ✅ Complete (Me, Search, Profile update) | Add Follow/Unfollow endpoints |
| **Posts & Feed** (`/api/posts/**`) | ✅ Complete (CRUD, Reactions, Comments) | Add Saved/Bookmark & Comment Delete |
| **Locket Moments** (`/api/locket/**`) | ✅ Complete (Feed, Blast, React, Close Friends) | None |
| **Direct Chat** (`/api/chat/**`, `/ws`) | ✅ Complete (Rooms, History, STOMP send) | Add typing indicator & read receipts |
| **Notifications** (`/api/notifications/**`) | ✅ Complete (List, Read, Read All) | None |
| **Reels (Short Videos)** (`/api/reels/**`) | ❌ **Unimplemented** | **Implement Dedicated Reels Suite** |
| **Stories (24h Ephemeral)** (`/api/stories/**`) | ❌ **Unimplemented** | **Implement Dedicated Stories Suite** |
| **Explore & Discovery** (`/api/explore/**`) | ❌ **Unimplemented** | **Implement Explore Grid & Tags** |
| **User Follow System** (`/api/users/{id}/follow`) | ❌ **Unimplemented** | **Implement Unilateral Follow/Unfollow** |

---

## 1. 🎬 Dedicated Reels API Suite (`/api/reels`)

### 1.1 Upload Reel
* **Method & Path**: `POST /api/reels`
* **Content-Type**: `multipart/form-data`
* **Security**: `Bearer <JWT>` (Roles: `USER`, `ADMIN`)
* **Request Form Parts**:
  ```http
  videoFile: File (required, .mp4, .mov, .webm, max 500MB)
  thumbnailFile: File (optional, .jpg, .png, .webp)
  caption: string (optional, max 2200 chars)
  audioTitle: string (optional, default: "Original Audio - <Username>")
  tags: string[] (optional, e.g. ["vibenet", "neon", "creative"])
  ```
* **Response**: `ApiResponse<ReelResponse>` (HTTP 201 Created)

### 1.2 Get Recommended Reels Feed (Vertical Snapping Pager)
* **Method & Path**: `GET /api/reels/feed`
* **Query Params**: `?page=0&size=10`
* **Security**: `Bearer <JWT>`
* **Response**: `ApiResponse<PageResponse<ReelResponse>>`

### 1.3 Get Single Reel Details
* **Method & Path**: `GET /api/reels/{reelId}`
* **Security**: `Bearer <JWT>`
* **Response**: `ApiResponse<ReelResponse>`

### 1.4 Get User's Uploaded Reels (Profile Grid)
* **Method & Path**: `GET /api/reels/user/{userId}`
* **Query Params**: `?page=0&size=12`
* **Security**: `Bearer <JWT>`
* **Response**: `ApiResponse<PageResponse<ReelResponse>>`

### 1.5 React / Like a Reel
* **Method & Path**: `POST /api/reels/{reelId}/reactions`
* **Query Params**: `?type=LOVE`
* **Security**: `Bearer <JWT>`
* **Response**: `ApiResponse<ReactionType | null>` (Toggle semantics: sets reaction, or removes if same type)

### 1.6 Reel Comments
* **Get Comments**: `GET /api/reels/{reelId}/comments?page=0&size=20` $\rightarrow$ `ApiResponse<PageResponse<CommentResponse>>`
* **Post Comment**: `POST /api/reels/{reelId}/comments` (Body: `{ "content": "Awesome shot! 🔥" }`) $\rightarrow$ `ApiResponse<CommentResponse>`
* **Delete Comment**: `DELETE /api/reels/{reelId}/comments/{commentId}` $\rightarrow$ `ApiResponse<Void>`

### 1.7 Bookmark / Save Reel
* **Method & Path**: `POST /api/reels/{reelId}/save`
* **Security**: `Bearer <JWT>`
* **Response**: `ApiResponse<{ isSaved: boolean }>`

### 1.8 Increment View Count
* **Method & Path**: `POST /api/reels/{reelId}/view`
* **Security**: `Bearer <JWT>`
* **Response**: `ApiResponse<Void>`

### 1.9 Delete Reel
* **Method & Path**: `DELETE /api/reels/{reelId}`
* **Security**: `Bearer <JWT>` (Must be owner or ADMIN)
* **Response**: `ApiResponse<Void>`

#### 📦 `ReelResponse` DTO Contract
```ts
interface ReelResponse {
  id: string;
  creator: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string;
    isVerified: boolean;
  };
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  caption: string;
  audioTitle: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  tags: string[];
  createdAt: string; // ISO 8601
}
```

---

## 2. ⏳ Ephemeral 24h Stories API Suite (`/api/stories`)

### 2.1 Upload Story Frame
* **Method & Path**: `POST /api/stories`
* **Content-Type**: `multipart/form-data`
* **Security**: `Bearer <JWT>`
* **Request Form Parts**:
  ```http
  mediaFile: File (required, image or video)
  mediaType: "PHOTO" | "VIDEO" (required)
  caption: string (optional, max 500 chars)
  durationSeconds: number (optional, default: 5 for photos, video length for videos)
  ```
* **Response**: `ApiResponse<StoryItemResponse>` (HTTP 201 Created)

### 2.2 Get Stories Feed (Grouped by User)
* **Method & Path**: `GET /api/stories/feed`
* **Security**: `Bearer <JWT>`
* **Response**: `ApiResponse<StoryUserGroupResponse[]>`
* **Logic**: Returns active non-expired stories (<24h old) from following users, sorted with unseen stories first.

### 2.3 Get Specific User's Active Stories
* **Method & Path**: `GET /api/stories/user/{userId}`
* **Security**: `Bearer <JWT>`
* **Response**: `ApiResponse<StoryItemResponse[]>`

### 2.4 Mark Story Frame as Viewed
* **Method & Path**: `POST /api/stories/{storyId}/view`
* **Security**: `Bearer <JWT>`
* **Response**: `ApiResponse<Void>`

### 2.5 Delete Story Frame
* **Method & Path**: `DELETE /api/stories/{storyId}`
* **Security**: `Bearer <JWT>` (Must be owner)
* **Response**: `ApiResponse<Void>`

#### 📦 Story DTO Contracts
```ts
interface StoryUserGroupResponse {
  userId: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  hasUnseenStories: boolean;
  stories: StoryItemResponse[];
}

interface StoryItemResponse {
  id: string;
  mediaUrl: string;
  mediaType: "PHOTO" | "VIDEO";
  caption?: string;
  durationSeconds: number;
  createdAt: string;
  expiresAt: string;
  isViewed: boolean;
  viewersCount?: number;
}
```

---

## 3. 🔖 Post Bookmarks & Comment Enhancements (`/api/posts`)

### 3.1 Bookmark / Save Post
* **Method & Path**: `POST /api/posts/{postId}/save`
* **Security**: `Bearer <JWT>`
* **Response**: `ApiResponse<{ isSaved: boolean }>`

### 3.2 Get User's Saved Posts (Profile "Saved" Tab)
* **Method & Path**: `GET /api/posts/saved`
* **Query Params**: `?page=0&size=20`
* **Security**: `Bearer <JWT>`
* **Response**: `ApiResponse<PageResponse<PostResponse>>`

### 3.3 Delete Post Comment
* **Method & Path**: `DELETE /api/posts/{postId}/comments/{commentId}`
* **Security**: `Bearer <JWT>` (Comment owner, Post owner, or ADMIN)
* **Response**: `ApiResponse<Void>`

### 3.4 Like / React to a Comment
* **Method & Path**: `POST /api/posts/comments/{commentId}/reactions`
* **Query Params**: `?type=LOVE`
* **Security**: `Bearer <JWT>`
* **Response**: `ApiResponse<{ likesCount: number; isLiked: boolean }>`

---

## 4. 👥 Unilateral Follow System (`/api/users/{id}/follow`)

Unlike the bilateral `/api/friends` handshake, public social creator profiles require unilateral following:

### 4.1 Follow User
* **Method & Path**: `POST /api/users/{userId}/follow`
* **Security**: `Bearer <JWT>`
* **Response**: `ApiResponse<{ isFollowing: boolean; followersCount: number }>`

### 4.2 Unfollow User
* **Method & Path**: `DELETE /api/users/{userId}/follow`
* **Security**: `Bearer <JWT>`
* **Response**: `ApiResponse<{ isFollowing: boolean; followersCount: number }>`

### 4.3 Get User Followers / Following
* **Get Followers**: `GET /api/users/{userId}/followers?page=0&size=20` $\rightarrow$ `ApiResponse<PageResponse<UserResponse>>`
* **Get Following**: `GET /api/users/{userId}/following?page=0&size=20` $\rightarrow$ `ApiResponse<PageResponse<UserResponse>>`

---

## 5. 🧭 Explore & Discovery Feed (`/api/explore`)

### 5.1 Explore Grid (Photos & Reels Discovery)
* **Method & Path**: `GET /api/explore/grid`
* **Query Params**: `?category=all|photography|architecture|nature|art&page=0&size=30`
* **Security**: `Bearer <JWT>`
* **Response**: `ApiResponse<PageResponse<ExploreItemResponse>>`

#### 📦 `ExploreItemResponse` DTO Contract
```ts
interface ExploreItemResponse {
  id: string;
  type: "POST" | "REEL";
  mediaUrl: string;
  thumbnailUrl: string;
  likesCount: number;
  commentsCount: number;
  author: {
    id: string;
    username: string;
    avatarUrl: string;
  };
}
```

---

## 6. 💬 WebSocket Real-Time Enhancements (STOMP)

In addition to `/app/chat.send`, implement the following channels:

### 6.1 Typing Indicator
* **Destination**: `/app/chat.typing`
* **Payload**: `{ "chatId": "<uuid>", "isTyping": true }`
* **Broadcast**: Pushed to `/topic/chat/{chatId}/typing`

### 6.2 Message Read Receipts
* **Destination**: `/app/chat.read`
* **Payload**: `{ "chatId": "<uuid>", "lastMessageId": "<uuid>" }`
* **Broadcast**: Pushed to `/topic/chat/{chatId}/read`

---

## 7. 🗄️ Proposed Spring Boot JPA Schema Additions

```sql
-- 1. Dedicated Reels Table
CREATE TABLE reels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_url VARCHAR(1024) NOT NULL,
    thumbnail_url VARCHAR(1024),
    duration_seconds INT DEFAULT 0,
    caption TEXT,
    audio_title VARCHAR(255) DEFAULT 'Original Audio',
    views_count BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Stories Table (24h Ephemeral)
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_url VARCHAR(1024) NOT NULL,
    media_type VARCHAR(16) NOT NULL CHECK (media_type IN ('PHOTO', 'VIDEO')),
    caption VARCHAR(500),
    duration_seconds INT DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
);

-- 3. Post & Reel Bookmarks / Saves
CREATE TABLE post_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    reel_id UUID REFERENCES reels(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id),
    UNIQUE(user_id, reel_id)
);

-- 4. User Follows (Unilateral)
CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id)
);
```
