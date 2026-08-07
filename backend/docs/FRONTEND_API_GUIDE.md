# VibeNet Backend — Frontend API Guide

This is the reference for building the frontend against the VibeNet Spring Boot backend. It covers auth, every REST endpoint (with request/response shapes), the WebSocket chat channel, error handling, enums, and file/media conventions.

Live interactive docs (once the backend is running): **`/swagger`** (Springdoc/OpenAPI UI).

---

## 1. Base setup

- **Base URL**: no context path is set, so all REST endpoints are rooted at the server's base URL (e.g. `http://localhost:8080`) — there is no `/api` prefix beyond what's shown per-endpoint below (endpoints already include `/api/...`).
- **CORS**: allowed origins are configurable via the `CORS_ALLOWED_ORIGINS` env var (comma-separated), defaulting to `http://localhost:3000`. Credentials are allowed; methods `GET/POST/PUT/DELETE/OPTIONS`. If the frontend runs on a different origin/port (staging, prod), set `CORS_ALLOWED_ORIGINS` accordingly — don't hardcode around it in the frontend.
- **Content type**: JSON endpoints use `application/json`. Endpoints that accept files use `multipart/form-data` (noted per-endpoint below).
- **Static/media files**: uploaded media is served from `/uploads/**` (mapped to the `FILE_UPLOAD_DIR` folder on disk), and is publicly accessible without auth.

## 2. Authentication

All endpoints require a JWT **except**: `/api/auth/**`, `/uploads/**`, `/ws/**`, and Swagger/OpenAPI paths.

### Flow
1. `POST /api/auth/register` → creates an account.
2. `POST /api/auth/login` → returns `accessToken` + `refreshToken`.
3. Send the access token on every subsequent request:
   ```
   Authorization: Bearer <accessToken>
   ```
4. When the access token expires (default: `JWT_EXPIRATION_IN_MS`, 86400000 ms = 24h), call `POST /api/auth/refresh` with the current `refreshToken` to get a new `accessToken` + `refreshToken` pair without re-prompting for credentials. The refresh token itself is rotated on every use (the old one stops working), so always persist the latest one from the response. Refresh tokens expire 24h after issuance (server-side `tokenExpireTime`); once that lapses, `refresh` fails (`code` = `AuthErrorCode.REFRESH_TOKEN_INVALID`, HTTP 401) and the user must log in again.

### Roles
- `USER`, `ADMIN`, `GUEST` (`Role` enum). Most endpoints require `USER` or `ADMIN`. A few are `ADMIN`-only (noted below).

---

## 3. Common response envelope

Every REST endpoint returns this wrapper (`ApiResponse<T>`):

```ts
interface ApiResponse<T> {
  code: number;      // 200 on success; domain-specific error code otherwise
  message?: string;  // present on errors, and on some success responses (e.g. "Post deleted")
  result?: T;         // the payload; omitted (not just null) when absent, since Jackson NON_NULL is set
}
```

Paginated endpoints wrap their list in `PageResponse<T>` as the `result`:

```ts
interface PageResponse<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  data: T[];
}
```
Pagination params are always `?page=0&size=20` query params (0-indexed), defaulting to page 0, size 20.

### Errors

On failure the HTTP status + body still follow the `ApiResponse` shape, but `result` is absent:

```json
{ "code": 1001, "message": "Invalid username or password" }
```

- `AppException` (expected domain errors, e.g. not-found, validation, access-denied) → status code and `code` come from a per-domain error enum (`AuthErrorCode`, `UserErrorCode`, `PostErrorCode`, `FriendshipErrorCode`, `CommentErrorCode`, `ReactionErrorCode`, `ProfileErrorCode`, `LocketErrorCode`, `DeviceErrorCode`, `SystemErrorCode`). Each domain has its own numeric code range; treat `code` as opaque and branch on it if you need fine-grained error UI, otherwise just show `message`.
- `@Valid` request-body validation failures (blank/too-short fields, etc.) → HTTP 400, `code` = `SystemErrorCode.VALIDATION_ERROR` (3), `message` is `"<field>: <constraint message>"` for the first violation.
- Any other unhandled `RuntimeException` (including bad enum query params, e.g. `?type=NOTREAL`) → HTTP 400, `code` = `SystemErrorCode.UNCATEGORIZED_EXCEPTION`.
- Missing/invalid/expired JWT on a protected route → HTTP 401, `code` = `AuthErrorCode.UNAUTHENTICATED` (1). Authenticated-but-forbidden (role/ownership check failing, e.g. `@PreAuthorize`) → HTTP 403, `code` = `SystemErrorCode.ACCESS_DENIED` (2). Both are the same `ApiResponse` envelope as every other error — nothing bypasses it.

---

## 4. Endpoints

### 4.1 Auth — `/api/auth` (public, no JWT required)

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/auth/register` | `RegisterRequest` | `RegisterRequest` (echoed back with `password` nulled out), message "Account created" |
| POST | `/api/auth/login` | `LoginRequest` | `TokenResponse` |
| POST | `/api/auth/refresh` | `RefreshTokenRequest` | `TokenResponse` |

```ts
interface RegisterRequest      { username: string; email: string; password: string; }
interface LoginRequest         { username: string; password: string; }
interface RefreshTokenRequest  { refreshToken: string; }
interface TokenResponse        { accessToken: string; refreshToken: string; }
```

### 4.2 Users — `/api/users` (auth required)

| Method | Path | Params/Body | Returns | Notes |
|---|---|---|---|---|
| GET | `/api/users` | – | `UserResponse[]` | all users |
| GET | `/api/users/{id}` | – | `UserResponse` | |
| GET | `/api/users/search` | `?username=` | `UserResponse[]` | substring/username search |
| GET | `/api/users/{userId}/visitors` | `?page&size` | `PageResponse<VisitorResponse>` | 403 if `userId` isn't your own id — you can only view your own visitor list |
| GET | `/api/users/online` | – | `UserResponse[]` | |
| POST | `/api/users/heartbeat` | – | `Void` | call periodically to keep "online" status fresh |
| PUT | `/api/users/change-password` | `ChangePasswordRequest` | `Void` | |
| DELETE | `/api/users/me` | – | `Void` | soft-delete: sets `status = DELETED`, blocking future logins. Any access token already issued keeps working until it naturally expires (there's no server-side token revocation) — the frontend should discard its stored token immediately on self-delete rather than relying on the server to reject it. |
| DELETE | `/api/users/{id}` | – | `Void` | **ADMIN only** |

```ts
interface UserResponse {
  id: string; username: string; email: string;
  role: "ADMIN" | "USER" | "GUEST";
  status: "ACTIVE" | "BANNED" | "INACTIVE" | "LOCKED" | "DELETED";
  lastActiveAt: string; // ISO datetime
  profileResponse: ProfileResponse | null;
}
interface ProfileResponse {
  id: string; fullName: string; bio: string; phoneNumber: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: string; // ISO date
  avatarUrl: string; coverImageUrl: string;
}
interface VisitorResponse { userId: string; userName: string; avatarUrl: string; visitedAt: string; }
interface ChangePasswordRequest { currentPassword: string; newPassword: string; /* min 8 chars */ }
```

### 4.3 Profile — `/api/profile` (auth required, multipart)

| Method | Path | Body (multipart form fields) | Returns |
|---|---|---|---|
| POST | `/api/profile` | `bio, avatar(file), coverImage(file), fullName, phoneNumber, gender, dateOfBirth` | `ProfileResponse` |
| PUT | `/api/profile` | same fields | `ProfileResponse` |

All fields are optional per-request (send only what's changing) — `PUT` merges onto the existing profile rather than replacing it. `avatar`/`coverImage` are file parts; if the uploaded avatar fails to process, the profile silently falls back to a gender-based default avatar (`/uploads/avatars/default-{female-,male-,}avatar.png`) rather than erroring, so don't assume the returned `avatarUrl` is always the file you just uploaded.

### 4.4 Friends — `/api/friends` (auth required)

| Method | Path | Returns | Notes |
|---|---|---|---|
| POST | `/api/friends/{receiverId}/request` | `Void` | send friend request |
| PUT | `/api/friends/{requestId}/accept` | `Void` | |
| PUT | `/api/friends/{requestId}/decline` | `Void` | |
| DELETE | `/api/friends/{targetUserId}` | `Void` | unfriend |
| GET | `/api/friends/{userId}` | `UserResponse[]` | that user's friends list |
| GET | `/api/friends/requests/incoming` | `FriendRequestResponse[]` | pending requests sent to me |
| GET | `/api/friends/{targetUserId}/status` | `{ status: string }` | one of `"SELF" \| "NONE" \| "FRIENDS" \| "PENDING_SENT" \| "PENDING_RECEIVED"` — **not** the raw `FriendStatus` enum. `PENDING_SENT` means you sent the request; `PENDING_RECEIVED` means they did (use `/api/friends/requests/incoming` to act on it). |

```ts
interface FriendRequestResponse {
  requestId: string; requesterId: string; fullName: string; username: string;
  avatarUrl: string; createdAt: string;
}
```

### 4.5 Posts — `/api/posts` (auth required)

| Method | Path | Body/Params | Returns |
|---|---|---|---|
| POST | `/api/posts` (multipart) | `textContent, mediaFiles[]` | `PostResponse` |
| PUT | `/api/posts/{postId}` | `?textContent=` (query param) | `PostResponse` |
| DELETE | `/api/posts/{postId}` | – | `Void` |
| GET | `/api/posts/{postId}` | – | `PostResponse` |
| GET | `/api/posts/user/{userId}` | – | `PostResponse[]` (all, unpaginated) |
| GET | `/api/posts/user/{userId}/page` | `?page&size` | `PageResponse<PostResponse>` |
| GET | `/api/posts/feed` | `?page&size` | `PageResponse<PostResponse>` |

```ts
interface PostResponse {
  id: string; owner: PostOwnerResponse; textContent: string; mediaUrl: string[];
  commentCount: number; reactionCount: number;
  currentReaction: "LOVE" | "FIRE" | null; // the caller's own reaction, if any
  createdAt: string;
}
interface PostOwnerResponse { id: string; username: string; fullName: string; avatarUrl: string; }
```

### 4.6 Comments — `/api/posts/{postId}/comments` (auth required)

| Method | Path | Body/Params | Returns |
|---|---|---|---|
| POST | `/api/posts/{postId}/comments` | `CommentRequest` | `CommentResponse` |
| GET | `/api/posts/{postId}/comments` | `?page&size` | `PageResponse<CommentResponse>` |

```ts
interface CommentRequest { content: string; } // required, non-blank
interface CommentResponse {
  id: string; postId: string; owner: PostOwnerResponse; content: string; createdAt: string;
}
```

### 4.7 Reactions — `/api/posts/{postId}/reactions` (auth required)

| Method | Path | Params | Returns |
|---|---|---|---|
| POST | `/api/posts/{postId}/reactions` | `?type=LOVE\|FIRE` | `ReactionType \| null` |

Semantics: if you have no reaction on the post, this sets it to `type`. If your existing reaction already equals `type`, it's removed (`result` is `null`/absent). If your existing reaction is a *different* type, it's switched to `type`. Use the returned value to sync local UI state instead of guessing — no need to refetch the post.

### 4.8 Notifications — `/api/notifications` (auth required)

| Method | Path | Params | Returns |
|---|---|---|---|
| GET | `/api/notifications` | `?page&size` | `PageResponse<NotificationResponse>` |
| GET | `/api/notifications/unread-count` | – | `{ unreadCount: number }` |
| PUT | `/api/notifications/{notificationId}/read` | – | `Void` |
| PUT | `/api/notifications/read-all` | – | `Void` |

```ts
interface NotificationResponse {
  id: string; actorId: string; actorName: string; actorAvatar: string;
  type: "FRIEND_REQUEST" | "FRIEND_ACCEPTED" | "REACTION" | "COMMENT"
      | "MOMENT_REPLY" | "LOCKET_MOMENT_RECEIVED" | "LOCKET_REACTION";
  relatedEntityId: string; read: boolean; createdAt: string; // note: JSON key is "read", not "isRead"
}
```

### 4.9 Devices (push notifications) — `/api/devices` (auth required)

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/devices/register` | `DeviceRegisterRequest` | `DeviceRegisterResponse` |
| DELETE | `/api/devices/{pushToken}` | – | `Void` |

```ts
interface DeviceRegisterRequest { platform: "IOS" | "ANDROID" | "WEB"; pushToken: string; }
interface DeviceRegisterResponse { deviceId: string; widgetToken: string; registeredAt: string; }
```
`widgetToken` is used for the Locket-style widget auth path (see 4.11's `getLatest` note) — an alternate to the normal JWT for that one endpoint.

### 4.10 Chat (REST) — `/api/chat` (auth required)

| Method | Path | Params | Returns |
|---|---|---|---|
| GET | `/api/chat/rooms` | – | `ChatRoomResponse[]` |
| GET | `/api/chat/rooms/{chatId}/messages` | `?page&size` | `PageResponse<ChatMessageResponse>` |
| GET | `/api/chat/{friendId}/room` | – | `string` (the `chatId`) — gets or creates the 1:1 room with `friendId` |

```ts
interface ChatRoomResponse {
  chatId: string; friendId: string; friendName: string; friendAvatar: string;
  lastMessage: string; lastMessageTime: string; friendLastActiveAt: string;
}
interface ChatMessageResponse {
  id: string; chatId: string; senderId: string; senderName: string; senderAvatar: string;
  recipientId: string; content: string; timestamp: string;
}
```

### 4.11 Locket-style moments — `/api/locket/moments` (auth required)

| Method | Path | Body/Params | Returns |
|---|---|---|---|
| POST | `/api/locket/moments` (multipart) | `media(file), caption?, recipientIds?(uuid[]), replyToMomentId?` | `MomentCreationResponse` |
| GET | `/api/locket/moments/latest` | – | `LatestMomentResponse` | accepts JWT **or** `X-Widget-Token` header (see below) |
| GET | `/api/locket/moments/feed` | `?page&size` | `PageResponse<MomentFeedItemResponse>` |
| GET | `/api/locket/moments/sent` | `?page&size` | `PageResponse<SentMomentResponse>` |
| GET | `/api/locket/moments/unread-count` | – | `{ unreadCount: number }` |
| POST | `/api/locket/moments/{momentId}/view` | – | `Void` |
| GET | `/api/locket/moments/{momentId}/viewers` | – | `MomentViewersResponse` |
| POST | `/api/locket/moments/{momentId}/react` | `MomentReactionRequest` | `MomentReactionResponse` — **upsert, not a toggle**: always sets/overwrites your reaction on the moment to the given `emoji`. There is no endpoint to remove a moment reaction. |

> **Widget auth**: `GET /api/locket/moments/latest` is the one endpoint that also accepts an `X-Widget-Token` header (issued via device registration, §4.9) instead of a normal `Authorization: Bearer` JWT — meant for a home-screen-widget-style client that isn't logged in through the full app session.

```ts
interface MomentCreationResponse {
  momentId: string; mediaUrl: string; mediaType: "PHOTO" | "VIDEO";
  durationSeconds: number | null; caption: string | null; replyToMomentId: string | null;
  createdAt: string; recipientCount: number;
}
interface LatestMomentResponse {
  momentId: string; senderId: string; senderName: string; senderAvatarUrl: string;
  mediaUrl: string; mediaType: "PHOTO" | "VIDEO"; caption: string; createdAt: string;
}
interface MomentFeedItemResponse extends LatestMomentResponse {
  viewedAt: string | null; myReaction: string | null;
}
interface SentMomentResponse {
  momentId: string; mediaUrl: string; mediaType: "PHOTO" | "VIDEO"; caption: string;
  createdAt: string; recipientCount: number; viewedCount: number;
}
interface MomentViewersResponse {
  viewedCount: number; totalRecipients: number; viewers: MomentViewerResponse[];
}
interface MomentViewerResponse { userId: string; userName: string; avatarUrl: string; viewedAt: string; }
interface MomentReactionRequest { emoji: string; } // required, non-blank
interface MomentReactionResponse { emoji: string; reactedAt: string; }
```

### 4.12 Locket close friends — `/api/locket/close-friends` (auth required)

| Method | Path | Returns |
|---|---|---|
| GET | `/api/locket/close-friends` | `CloseFriendsListResponse` |
| POST | `/api/locket/close-friends/{friendId}` | `AddCloseFriendResponse` |
| DELETE | `/api/locket/close-friends/{friendId}` | `Void` |

```ts
interface CloseFriendResponse { userId: string; userName: string; fullName: string; avatarUrl: string; addedAt: string; }
interface CloseFriendsListResponse { closeFriends: CloseFriendResponse[]; count: number; limit: number; }
interface AddCloseFriendResponse { friendId: string; addedAt: string; }
```

---

## 5. Real-time chat (WebSocket / STOMP)

- **Endpoint**: `ws(s)://<host>/ws` (SockJS-wrapped STOMP, allowed from any origin).
- **Auth on connect**: send the JWT as a STOMP `CONNECT` header, either:
  - `Authorization: Bearer <accessToken>`, or
  - `token: <accessToken>`
  A missing/invalid token rejects the CONNECT frame.
- **Send a message**: `SEND` to `/app/chat.send` with body:
  ```json
  { "recipientId": "<uuid>", "content": "hello" }
  ```
- **Receive messages**: `SUBSCRIBE` to your personal queue `/user/queue/messages`. Both sender and recipient get the saved `ChatMessageResponse` pushed there (the server sends to `/user/{id}/queue/messages` for each side, which Spring's user-destination mechanism resolves to your specific session).
- Broker prefixes: app destinations `/app`, broker destinations `/topic` and `/queue`, user-destination prefix `/user` (only `/user/queue/messages` is currently used by chat).
- Verified end-to-end with a raw STOMP client: connect → subscribe → another user sends → message arrives with a populated `timestamp`.

This is a live, incremental channel — use the REST `/api/chat/rooms` and `/api/chat/rooms/{chatId}/messages` endpoints (§4.10) to load history/room list, then this socket for new messages.

---

## 6. File uploads & media URLs

- Multipart endpoints (`/api/profile`, `/api/posts`, `/api/locket/moments`) take file parts directly in the form — no separate "upload" endpoint or pre-signed URL step.
- Max file/request size: 500MB (server config).
- Returned media URLs (`avatarUrl`, `mediaUrl`, etc.) are paths under `/uploads/**`, served statically and publicly (no auth needed to fetch them) — resolve them against the API base URL to get a full image/video URL.

---

## 7. Enums reference

```ts
type Role = "ADMIN" | "USER" | "GUEST";
type Status = "ACTIVE" | "BANNED" | "INACTIVE" | "LOCKED" | "DELETED";
type Gender = "MALE" | "FEMALE" | "OTHER";
type ReactionType = "LOVE" | "FIRE";
type FriendStatus = "ACCEPTED" | "PENDING" | "BLOCKED" | "DECLINED";
type MediaType = "PHOTO" | "VIDEO";
type Platform = "IOS" | "ANDROID" | "WEB";
type NotificationType =
  | "FRIEND_REQUEST" | "FRIEND_ACCEPTED" | "REACTION" | "COMMENT"
  | "MOMENT_REPLY" | "LOCKET_MOMENT_RECEIVED" | "LOCKET_REACTION";
```

