# Locket Feature — Frontend Build Plan & Tracker

Status doc for building the frontend against the backend's already-shipped Locket
controllers (`LocketMomentController`, `LocketCloseFriendController`). Backend is
done; frontend has **zero** screens for this feature today. This doc tracks the
design, the API contract, and build progress so any session can pick up where the
last one left off.

Designed by an Opus planning pass on 2026-08-09, grounded in the actual controller
source (`backend/src/main/java/vibe/net/backend/controllers/LocketMomentController.java`,
`LocketCloseFriendController.java`) and the existing frontend conventions (mock-first
Context providers, NativeWind styling, flat `RootStackParamList`).

> ⚠️ **Naming collision**: the codebase already has an unrelated "Whisper" feature
> (`CreateWhisperModal`, `PostData.type: 'moment' | 'thought'`) that is a **text**
> ephemeral post. Locket is **photo/video**, with viewer receipts and close-friends
> scoping — much closer to real Locket/BeReal. Never reuse `PostData`,
> `CreateWhisperModal`, or a bare `Moment` type name for this feature — always
> prefix `Locket*` / `Moment*`.

---

## 1. API shapes (source of truth — backend, already implemented)

### `LocketMomentController` — `/api/locket/moments` (JWT, `USER`/`ADMIN`)

| Method | Path | Body/Params | Returns |
|---|---|---|---|
| POST | `/` (multipart) | `media`(file, req), `caption?`, `recipientIds?`(UUID[]), `replyToMomentId?`(UUID) | `MomentCreationResponse` |
| GET | `/latest` | – (JWT **or** `X-Widget-Token`) | `LatestMomentResponse` |
| GET | `/feed` | `?page&size` | `PageResponse<MomentFeedItemResponse>` |
| GET | `/sent` | `?page&size` | `PageResponse<SentMomentResponse>` |
| GET | `/unread-count` | – | `{ unreadCount: number }` |
| POST | `/{momentId}/view` | – | `Void` |
| GET | `/{momentId}/viewers` | – | `MomentViewersResponse` |
| POST | `/{momentId}/react` | `{ emoji: string }` | `MomentReactionResponse` (**upsert, no remove endpoint**) |

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
interface MomentViewersResponse { viewedCount: number; totalRecipients: number; viewers: MomentViewerResponse[]; }
interface MomentViewerResponse { userId: string; userName: string; avatarUrl: string; viewedAt: string; }
interface MomentReactionResponse { emoji: string; reactedAt: string; }
```

### `LocketCloseFriendController` — `/api/locket/close-friends` (JWT, `USER`/`ADMIN`)

| Method | Path | Returns |
|---|---|---|
| GET | `/` | `CloseFriendsListResponse` |
| POST | `/{friendId}` | `AddCloseFriendResponse` |
| DELETE | `/{friendId}` | `Void` |

```ts
interface CloseFriendResponse { userId: string; userName: string; fullName: string; avatarUrl: string; addedAt: string; }
interface CloseFriendsListResponse { closeFriends: CloseFriendResponse[]; count: number; limit: number; }
interface AddCloseFriendResponse { friendId: string; addedAt: string; }
```

### Related (already exists, not part of this build)

`POST /api/devices/register` `{ platform, pushToken }` → `{ deviceId, widgetToken, registeredAt }`.
`widgetToken` pairs with `X-Widget-Token` for `GET /locket/moments/latest` — this is for an
OS home-screen widget (native surface), **not** an in-app RN screen. Out of scope here;
just register the device + persist `widgetToken` at login time (in `AuthContext` or a small
`DeviceContext`), nothing more.

---

## 2. Screen inventory

| # | Screen | Purpose | Entry point(s) | Phase |
|---|---|---|---|---|
| 1 | `CloseFriendsScreen` | Manage capped close-friends list (add/remove) | `ProfileScreen` row; "Manage" link from recipient picker | A |
| 2 | `LocketFeedScreen` | Main feed of received moments (full-bleed cards, react, reply) | New Locket icon in `NewsfeedScreen` header | B |
| 3 | `SentMomentsScreen` | Moments I sent + view analytics | `LocketFeedScreen` header icon; `ProfileScreen` | B |
| 4 | `MomentViewersScreen` | "Seen by" list for a sent moment | Row tap in `SentMomentsScreen` | B |
| 5 | `LocketCaptureScreen` | Full-screen camera capture (photo/video) | Capture button on `LocketFeedScreen` | C |
| 6 | `LocketComposeScreen` | Preview capture, caption, pick recipients, send | From `LocketCaptureScreen`, or reply action | C |
| 7 | `MomentDetailScreen` *(optional/deferred)* | Single moment fullscreen, for push deep-links | Push notification tap | Deferred |

**Entry point decision**: a dedicated Locket icon in `NewsfeedScreen`'s header (next to
`Search`), **not** the center "+" button (already owns `CreateWhisperModal`, an unrelated
flow — overloading it would deepen the naming collision). `FloatingTabBar`'s `TabKey` union
stays unchanged.

---

## 3. Navigation additions (`src/navigation/types.ts`)

```ts
LocketFeed: undefined;
LocketCapture: { replyToMomentId?: string } | undefined;
LocketCompose: {
  assetUri: string;
  assetType: 'PHOTO' | 'VIDEO';
  durationSeconds?: number;
  replyToMomentId?: string;
};
SentMoments: undefined;
MomentViewers: { momentId: string };
CloseFriends: undefined;
```

Register each as a `Stack.Screen` in `RootNavigator.tsx` (`headerShown: false`, matching
existing style). Wrap the stack in a new `LocketProvider`, nested inside `FriendsProvider`
(recipient picker needs the friends list) alongside `PostsProvider`.

---

## 4. Component breakdown (`src/components/Locket/*.tsx`)

| Screen | New components | Reused |
|---|---|---|
| `LocketFeedScreen` | `MomentCard`, `ReactionBar`, `ReplyComposerBar`, `MomentFeedEmptyState` | `FloatingTabBar`, avatar pattern from `PostCard` |
| `LocketCaptureScreen` | `CameraView`, `CaptureButton`, `CameraControls`, `CapturePermissionGate` | — |
| `LocketComposeScreen` | `MomentPreview`, `CaptionInput`, `RecipientPicker`, `SendMomentButton`, `ReplyContextBanner` | `CloseFriendRow` |
| `SentMomentsScreen` | `SentMomentCard` | empty-state pattern |
| `MomentViewersScreen` | `ViewerRow`, `ViewersProgressHeader` | — |
| `CloseFriendsScreen` | `CloseFriendRow`, `AddCloseFriendSheet`, `CloseFriendsLimitBanner` | `ConfirmModal`, `Search` pattern |

---

## 5. State/context plan (`src/contexts/LocketContext.tsx`)

Mirrors `PostsContext`/`ChatContext` shape: mock-backed now, `// Sau này có be thì...`
comments mapping each function to its real endpoint.

**State:**
- `feed: MomentFeedItem[]` ← `GET /feed`
- `sentMoments: SentMoment[]` ← `GET /sent`
- `latestMoment: LocketMoment | null` ← `GET /latest`
- `closeFriends: CloseFriend[]`, `closeFriendsLimit: number` ← `GET /close-friends`
- `unreadCount: number` ← `GET /unread-count`
- `viewersByMoment: Record<string, MomentViewers>` ← `GET /{id}/viewers` (cache)

**Functions → endpoint:**
| Function | Endpoint |
|---|---|
| `createMoment(input: CreateMomentInput)` | `POST /moments` (multipart) |
| `markViewed(momentId)` | `POST /{momentId}/view` (also decrements local `unreadCount`) |
| `reactToMoment(momentId, emoji)` | `POST /{momentId}/react` (upsert, replaces `myReaction`) |
| `getViewers(momentId)` | `GET /{momentId}/viewers` |
| `refreshFeed(page, size)` | `GET /feed` |
| `refreshSent()` | `GET /sent` |
| `refreshLatest()` | `GET /latest` |
| `addCloseFriend(friendId)` | `POST /close-friends/{friendId}` (guard against `limit`) |
| `removeCloseFriend(friendId)` | `DELETE /close-friends/{friendId}` |
| `refreshCloseFriends()` | `GET /close-friends` |
| `refreshUnreadCount()` | `GET /unread-count` |

---

## 6. New types (`src/types/index.ts`)

```ts
export type MomentMediaType = 'PHOTO' | 'VIDEO';

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

export type SentMoment = {
  momentId: string;
  mediaUrl: string;
  mediaType: MomentMediaType;
  caption: string | null;
  createdAt: string;
  recipientCount: number;
  viewedCount: number;
};

export type MomentViewer = {
  userId: string;
  userName: string;
  avatarUrl: string;
  viewedAt: string;
};

export type MomentViewers = {
  viewedCount: number;
  totalRecipients: number;
  viewers: MomentViewer[];
};

export type CloseFriend = {
  userId: string;
  userName: string;
  fullName: string;
  avatarUrl: string;
  addedAt: string;
};

export type MomentReaction = {
  emoji: string;
  reactedAt: string;
};

// Backend leaves omitted-recipientIds semantics undefined — modeled explicitly here.
export type RecipientScope = 'CLOSE_FRIENDS' | 'ALL_FRIENDS' | 'SPECIFIC';

export type CreateMomentInput = {
  assetUri: string;
  assetType: MomentMediaType;
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
```

---

## 7. Mock data plan (`src/data/mockLocket.ts`)

Same header-comment convention as `mockData.ts`. Reuse existing `mockOnlineUsers` ids
(`u1`–`u3`) and `CURRENT_USER_ID` so avatars/names match the rest of the app.

- `mockFeed: MomentFeedItem[]` — 5–6 items, mixed `PHOTO`/`VIDEO`, some with `caption`,
  some `viewedAt: null` (unread), 1–2 with `myReaction` set.
- `mockSentMoments: SentMoment[]` — 3–4 items authored by current user, varied
  `viewedCount`/`recipientCount` (e.g. `2/5`, `5/5`, `0/3`).
- `mockMomentViewers: Record<string, MomentViewers>` — keyed by sent `momentId`s,
  viewers drawn from `mockOnlineUsers`.
- `mockCloseFriends: CloseFriend[]` — 2–3 entries; `mockCloseFriendsLimit = 10`.
- `mockUnreadCount` — derived from `mockFeed` where `viewedAt === null`.

---

## 8. Open design decisions / risks

1. **"moment" naming collision** — `PostData.type` already uses `'moment'|'thought'` for
   the unrelated Whisper feature. Mitigation: always prefix `Locket*`/`Moment*`, never
   reuse `PostData`/`CreateWhisperModal`.
2. **`recipientIds` omitted semantics** — backend behavior TBD. Frontend models this
   explicitly via `RecipientScope`, defaulting to `CLOSE_FRIENDS`. **Needs backend
   confirmation** of what an empty/omitted `recipientIds` actually does server-side.
3. **Camera dependency** — no camera lib installed today. Recommend
   **`react-native-vision-camera`** + **`react-native-image-picker`** as gallery fallback.
   Real native-linking/permissions decision — until approved, stub `LocketCaptureScreen`
   with gallery picker so Phases A/B are fully demoable without it.
4. **Widget-token flow** — `X-Widget-Token` + `GET /latest` is for an OS home-screen
   widget (native surface outside RN JS), not an in-app screen. Register device at login,
   store `widgetToken`, treat native widget as a separate out-of-scope task.
5. **Reply-to-a-moment UX** — reply bar on `MomentCard` → `LocketCaptureScreen` with
   `replyToMomentId` → `LocketComposeScreen` shows `ReplyContextBanner`. Reply is itself a
   moment (per backend `replyToMomentId`), not a chat message.
6. **Persistence/expiry** — backend has no expiry field, has pagination + sent history →
   moments **persist**, unlike Whisper's `timeLeft` countdown. No countdown UI for Locket.
7. **Reactions are upsert-only** — no remove-reaction endpoint. UI must not offer
   "un-react"; tapping a different emoji replaces the previous one.
8. **View-marking trigger** — call `markViewed(momentId)` on viewability (card becomes
   dominant on screen), optimistically decrement `unreadCount`. Not marked on mount.
9. **`MomentDetailScreen` deferred** — until push deep-linking exists, scroll
   `LocketFeedScreen` to the target `momentId` instead of a dedicated route.

---

## 9. Build order & progress tracker

Update the checkboxes as work lands. One PR/commit per checked group is the expected
granularity.

### Phase A — Close Friends — ✅ done 2026-08-09, re-wired to real API 2026-08-09
- [x] Add types: `CloseFriend` to `src/types/index.ts`
- [x] `CloseFriendsScreen` + `CloseFriendRow`, `AddCloseFriendSheet`, `CloseFriendsLimitBanner`
- [x] Nav: registered `CloseFriends` route; entry row in `ProfileScreen` → Settings tab
- [x] Wire `LocketProvider` into `RootNavigator.tsx` (nested inside `FriendsProvider`,
      outside `PostsProvider`/`ChatProvider`)
- [x] New `StarIcon` added to `src/assets/Icon.tsx` (close-friends visual marker)
- [x] `npx tsc --noEmit` clean, `npx jest` passing

**Update — re-wired to the real backend the same day, after Phase B's real-API
precedent.** Originally shipped mock-first (per the plan); once auth + feed went real,
mock close-friends became the odd one out, so it was migrated too:
- [x] `src/api/closeFriends.ts`: `getCloseFriends`, `addCloseFriendRequest`,
      `removeCloseFriendRequest` → `GET/POST/DELETE /api/locket/close-friends*`
- [x] `src/api/friends.ts`: `getFriends(userId)` → `GET /api/friends/{userId}` — **new,
      not originally planned**. Needed because `CloseFriendServiceImpl.addCloseFriend`
      (confirmed by reading the source) throws `LocketErrorCode.NOT_ACCEPTED_FRIEND`
      unless the target is an accepted friend — so the "add" candidate list has to come
      from real accepted friends, not the still-mock `FriendsContext`. This is a narrow,
      single-endpoint carve-out from the Friends feature, not a full migration — friend
      requests/accept/decline/status/unfriend are all still mock.
- [x] `LocketContext`: replaced the mock close-friends slice with a real one —
      `closeFriendsLoading`, `closeFriendsError`, `loadCloseFriends()` added;
      `addCloseFriend`/`removeCloseFriend` are now async and hit the real endpoints.
      `addCloseFriend` is deliberately **not optimistic** (surfaces real backend
      rejections — not-an-accepted-friend, limit-reached — accurately via `Alert.alert`
      in the screen). `removeCloseFriend` **is optimistic** with rollback-on-failure,
      since the backend documents delete as an idempotent no-op.
- [x] Deleted `src/data/mockLocket.ts` (both mock exports it held are now unused)
- [x] `AddCloseFriendSheet` candidate type changed from `OnlineUser` to a new
      `AddCloseFriendCandidate` (`{id, name, handle, avatar}`), sourced from
      `GET /api/friends/{userId}` instead of mock data; added a loading spinner state
- [x] `CloseFriendsScreen` now loads on mount (`loadCloseFriends()`), shows a retry state
      on error, and fetches real candidates lazily when the add-sheet opens
- [x] `npx tsc --noEmit` clean, `npx eslint` clean (0 errors), `npx jest` passing

Not yet done: `refreshCloseFriends` naming from the original plan doc is now
`loadCloseFriends` (renamed for consistency with `loadFeed`). No optimistic-add retry UI
beyond the `Alert.alert` — acceptable for now given add failures are rare/expected
(limit, not-yet-friends) rather than transient.

### Phase B — Feed & receipts

**⚠️ Deviation from the original plan, decided 2026-08-09**: `LocketFeedScreen` was built
against the **real backend** (`GET /api/locket/moments/*`), not mock data. This required
pulling `AuthContext` off mock accounts too — see "Auth is now real" note below. Backend
was not running/reachable during this build (needs Postgres/Redis/.env); implemented
strictly against the documented + controller-verified contract, **not yet smoke-tested
against a live server**. Verify against a running backend before considering this done.

- [x] Add types: `MomentMediaType`, `LocketMoment`, `MomentFeedItem`, `MomentReaction`,
      `MomentViewer`, `MomentViewers` to `src/types/index.ts`. Also added `PageResponse<T>`,
      `UserResponse`, `ProfileResponse` (backend-shape types for the new API layer).
      `SentMoment` intentionally **not** added yet — `SentMomentsScreen` is still pending.
- [x] New `src/api/` layer (did not exist before this feature — first real API wiring in
      the app): `client.ts` (fetch wrapper, `ApiResponse` envelope unwrap, JWT header
      injection, `resolveMediaUrl`), `jwt.ts` (dependency-free JWT payload decode),
      `auth.ts`, `users.ts`, `locket.ts`
- [x] `mockLocket.ts`: kept `mockCloseFriends`/`mockCloseFriendsLimit` only (Phase A,
      unchanged). No `mockFeed`/`mockUnreadCount` added — feed is real API now, not mock.
- [x] `LocketContext`: added feed slice wired to real endpoints — `feed`, `feedLoading`,
      `feedError`, `hasMoreFeed`, `unreadCount`, `refreshUnreadCount`, `loadFeed`,
      `loadMoreFeed`, `markViewed` (optimistic + rollback-on-failure), `react` (optimistic
      upsert + rollback-on-failure). Close-friends slice untouched, still mock.
- [x] `LocketFeedScreen` + `MomentCard`, `ReactionBar`, `MomentFeedEmptyState`.
      `ReplyComposerBar` **deferred to Phase C** — replying to a moment requires
      `LocketCaptureScreen`, which doesn't exist yet, so there's nothing for a reply
      button to open.
- [x] Locket entry icon (camera icon + unread badge) added to `Search.tsx`'s header row,
      wired in `NewsfeedScreen` → navigates to `LocketFeed`; unread count fetched on
      Home mount via `refreshUnreadCount()`
- [x] `SentMomentsScreen` + `SentMomentCard` — built 2026-08-10, wired to
      `GET /api/locket/moments/sent`
- [x] `MomentViewersScreen` + `ViewerRow`, `ViewersProgressHeader` — built 2026-08-10,
      wired to `GET /api/locket/moments/{momentId}/viewers`
- [x] Nav: registered `LocketFeed`, `SentMoments`, `MomentViewers` routes
- [x] View-marking wired via `FlatList` `onViewableItemsChanged`
      (`itemVisiblePercentThreshold: 60`), deduped per session via a `Set` ref, with
      optimistic `unreadCount` decrement and rollback if the `POST /view` call fails
- [x] `npx tsc --noEmit` clean, `npx jest` passing, JWT base64url decode verified against
      Node's `Buffer` for round-trip correctness (incl. UTF-8 usernames)

**Update — `SentMomentsScreen` + `MomentViewersScreen` added 2026-08-10:**
- Added `SentMoment` type to `src/types/index.ts` and `getSentMoments(page, size)` to
  `src/api/locket.ts` (`GET /api/locket/moments/sent`).
- `LocketContext` gained a sent-moments slice mirroring the feed slice pattern:
  `sentMoments`, `sentLoading`, `sentError`, `hasMoreSent`, `loadSentMoments`,
  `loadMoreSentMoments`.
- `MomentViewersScreen` deliberately does **not** go through `LocketContext` — it calls
  `getMomentViewers(momentId)` directly from the screen (same precedent as
  `CloseFriendsScreen` calling `getFriends` directly), since per-moment viewer data is
  transient and not needed anywhere else. It receives the tapped `SentMoment` as a nav
  param (`MomentViewers: { moment: SentMoment }`) so the header can render immediately
  without a second round-trip, then fetches the live `viewedCount`/`totalRecipients`/
  `viewers` on mount.
- New components: `SentMomentCard` (thumbnail + caption + `viewedCount/recipientCount`
  badge), `ViewersProgressHeader` (thumbnail + caption + progress bar), `ViewerRow`.
- Entry points added: a "sent" icon button in `LocketFeedScreen`'s header, and a "Sent
  Moments" row in `ProfileScreen`'s Settings tab (next to "Close Friends").
- `npx tsc --noEmit` clean, `npx eslint` clean (0 errors; only pre-existing
  `no-inline-styles` warnings matching codebase convention), `npx jest` passing. Not yet
  smoke-tested against a live backend (same caveat as the rest of Phase B).

**Auth is now real (scope expansion, approved by user this round):**
- `AuthContext.login()` now calls `POST /api/auth/login`, decodes the JWT to get the
  user id (`sub` claim — confirmed against `JwtServiceImpl#createToken`, which sets
  `subject = user.getId().toString()`), then calls `GET /api/users/{id}` to populate
  `currentUser`. `register()` calls `POST /api/auth/register` (does not auto-login, per
  API contract — `RegisterScreen`'s existing "register then navigate to Login" flow
  already matches this, unchanged).
- Deleted `src/data/mockAccounts.ts` (only consumer was the old mock `AuthContext`).
- Tokens are held in module-level state in `src/api/client.ts`, **not persisted** — no
  storage lib installed (no AsyncStorage). Session is lost on app restart. Add persistent
  storage as a follow-up once this pattern is validated.
- **Known side effect, not fixed this round**: every other mock data file
  (`mockData.ts`'s `mockProfiles`, `mockFriendsByUser`, `mockFriendStatusByUser`,
  `mockPosts`, etc.) is still keyed on fake ids (`'me'`, `'u1'`–`'u5'`). A real logged-in
  user has a real backend UUID, which won't match any of those keys — so "My Thoughts"
  on `ProfileScreen`, friends counts, chat rooms, and notifications will appear **empty**
  for a real account until those areas are migrated too. This is expected fallout of
  doing the auth/Locket migration ahead of the rest of the app, not a bug in this diff.

### Phase C — Capture — ✅ done 2026-08-10

**⚠️ Deviation from the original plan**: chose **`react-native-image-picker`** over
`react-native-vision-camera`. Rationale: vision-camera needs a hand-built native
camera-preview UI plus Reanimated/worklets and careful native permission wiring — none of
which could be build-verified in this environment (no confirmed Android/iOS toolchain
run here). image-picker launches the OS camera/gallery natively (`launchCamera` /
`launchImageLibrary`), has a far smaller native surface, and still covers photo + video
capture. Trade-off: capture UI is the OS camera, not a fully custom in-app one — the
plan's `CameraView`/`CameraControls`/`CapturePermissionGate` components don't exist
because there's no live preview to control; revisit if a custom capture UI becomes a
priority.

- [x] Installed `react-native-image-picker` (^8.2.1). Added native permissions:
      `CAMERA`/`RECORD_AUDIO` in `android/app/src/main/AndroidManifest.xml`;
      `NSCameraUsageDescription`/`NSMicrophoneUsageDescription`/
      `NSPhotoLibraryUsageDescription`/`NSPhotoLibraryAddUsageDescription` in
      `ios/FeFadeMobile/Info.plist`. **iOS needs `pod install` on a Mac before building** —
      not run here (Windows environment, no CocoaPods).
- [x] Added types: `RecipientScope`, `CreateMomentInput` (extended with
      `assetMimeType`/`assetFileName` beyond the original plan, since image-picker assets
      carry those directly and the backend multipart upload needs a real mime type/name,
      not just a bare URI), `MomentCreation` to `src/types/index.ts`
- [x] `src/api/client.ts`: added `apiPostMultipart<T>` helper (reuses the existing
      `request()` multipart path, previously only used internally)
- [x] `src/api/locket.ts`: `createMoment(input)` → `POST /api/locket/moments` (multipart:
      `media` file + optional `caption`/`replyToMomentId`/`recipientIds[]`)
- [x] `LocketContext`: `createMoment` — calls the API, prepends the result to
      `sentMoments` on success so `SentMomentsScreen` reflects it without a refetch
- [x] `LocketCaptureScreen` — three actions (Take Photo / Record Video / Choose from
      Gallery) via `launchCamera`/`launchImageLibrary`, using `CaptureButton`; navigates
      to `LocketCompose` with the picked asset. Shows `ReplyContextBanner` when opened
      with a `replyToMomentId`.
- [x] `LocketComposeScreen` + `MomentPreview`, `RecipientPicker`, `ReplyContextBanner`.
      Caption input and the send button are inlined directly in the screen (plain
      `TextInput`/`Pressable`) rather than split into their own `CaptionInput`/
      `SendMomentButton` files — too trivial to justify separate components, consistent
      with how `AddCloseFriendSheet` inlines its own search input.
- [x] Recipient scope resolution: `RecipientPicker` defaults to all close friends
      selected; on send, all-selected → `scope: 'CLOSE_FRIENDS'` (omits `recipientIds`,
      per the plan's still-unconfirmed backend default), a partial selection →
      `scope: 'SPECIFIC'` with explicit `recipientIds`. `ALL_FRIENDS` stays unexposed in
      the UI (§8 risk #2 unresolved — still needs backend confirmation).
- [x] Nav: registered `LocketCapture`, `LocketCompose` routes
- [x] Reply-to-moment: added a reply button (`MessageIcon`) to `MomentCard`, wired in
      `LocketFeedScreen` → `navigation.navigate('LocketCapture', { replyToMomentId })`
- [x] Entry point: camera icon button added next to the sent-moments icon in
      `LocketFeedScreen`'s header → `LocketCapture`
- [x] `npx tsc --noEmit` clean, `npx eslint` clean (0 errors), `npx jest` passing. **Not
      tested on a device/emulator** — no camera hardware/simulator available in this
      environment, and the backend isn't running. Before shipping: run `pod install` on
      iOS, rebuild both platforms, and manually verify capture → compose → send against a
      live backend.

### Deferred
- [ ] `MomentDetailScreen` (push deep-link target)
- [ ] Device registration + `widgetToken` persistence (`AuthContext`/`DeviceContext`)
- [ ] Native home-screen widget (Android App Widget / iOS WidgetKit) — separate native task

---

## 10. Key reference files

- `frontend/src/contexts/PostsContext.tsx`, `ChatContext.tsx` — context shape to mirror
- `frontend/src/screens/NewsfeedScreen.tsx` — feed/composer/modal-launch pattern
- `frontend/src/components/HomeScreen/CreateWhisperModal.tsx` — bottom-sheet modal styling
- `frontend/src/navigation/types.ts`, `RootNavigator.tsx` — route registration
- `frontend/src/types/index.ts` — type-alias style
- `frontend/src/data/mockData.ts` — mock conventions + reusable user ids
- `backend/src/main/java/vibe/net/backend/controllers/LocketMomentController.java`
- `backend/src/main/java/vibe/net/backend/controllers/LocketCloseFriendController.java`
- `backend/docs/FRONTEND_API_GUIDE.md` §4.11–4.12 — API doc (matches controller source)
