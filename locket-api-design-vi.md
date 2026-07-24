\[BẢN DỊCH TIẾNG VIỆT\]

# Locket Feature --- API Design

Companion doc to
[`locket-and-mobile-implementation-plan.md`](./locket-and-mobile-implementation-plan.md)
(feature spec, DB design, mobile/widget architecture, roadmap). This doc
is the full request/response contract for every new endpoint: Locket
moments, close friends, device registration, and the two "who viewed"
visibility features.

Status: proposed / not yet built --- describes the target contract to
implement against.

**No paid tier.** This project is open source and free for every user
--- there is no `/api/subscriptions/**`, no `GOLD`-gated response shape,
no plan check anywhere below. Every endpoint returns its full result to
every authenticated user. (An earlier draft of this doc had a Gold-gated
split on the viewers/visitors endpoints --- removed per product
direction, see the implementation plan's §11 changelog note.)

## 0. Conventions

### 0.1 Response envelope

Every endpoint returns the existing `ApiResponse<T>` wrapper
(`backend/fade/.../dto/ApiResponse.java`):

``` json
{
  "code": 1000,
  "message": "optional human-readable message",
  "result": { }
}
```

`code: 1000` = success (matches `ApiResponse`'s existing
`@Builder.Default`). Non-1000 codes map to `ErrorCode` entries (§0.4).

### 0.2 Auth

Unless noted otherwise, every endpoint requires
`Authorization: Bearer <jwt>` and
`@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")`, matching every
other authenticated controller in this codebase. The one exception is
`GET /api/locket/moments/latest`, which additionally accepts the
narrow-scope `widget_token` described in §5.

### 0.3 Pagination

Endpoints returning history use the existing `PageResponse<T>` shape
(already used by `ChatService.getMessages`, see
`backend/fade/.../dto/PageResponse.java`):

``` json
{
  "currentPage": 0,
  "totalPages": 4,
  "pageSize": 20,
  "totalElements": 73,
  "data": [ ]
}
```

Query params: `page` (0-indexed, default `0`), `size` (default `20`, max
`50`).

### 0.4 New `ErrorCode` entries

Follow the existing numeric-block convention in `enums/ErrorCode.java`
(each feature area owns a block, e.g. friendships use `3xxx`, chat uses
`6xxx`). Locket claims `7xxx`:

  ------------------------------------------------------------------------------------
  Code              Name                           HTTP status       Message
  ----------------- ------------------------------ ----------------- -----------------
  7001              `LOCKET_MOMENT_NOT_FOUND`      404               Moment does not
                                                                     exist

  7002              `NOT_CLOSE_FRIEND`             400               User is not in
                                                                     your close
                                                                     friends list

  7003              `CLOSE_FRIEND_LIMIT_REACHED`   400               Close friends
                                                                     limit reached

  7004              `NOT_ACCEPTED_FRIEND`          400               Can only add
                                                                     accepted friends
                                                                     as close friends

  7005              `VIDEO_TOO_LONG`               400               Video exceeds 15
                                                                     second limit

  7006              `VIDEO_TOO_LARGE`              400               Media exceeds
                                                                     50MB limit

  7007              `INVALID_MEDIA_TYPE`           400               Unsupported media
                                                                     type

  7008              `NOT_A_RECIPIENT`              403               You are not a
                                                                     recipient of this
                                                                     moment

  7009              `DEVICE_TOKEN_NOT_FOUND`       404               Device token not
                                                                     registered
  ------------------------------------------------------------------------------------

## 1. Close friends

### 1.1 `GET /api/locket/close-friends`

List the caller's close friends.

**Response `result`:**

``` json
{
  "closeFriends": [
    {
      "userId": "b3f1...",
      "userName": "trungho",
      "fullName": "Trung Ho",
      "avatarUrl": "/uploads/avatars/....jpg",
      "addedAt": "2026-07-01T10:00:00"
    }
  ],
  "count": 12,
  "limit": 50
}
```

`limit` is the flat cap (§4.5 of the implementation plan --- same for
every user, no tiers) so the mobile app can render "12 / 50" without a
second call.

### 1.2 `POST /api/locket/close-friends/{friendId}`

Add `friendId` to the caller's close friends.

**Path param:** `friendId` --- UUID of an existing, `ACCEPTED`
`FriendShip` counterpart.

**Responses:** \| Status \| Condition \| \|---\|---\| \| 200 \| Added.
`result: { "friendId": "...", "addedAt": "..." }` \| \| 400
`NOT_ACCEPTED_FRIEND` \| `friendId` is not an accepted friend \| \| 400
`CLOSE_FRIEND_LIMIT_REACHED` \| Caller is already at the flat cap (50,
§4.5) \| \| 409 (mapped to `FRIENDSHIP_EXISTED`-style semantics, reuse
pattern) \| Already a close friend --- idempotent no-op with 200 is also
acceptable; pick one and keep it consistent with how
`FriendShipController` currently handles duplicate requests \|

### 1.3 `DELETE /api/locket/close-friends/{friendId}`

Remove from close friends. `result: null`,
`message: "Removed from close friends"`. Idempotent --- removing a
non-member returns 200, not 404 (matches the general soft-delete pattern
already used elsewhere in this codebase, e.g. `UserService.deleteUser`'s
style of not treating "already in target state" as an error).

## 2. Moments

### 2.1 `POST /api/locket/moments`

Create and send a Moment. **Multipart** request (matches the existing
`FileController.upload` pattern):

  ---------------------------------------------------------------------------------------
  Part                Type                            Required          Notes
  ------------------- ------------------------------- ----------------- -----------------
  `media`             file                            yes               image or video

  `caption`           text                            no                max 280 chars

  `recipientIds`      text\[\] (repeated field or     no                empty/omitted =
                      comma-joined --- pick one and                     send to **all**
                      match whatever                                    close friends
                      `PostController.uploadPost`'s                     
                      existing multipart-array                          
                      convention is)                                    

  `replyToMomentId`   text (UUID)                     no                set only when
                                                                        sent from the
                                                                        widget reply
                                                                        hand-off (§2 step
                                                                        7 of the
                                                                        implementation
                                                                        plan)
  ---------------------------------------------------------------------------------------

**Server-side validation (in order, fail fast):** 1. `media` present and
non-empty (existing `IllegalArgumentException` pattern in `FileService`)
2. Content-type resolves to image or video → else `INVALID_MEDIA_TYPE`
3. Size ≤ 50MB → else `VIDEO_TOO_LARGE` (name kept generic in code but
applies to oversized images too --- consider `MEDIA_TOO_LARGE` naming if
you want it non-video-specific; listed as `VIDEO_TOO_LARGE` here to
match the plan doc's wording, reconcile before implementation) 4. If
video: probe duration via `jcodec` (see implementation plan §4.4) ≤ 15s
→ else `VIDEO_TOO_LONG` 5. Every id in `recipientIds` must be an
existing close friend of the caller → else `NOT_CLOSE_FRIEND` (fail the
whole request rather than partial-send, so the client gets an
unambiguous error instead of silent partial delivery) 6. If
`replyToMomentId` present, it must exist and the caller must be one of
its recipients → else `LOCKET_MOMENT_NOT_FOUND` / `NOT_A_RECIPIENT`

**Response `result`:**

``` json
{
  "momentId": "9f2a...",
  "mediaUrl": "/uploads/media/locket/9f2a....jpg",
  "mediaType": "PHOTO",
  "durationSeconds": null,
  "caption": "at the library again",
  "replyToMomentId": null,
  "createdAt": "2026-07-06T14:22:00",
  "recipientCount": 8
}
```

**Side effects** (fire-and-forget from the caller's perspective, but
documented since they're part of the contract): - One
`locket_moment_recipients` row per recipient - Redis key
`locket:latest:{recipientId}` overwritten for every recipient - One FCM
data message per recipient's registered device tokens - One
`Notification` (`type: LOCKET_MOMENT_RECEIVED`) per recipient

### 2.2 `GET /api/locket/moments/latest`

The endpoint the **widget** polls. Must be fast --- Redis-backed (§4.3
of the implementation plan), no joins on the hot path if avoidable.

**Auth:** normal JWT **or** `widget_token` (§5).

**Response `result`** (or `null` if the caller has never received a
moment):

``` json
{
  "momentId": "9f2a...",
  "senderId": "b3f1...",
  "senderName": "Trung Ho",
  "senderAvatarUrl": "/uploads/avatars/....jpg",
  "mediaUrl": "/uploads/media/locket/9f2a....jpg",
  "mediaType": "PHOTO",
  "caption": "at the library again",
  "createdAt": "2026-07-06T14:22:00"
}
```

Cache-miss fallback: if `locket:latest:{recipientId}` isn't in Redis
(cold cache, e.g. after a Redis restart), fall back to
`locket_moment_recipients` ordered by `delivered_at DESC LIMIT 1` and
repopulate the cache --- never 500 just because the cache is empty.

### 2.3 `GET /api/locket/moments/feed?page=&size=`

Paginated Moments **received** by the caller, newest first. Each item
shape matches §2.2's `result` plus:

``` json
{
  "...": "as above",
  "viewedAt": "2026-07-06T14:25:00",
  "myReaction": "❤️"
}
```

`viewedAt`/`myReaction` are `null` if not yet viewed/reacted.

### 2.4 `GET /api/locket/moments/sent?page=&size=`

Paginated Moments the caller **sent**, newest first. Each item:

``` json
{
  "momentId": "9f2a...",
  "mediaUrl": "...",
  "mediaType": "PHOTO",
  "caption": "...",
  "createdAt": "...",
  "recipientCount": 8,
  "viewedCount": 5
}
```

`viewedCount` is a plain aggregate here; the full identity breakdown
lives in §2.6.

### 2.5 `POST /api/locket/moments/{momentId}/view`

Marks `locket_moment_recipients.viewed_at` for `(momentId, callerId)`.
Idempotent (first call sets it, later calls no-op). 403
`NOT_A_RECIPIENT` if the caller wasn't a recipient. `result: null`.

### 2.6 `GET /api/locket/moments/{momentId}/viewers`

Caller must be the **sender**. This is the "who viewed" feature (§2a of
the implementation plan) --- full identity + timestamp list, available
to every user, no gating.

**Response `result`:**

``` json
{
  "viewedCount": 5,
  "totalRecipients": 8,
  "viewers": [
    { "userId": "...", "userName": "...", "avatarUrl": "...", "viewedAt": "2026-07-06T14:25:00" },
    { "userId": "...", "userName": "...", "avatarUrl": "...", "viewedAt": null }
  ]
}
```

`viewers` includes every recipient, `viewedAt: null` for anyone who
hasn't opened it yet --- lets the mobile app render "5 of 8 viewed" plus
the full breakdown from a single call.

### 2.7 `POST /api/locket/moments/{momentId}/react`

**Body:**

``` json
{ "emoji": "❤️" }
```

Upserts into `locket_reactions` (unique on `(momentId, recipientId)` ---
re-reacting replaces the emoji, doesn't stack). 403 `NOT_A_RECIPIENT` if
not a recipient. Triggers `Notification` (`type: LOCKET_REACTION`) to
the sender. `result: { "emoji": "❤️", "reactedAt": "..." }`.

## 3. Profile visitors

### 3.1 Visit logging (implicit, not a separate endpoint)

Logged as a side effect of the existing `GET /api/users/{id}` ---
decided, no new dedicated profile-view endpoint (implementation plan
§4.6/§11). Not documented as its own contract entry since it's a side
effect, not a primary resource --- but the invariant matters:
**self-visits are never logged**, and a repeat visit **updates** the
existing `profile_visits` row rather than inserting a new one (§4.6 of
the implementation plan).

### 3.2 `GET /api/users/{userId}/visitors?page=&size=`

Caller must be `userId` (you can only see your own visitors). Available
to every user, no gating.

**Response** (paginated, `PageResponse<T>`, §0.3):

``` json
{
  "currentPage": 0,
  "totalPages": 1,
  "pageSize": 20,
  "totalElements": 6,
  "data": [
    { "userId": "...", "userName": "...", "avatarUrl": "...", "visitedAt": "2026-07-06T09:00:00" }
  ]
}
```

## 4. Device registration

### 4.1 `POST /api/devices/register`

**Body:**

``` json
{ "platform": "IOS", "pushToken": "fcm-token-string" }
```

Upserts on `(userId, pushToken)`.
`result: { "deviceId": "...", "registeredAt": "..." }`.

### 4.2 `DELETE /api/devices/{pushToken}`

Deregister --- called on logout so a stale device doesn't keep receiving
push/widget-refresh triggers for an account the user signed out of.
`result: null`. 404 `DEVICE_TOKEN_NOT_FOUND` if not registered (this one
**is** a real error, unlike close-friend removal in §1.3 ---
deregistering something that was never registered usually indicates a
client-side bug worth surfacing).

## 5. Widget authentication (`widget_token`)

Referenced throughout §2.2 and implementation plan §6.5. Not a REST
endpoint in the normal sense --- it's a claim embedded in a
specially-minted JWT:

-   Minted once, alongside normal login, via a new
    `JwtService.createWidgetToken(User user)` (mirrors the existing
    `createToken`, but with a `scope: "widget"` claim, a long expiry ---
    e.g. 90 days --- and **no** role claim, since it should only ever
    authorize one read-only endpoint).
-   Stored in `device_tokens.widget_token` (§4.1 of the implementation
    plan) so it can be looked up and explicitly invalidated on
    logout/deregistration, rather than relying on JWT expiry alone (a
    bare long-lived JWT with no revocation path is a standing risk ---
    this is why the implementation plan recommends storing it
    server-side instead of trusting client possession alone).
-   `GET /api/locket/moments/latest` accepts either a normal
    `Authorization: Bearer <jwt>` (role-based) **or** a
    `X-Widget-Token: <token>` header; the filter/interceptor validates
    the `scope: "widget"` claim **and** confirms the token still exists
    (non-revoked) in `device_tokens` before resolving the caller's
    identity.
-   No other endpoint accepts `widget_token` --- this needs to be an
    explicit allow-list check, not "any valid JWT works here," so a
    leaked widget token can't be replayed against
    e.g. `POST /api/locket/moments`.

## 6. Summary table (all new endpoints)

No endpoint gates its response by plan --- there is no plan. The cap
noted below is a flat abuse/sanity limit, not a monetization lever.

  ----------------------------------------------------------------------------------------------
  Method            Path                                     Auth              Notes
  ----------------- ---------------------------------------- ----------------- -----------------
  `GET`             `/api/locket/close-friends`              JWT               `limit` in
                                                                               response is the
                                                                               flat cap (50)

  `POST`            `/api/locket/close-friends/{friendId}`   JWT               enforces the flat
                                                                               cap

  `DELETE`          `/api/locket/close-friends/{friendId}`   JWT               

  `POST`            `/api/locket/moments`                    JWT               

  `GET`             `/api/locket/moments/latest`             JWT or            
                                                             `widget_token`    

  `GET`             `/api/locket/moments/feed`               JWT               

  `GET`             `/api/locket/moments/sent`               JWT               

  `POST`            `/api/locket/moments/{id}/view`          JWT               

  `GET`             `/api/locket/moments/{id}/viewers`       JWT               full identity
                                                                               list, no gating

  `POST`            `/api/locket/moments/{id}/react`         JWT               

  `GET`             `/api/users/{id}/visitors`               JWT               full list, no
                                                                               gating

  `POST`            `/api/devices/register`                  JWT               

  `DELETE`          `/api/devices/{pushToken}`               JWT               
  ----------------------------------------------------------------------------------------------
