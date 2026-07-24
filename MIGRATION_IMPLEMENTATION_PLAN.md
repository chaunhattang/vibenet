# VibeNet Backend — Migration, Upgrade & Locket Integration Plan

> Migrate legacy business logic from `fade/` (pkg `com.eiu.testlab.fade`) into the
> clean-architecture `backend/` (pkg `vibe.net.backend`), rebuild the notification
> system on Redis, and add the Locket moment-sharing feature set from
> `locket-api-design-vi.md`.
>
> Status: planning artifact. Nothing below is built yet unless marked ✅.

---

## 0. Ground Truth (what actually exists today)

### 0.1 `backend/` — target repo (mostly skeleton)

| Layer | Implemented | Stub / Missing |
|---|---|---|
| Entities | `User, Profile, Post, Comment, Reaction, Friendship, Notification, ChatRoom` | `ChatMessage`, all Locket entities |
| Enums | `Role, Status, Gender, FriendStatus, ReactionType(LOVE,FIRE), NotificationType(FRIEND_REQUEST,REACTION,COMMENT,MOMENT_REPLY)` | `PostType?`, Locket types, platform enum |
| Repositories | `UserRepository` only | everything else |
| Services (iface) | `AuthService, FileService, FriendshipService(empty), JwtService` | User, Profile, Post, Comment, Reaction, Friendship(logic), Chat, Notification, Locket, Device |
| Services (impl) | `AuthServiceImpl, FileServiceImpl, JwtServiceImpl` | all others |
| Controllers | `AuthController` ✅, `FriendShipController`(empty), `ProfileController`(empty) | User, Post, Comment, Reaction, Chat, Notification, File, Locket, Device |
| Mappers | `UserMapper` | Post, Comment, Profile, Notification, Locket |
| Config | `SecurityConfig, WebConfig, OpenAPIConfig`, `JwtAuthenticationFilter` | `RedisConfig`, `WebSocketConfig`, `StompAuthChannelInterceptor` |
| Exceptions | domain-based (`ErrorDomain` + `*ErrorCode`) ✅ | `LOCKET`, `CHAT`, `DEVICE`, `NOTIFICATION` domains |

**Conventions the migration MUST follow (non-negotiable, derived from existing code):**
- Package root `vibe.net.backend`. Entities in `models/entities`, DTOs in `models/dtos/request` and `models/dtos/response`.
- Every service = `interfaces/XService.java` + `implementations/XServiceImpl.java`. Impl annotated `@Service @RequiredArgsConstructor @FieldDefaults(level = PRIVATE, makeFinal = true)`.
- Controllers: `@RestController @RequestMapping("/api/...") @RequiredArgsConstructor @FieldDefaults(makeFinal = true, level = PRIVATE)`, return `ApiResponse<T>`.
- Errors: add a value to the right `*ErrorCode` enum (implements `ErrorCodeInterface`), throw `new AppException(SomeErrorCode.X)`. **Do not** reintroduce fade's flat `ErrorCode`.
- Mapping via MapStruct (`@Mapper(componentModel = "spring")`).
- Auth guard: `@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")`.

### 0.2 `fade/` — legacy source (feature-complete, to be mined)

Service LOC to port (business logic density): `PostService 223`, `ChatService 217`,
`FriendShipService 193`, `ReactionService 114`, `CommentService 105`, `ProfileService 103`,
`AuthService 102`, `UserService 94`, `SseService 67`, `FileService 63`, `JwtService 58`,
`AdminService 34`.

Legacy notification path = **in-memory SSE** (`SseService`: `Map<UUID,SseEmitter>`
in a `ConcurrentHashMap`). Single-instance, non-durable, lost on restart — this is the
system being replaced, not ported.

Redis in fade = **cache-manager only** (`RedisConfig`), no pub/sub, no data structures.

### 0.3 Key schema divergences (fade → backend)

| Concept | fade | backend | Action |
|---|---|---|---|
| User id field | `userName`, `passwordHash`, `role` = String | `username`, `hashedPassword`, `role` = `Role` enum | rename on port; update mappers |
| Post | abstract + `MediaPost`/`ThoughtPost`, `PostType`, `ttlMinutes`, `expiresAt`, denormalized `loveCount/commentCount/totalReactions`, `String mediaUrl` | single `Post`, `List<String> mediaUrl`, no TTL, no counts | **DECISION NEEDED** (§1.2) |
| Friendship | `FriendShip`, `requester`/`addressee`, status incl. `DECLINED` | `Friendship`, `sender`/`receiver`, no `DECLINED` | port with rename; add `DECLINED`? (§1.3) |
| Notification | same shape | `@GeneratedValue(IDENTITY)` on a `UUID` id ⚠️ bug | fix to `UUID` strategy (§1.4) |
| ChatMessage | entity exists | missing | add entity + repo |
| Locket | none | none | build new (§1.5) |

---

## Phase 1 — Entity & Database Schema Alignment

**Goal:** one coherent JPA model that supports legacy features + Locket + Redis-backed
read-state, with a safe DDL strategy. `spring.jpa.hibernate.ddl-auto` is currently
`update` — keep for dev, but produce explicit migration SQL for prod (§1.7).

### 1.1 Fix existing entity defects first
- **`Notification.id`**: change `@GeneratedValue(strategy = GenerationType.IDENTITY)` → `GenerationType.UUID`. `IDENTITY` + `UUID` is invalid on Postgres and will fail at insert.
- **`Post.mediaUrl`** (`List<String>`): add `@ElementCollection` + `@CollectionTable`, or normalize to a `PostMedia` child table. Without an annotation Hibernate cannot map a `List<String>`.
- **`Post.reactions` / `Post.comments`**: add `@OneToMany(mappedBy=...)` — currently bare `List` fields with no cardinality annotation (won't persist as relations).

### 1.2 DECISION — Post model (ephemeral vs. permanent)
fade posts are **ephemeral** (`ttlMinutes`, `expiresAt`, `PostCleanup` component sweeps
expired rows). backend `Post` dropped all of that. Pick one:
- **(A) Keep permanent posts** (current backend shape) — simpler; Locket moments carry
  their own ephemerality separately. *Recommended* — Locket is the "disappearing" surface;
  the main feed stays permanent.
- **(B) Re-introduce TTL** on `Post` (port `expiresAt` + `PostCleanup`).

This choice drives whether `PostCleanup`, `PostType`, and the `expires_at` index migrate.
**Flag to product owner before Phase 3.**

### 1.3 Port `Friendship` fields for close-friends support
- Rename map: fade `requester`→`sender`, `addressee`→`receiver`. Preserve fade's
  unique constraint `(sender_id, receiver_id)` and the two status indexes.
- Add `DECLINED` to `FriendStatus` if the decline flow is kept (fade has it; backend enum doesn't).
- Add derived query methods on a new `FriendshipRepository` (accepted-friend lookups feed
  close-friend validation and moment fan-out).

### 1.4 New entities for Locket (new package `models/entities` — all `UUID` ids, `@FieldDefaults(PRIVATE)`)

```
CloseFriend            (id, owner→User, friend→User, addedAt)      UNIQUE(owner_id, friend_id)
LocketMoment           (id, sender→User, mediaUrl, mediaType[PHOTO|VIDEO],
                        durationSeconds, caption, replyToMoment→LocketMoment(nullable),
                        createdAt)                                  INDEX(sender_id, created_at DESC)
LocketMomentRecipient  (id, moment→LocketMoment, recipient→User,
                        deliveredAt, viewedAt(nullable))            UNIQUE(moment_id, recipient_id)
                                                                    INDEX(recipient_id, delivered_at DESC)
LocketReaction         (id, moment→LocketMoment, recipient→User,
                        emoji, reactedAt)                           UNIQUE(moment_id, recipient_id)
DeviceToken            (id, user→User, platform[IOS|ANDROID|WEB],
                        pushToken, widgetToken(nullable), registeredAt)  UNIQUE(user_id, push_token)
ProfileVisit           (id, profileOwner→User, visitor→User, visitedAt) UNIQUE(owner_id, visitor_id)
                                                                    -- repeat visit UPDATES visitedAt, never inserts
```

New enums: `MediaType {PHOTO, VIDEO}`, `Platform {IOS, ANDROID, WEB}`.

### 1.5 `isRead` / read-state model (DB is source of truth; Redis is the fast path)
- **Locket moments:** authoritative read-state = `LocketMomentRecipient.viewedAt`. Redis
  `Set user:unread_moments:<uid>` is a derived cache (§2). No boolean column needed — presence
  of `viewedAt` = read.
- **Notifications:** authoritative = `Notification.isRead` (already exists). Redis
  `ZSET user:noti:<uid>` + counter `user:unread_noti_count:<uid>` are derived (§2).
- **Standard feed posts:** if per-post read tracking is required, add a `PostView`
  entity `(post_id, viewer_id, viewedAt)` UNIQUE`(post,viewer)`, mirrored by Redis
  `Set post:readers:<postId>` or `Set user:read_posts:<uid>`. *Confirm this is actually
  needed for the main feed — the doc only mandates it for Locket + notifications.*

### 1.6 NotificationType additions
Extend enum: `FRIEND_ACCEPTED, LOCKET_MOMENT_RECEIVED, LOCKET_REACTION` (doc §2.1/§2.7 use
these). Keep existing `MOMENT_REPLY`. Map fade's deprecated `LIKE`→`REACTION`.

### 1.7 Migration strategy / scripts
1. **Dev:** rely on `ddl-auto: update` to create new tables additively (no destructive changes since `backend` DB is fresh).
2. **Prod:** introduce **Flyway** (add `flyway-core` + `flyway-database-postgresql`, set `ddl-auto: validate`). Produce ordered `V1__baseline.sql` (current backend schema) then `V2__locket.sql`, `V3__read_state.sql`. This makes migrations reviewable and reversible — `ddl-auto: update` alone is unsafe for prod.
3. Because `backend` uses a *new* database (`fade` DB name in `.env` — decide: new schema `vibenet` vs. reuse), **no live data migration from fade is required** unless legacy data must be preserved. **Confirm:** greenfield DB (no ETL) vs. data carry-over (needs column-rename ETL for `userName`→`username` etc.).

**Phase 1 exit criteria:** all entities compile, `ddl-auto: update` boots cleanly against a fresh Postgres, Flyway baseline captured, decisions §1.2/§1.5/§1.7 signed off.

---

## Phase 2 — Redis Infrastructure & Notification System Rewrite

### 2.1 Wire Redis (currently missing!)
- Add to `backend/pom.xml`: `spring-boot-starter-data-redis` (and `commons-pool2` if using Lettuce pooling).
- Create `configs/RedisConfig.java`: a `RedisTemplate<String,Object>` with `StringRedisSerializer` keys + `GenericJackson2JsonRedisSerializer` values, plus (optionally) port fade's `RedisCacheManager`. Add a `StringRedisTemplate` for counter ops.
- `.env` / `.env.example` already have `REDIS_HOST`/`REDIS_PORT` ✅.

### 2.2 Key naming conventions, types, TTLs

| Purpose | Key | Type | TTL | DB fallback |
|---|---|---|---|---|
| Notification feed | `user:noti:<uid>` | ZSET (score = epoch ms) | 30d, trim to N=100 via `ZREMRANGEBYRANK` | `NotificationRepository.findByRecipientId...` |
| Unread noti count | `user:unread_noti_count:<uid>` | String (INCR/DECR) | none (rebuildable) | `count(isRead=false)` on cold start |
| Unread moments | `user:unread_moments:<uid>` | SET of momentId | 7d | `LocketMomentRecipient where viewedAt is null` |
| Latest moment (widget) | `locket:latest:<uid>` | String/Hash (JSON) | 30d | `LocketMomentRecipient order by deliveredAt desc limit 1` |
| Locket feed cache | `locket:feed:<uid>` | ZSET (score = createdAt) | 7d, trim via `ZREMRANGEBYRANK 0 -(N+1)` | `LocketMomentRecipient` join, newest first |
| Presence/online | `user:online:<uid>` | String | 60s heartbeat | offline if absent |
| Pub/Sub channel | `noti:events` / `noti:events:<uid>` | Pub/Sub | — | — |

Rule: **Redis never holds the only copy.** Every read path has a "cache miss → DB →
repopulate" branch (doc §2.2 explicitly requires this for `locket:latest`). Counters are
recomputed from DB on `NULL`/missing.

### 2.3 Event-driven notification architecture

```
[Producer]                    [Transport]                 [Consumers/Workers]
Service layer emits    ->  Redis Pub/Sub (noti:events)  -> NotificationDispatcher
  NotificationEvent           OR Redis Streams              ├─ persist Notification (DB)
  (recipientId, actorId,      (XADD, consumer group         ├─ update ZSET + INCR counter
   type, relatedEntityId)      for at-least-once)           ├─ WebSocket push (/user/<id>/queue/noti)
                                                            └─ FCM/APNs push (device tokens)
```

- **Producer:** a thin `NotificationPublisher.publish(NotificationEvent)` called by
  Post/Reaction/Comment/Friendship/Locket services. Fire-and-forget (`@Async` or just
  publish to Redis) so request latency is unaffected.
- **Transport choice — DECISION:**
  - **Pub/Sub** = simplest, but *fire-and-forget*; a consumer that's down misses events. Fine if DB write happens in the producer and pub/sub only fans out live delivery.
  - **Redis Streams** = durable, consumer groups, replay/ack. *Recommended* if push delivery must survive worker restarts. Slightly more code.
  - **Recommendation:** write `Notification` to DB **synchronously in the producer** (durability), then publish to Pub/Sub for *live* fan-out (WebSocket/FCM). Best of both: durable history + cheap real-time, no Streams complexity for v1. Revisit Streams if multi-worker push reliability becomes a requirement.
- **Consumer** (`NotificationEventListener`, `@Component` implementing `MessageListener`
  registered on a `RedisMessageListenerContainer`): updates Redis ZSET/counter, then pushes
  to WebSocket (`SimpMessagingTemplate.convertAndSendToUser`) and enqueues FCM.
- **WebSocket replaces SSE:** port fade's `WebSocketConfig` + `StompAuthChannelInterceptor`
  into `backend/configs`. Add `spring-boot-starter-websocket` is already present ✅.
  Deliver notifications on `/user/queue/notifications`.
- **FCM/APNs worker:** add `firebase-admin` SDK; `PushWorker` resolves `DeviceToken`s for the
  recipient and sends a data message. Guard behind a config flag so local dev without FCM
  creds still runs. *(New dependency — not yet in pom.)*

### 2.4 Notification service surface (interface/impl)
`NotificationService`: `publish(event)`, `getFeed(uid, page, size)` (ZSET-first, DB
fallback), `getUnreadCount(uid)` (counter, DB rebuild on miss), `markRead(uid, notiId)`
(DB `isRead=true` + `DECR` + `ZADD` update), `markAllRead(uid)`.

**Phase 2 exit criteria:** Redis connects; posting a reaction produces a DB `Notification`,
increments the counter, and pushes over WebSocket to a connected client; counter survives a
Redis flush (rebuilds from DB).

---

## Phase 3 — Service & Repository Layer Migration (module by module)

Port order chosen so each module only depends on already-ported ones:

**Auth ✅ → User → Profile → Friendship → Post → Comment → Reaction → File ✅ →
Notification (Phase 2) → Chat → Locket (Phase 4) → Admin.**

For **each** module, the repeatable recipe:
1. Create `repositories/XRepository extends JpaRepository<X,UUID>` — port fade's derived
   query methods, renaming fields (`userName`→`username`, `requester`→`sender`, …).
2. Create `services/interfaces/XService` (method signatures only).
3. Create `services/implementations/XServiceImpl` — port fade logic, swapping:
   - fade `ErrorCode` → new domain `*ErrorCode` + `AppException`.
   - fade `SecurityUtils.getCurrentUserId()` → port `utils/SecurityUtils` into backend (verify against backend's `JwtAuthenticationFilter` principal shape).
   - manual DTO building → MapStruct mapper.
4. Create/extend the MapStruct mapper for the module.
5. Add the module's error values to (or create) its `*ErrorCode` enum + register the domain in `ErrorDomain` if new.

Module-specific notes:
- **User/Profile:** reconcile field renames; port `UserService` search (`findByUsernameNotContainingIgnoreCase` already in repo), `changePassword`, `lastActiveAt` heartbeat, status transitions. Port `ProfileService` avatar/cover upload via existing `FileServiceImpl`.
- **Friendship:** port the 193-LOC state machine (request / accept / decline / block / unfriend), fire `FRIEND_REQUEST` + `FRIEND_ACCEPTED` notifications through the Phase-2 publisher. This also unlocks close-friend validation for Locket.
- **Post:** port per §1.2 decision. Wire reaction/comment counts (denormalized in fade). Emit notifications on new post to friends if that feed-notify behavior is kept.
- **Reaction/Comment:** port; emit `REACTION`/`COMMENT` notifications; update denormalized counts atomically.
- **Chat:** port `ChatService` (217 LOC) + `ChatMessage` entity + `ChatRoom`(exists) + WebSocket controller; depends on Phase-2 WebSocket config.

**Phase 3 exit criteria:** legacy feature parity for non-Locket features; all ported
services covered by at least happy-path integration tests; no reference to
`com.eiu.testlab.fade` remains.

---

## Phase 4 — Controller & API Layer + Locket Integration

### 4.1 Port legacy controllers → `backend/controllers` (thin, delegate to services)
`UserController, ProfileController(fill stub), PostController, CommentController,
ReactionController, FriendShipController(fill stub), ChatController, ChatWebSocketController,
NotificationController(WebSocket-based, not SSE), FileController, AdminController`. All
return `ApiResponse<T>`; paginated endpoints return `PageResponse<T>`.

### 4.2 New Locket domain (per `locket-api-design-vi.md`)

**Error codes — reconcile the doc's `7xxx` with backend's domain scheme:**
Add `LOCKET(700, 799)` and `DEVICE(800, 899)` to `ErrorDomain`; create
`LocketErrorCode` + `DeviceErrorCode` implementing `ErrorCodeInterface`. The *effective*
`getCode()` = `domain.base + relativeCode` (e.g. `LOCKET_MOMENT_NOT_FOUND` →
`700 + 1 = 701`). **The doc's literal `7001`… numbers do not apply** under the new scheme —
document the mapping so the mobile client is updated. (Decision: keep numeric values as
`70x`, not `700x`.)

| Doc code | New enum value | Domain-derived code |
|---|---|---|
| 7001 LOCKET_MOMENT_NOT_FOUND | `LocketErrorCode.MOMENT_NOT_FOUND` (404) | 701 |
| 7002 NOT_CLOSE_FRIEND | `LocketErrorCode.NOT_CLOSE_FRIEND` (400) | 702 |
| 7003 CLOSE_FRIEND_LIMIT_REACHED | `...LIMIT_REACHED` (400) | 703 |
| 7004 NOT_ACCEPTED_FRIEND | `...NOT_ACCEPTED_FRIEND` (400) | 704 |
| 7005 VIDEO_TOO_LONG | `...VIDEO_TOO_LONG` (400) | 705 |
| 7006 VIDEO_TOO_LARGE | `...MEDIA_TOO_LARGE` (400) | 706 |
| 7007 INVALID_MEDIA_TYPE | `...INVALID_MEDIA_TYPE` (400) | 707 |
| 7008 NOT_A_RECIPIENT | `...NOT_A_RECIPIENT` (403) | 708 |
| 7009 DEVICE_TOKEN_NOT_FOUND | `DeviceErrorCode.NOT_FOUND` (404) | 801 |

**Controllers & endpoints:**

`LocketCloseFriendController` `/api/locket/close-friends`
- `GET /` → `{closeFriends[], count, limit=50}`
- `POST /{friendId}` → validate `ACCEPTED` friend (`NOT_ACCEPTED_FRIEND`), enforce cap 50 (`CLOSE_FRIEND_LIMIT_REACHED`), idempotent add
- `DELETE /{friendId}` → idempotent remove (200, never 404)

`LocketMomentController` `/api/locket/moments`
- `POST /` (multipart `media`,`caption`,`recipientIds[]`,`replyToMomentId`) — validate in order: present → media type → ≤50MB → (video) ≤15s via **jcodec** (new dep) → recipients are close friends → replyTo exists & caller is recipient. Side effects: insert N `LocketMomentRecipient` rows, overwrite `locket:latest:<rid>` per recipient, publish `LOCKET_MOMENT_RECEIVED` notification per recipient (→ FCM), push moment to each recipient's `user:unread_moments` + `locket:feed` ZSET.
- `GET /latest` — widget hot path, JWT **or** `X-Widget-Token`; Redis-first with DB fallback + repopulate; `null` if none.
- `GET /feed?page=&size=` — received, newest first; enrich each item with `viewedAt`, `myReaction`.
- `GET /sent?page=&size=` — sent, with `recipientCount`, `viewedCount`.
- `POST /{momentId}/view` — set `viewedAt` (idempotent), `SREM user:unread_moments:<uid> momentId`, async DB sync; `NOT_A_RECIPIENT` guard.
- `GET /{momentId}/viewers` — sender-only; full recipient list incl. `viewedAt: null`.
- `POST /{momentId}/react` — upsert `LocketReaction` unique`(moment,recipient)`; publish `LOCKET_REACTION` to sender.

`DeviceController` `/api/devices`
- `POST /register` (`{platform, pushToken}`) upsert on `(userId,pushToken)`; mint & store `widgetToken` (see §4.4).
- `DELETE /{pushToken}` deregister; `DEVICE_TOKEN_NOT_FOUND` if absent (real error).

Profile visitors (extend existing user flow):
- `GET /api/users/{id}/visitors?page=&size=` — self-only, `PageResponse`.
- Visit logging = side effect of `GET /api/users/{id}` — never log self-visits; repeat visit **updates** `ProfileVisit.visitedAt` (upsert), no new row.

### 4.3 `isRead` integration into response DTOs
- **Locket feed DTO:** `viewedAt` (from `LocketMomentRecipient`) + `myReaction`. The "active
  ring" indicator = `SCARD user:unread_moments:<uid> > 0` (O(1)), exposed via a lightweight
  `GET /api/locket/moments/unread-count` or embedded in the feed envelope.
- **Notification DTO:** `isRead` + top-level unread count from `user:unread_noti_count:<uid>`.
- **Newsfeed post DTO:** include `isRead` only if §1.5 PostView is adopted.

### 4.4 `widget_token` (doc §5)
- `JwtService.createWidgetToken(User)` — mirror `createToken`, add `scope:"widget"` claim,
  90-day expiry, **no role claim**. Persist in `DeviceToken.widgetToken` for revocation.
- Extend `JwtAuthenticationFilter` (or a dedicated filter) to accept `X-Widget-Token`
  **only** for `GET /api/locket/moments/latest`: validate `scope=="widget"` **and** confirm
  the token still exists in `device_tokens` (revocable). Explicit allow-list — a widget token
  must not authorize any other endpoint.
- Update `SecurityConfig` matchers accordingly.

**Phase 4 exit criteria:** every endpoint in the doc's §6 summary table responds with the
documented shape; widget token works on `latest` and is rejected everywhere else; Postman/REST
collection covers all Locket routes.

---

## Phase 5 — Edge Cases, Performance & Testing Checklist

### 5.1 Redis memory & durability
- `maxmemory-policy`: use **`volatile-lru`** (evict only keys with a TTL) so counters/feeds
  set without TTL aren't evicted out from under a fallback that assumes DB rebuild — or set
  TTLs on everything and use `allkeys-lru`. Pick one and make fallbacks match.
- All caches have a documented cold-start rebuild path (§2.2). Verify each after `FLUSHALL`.
- Cap collection sizes: `ZREMRANGEBYRANK` trim notification feed (100) and `locket:feed` (N);
  `user:unread_moments` bounded by 7d TTL.

### 5.2 Fan-out edge cases
- **Large recipient lists / broadcast to all close friends:** cap 50 close friends bounds it,
  but still batch Redis writes (pipeline/`MSET`/Lua) and FCM sends; do fan-out **async** off
  the request thread.
- **Partial-send policy:** doc §2.1 mandates *fail-whole-request* if any `recipientId` isn't a
  close friend — validate all before any side effect.
- **Idempotency:** `view` and `react` and close-friend add/remove must be idempotent
  (unique constraints + `SREM`/upsert).

### 5.3 Real-time reliability
- **WebSocket reconnect:** on reconnect the client pulls `GET /notifications` + unread count to
  reconcile missed live events (pub/sub is lossy by design — DB is the source of truth).
- **Widget polling** `latest`: keep it Redis-O(1); never 500 on cold cache.
- **Multi-instance:** because delivery goes through Redis pub/sub, any app instance can push to
  any connected client only if using a shared broker — note: Spring's `SimpleBroker` is
  in-memory/per-instance. For multi-instance WebSocket, plan a **STOMP relay** (RabbitMQ) or a
  Redis-backed broker relay. Single-instance for v1 is acceptable; flag for scale-out.

### 5.4 Data-consistency sync (Redis → DB)
- `viewedAt` write path: update Redis `SREM` immediately (UX), persist DB `viewedAt`
  synchronously in the same request (it's cheap and authoritative) rather than a fragile async
  queue — reserve async only for high-volume counters.
- Reconciliation job (optional `@Scheduled`): recompute `user:unread_*` counters from DB nightly
  to heal drift.

### 5.5 Security
- Widget token scope enforcement (§4.4) — negative test: widget token on `POST /moments` → 401/403.
- `viewers` endpoint sender-only; `visitors` self-only; moment `view`/`react` recipient-only.
- File upload: content-type + size validation before disk write (port fade `FileService` guards).

### 5.6 Testing / verification checklist
- [ ] `mvn -f backend clean verify` green.
- [ ] Boot against fresh Postgres + Redis; all tables created / Flyway validated.
- [ ] Auth → register/login unchanged ✅.
- [ ] Each ported module: happy-path + primary error-path integration test.
- [ ] Notification: reaction → DB row + counter INCR + WebSocket frame received.
- [ ] Counter rebuild after `FLUSHALL` matches DB count.
- [ ] Locket: post moment (photo + 15s video boundary), latest (JWT + widget token), feed,
      sent, view (idempotent), viewers (sender-only), react (upsert).
- [ ] Close-friend cap (50) + non-accepted-friend rejection.
- [ ] Device register/deregister + widget-token mint/revoke.
- [ ] Profile visit upsert (no self-visit, repeat updates timestamp).
- [ ] Load check: broadcast moment to 50 recipients → single request latency acceptable (fan-out async).

### 5.7 Deployment checklist
- [ ] Add deps to `backend/pom.xml`: `spring-boot-starter-data-redis`, `flyway-core` +
      `flyway-database-postgresql`, `firebase-admin` (FCM), `jcodec` (video probe).
- [ ] `.env` prod values: DB, Redis, `JWT_*`, `FILE_UPLOAD_DIR`, FCM credentials path.
- [ ] `ddl-auto: validate` (prod) with Flyway migrations applied.
- [ ] Redis `maxmemory` + eviction policy configured to match §5.1.
- [ ] WebSocket broker decision (single-instance SimpleBroker vs. relay) locked for the target topology.
- [ ] Swagger (`/swagger`) documents all new endpoints.

---

## Open Decisions (resolve before / during Phase 1)
1. **Post model:** permanent (A, recommended) vs. re-introduce fade TTL (B). — §1.2
2. **Feed post `isRead`:** needed for the standard newsfeed, or Locket-only? — §1.5
3. **DB strategy:** greenfield `vibenet` DB (no ETL) vs. carry legacy fade data (needs rename ETL). — §1.7
4. **Notification transport:** Pub/Sub + synchronous DB write (recommended) vs. Redis Streams. — §2.3
5. **Error-code numbering:** adopt domain-derived `70x` (recommended, consistent) and update the mobile client, vs. carve a special flat `7xxx` block to match the doc verbatim. — §4.2
6. **WebSocket topology:** single-instance SimpleBroker for v1 vs. broker relay for scale-out. — §5.3
