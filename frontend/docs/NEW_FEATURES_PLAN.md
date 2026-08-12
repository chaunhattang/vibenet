# New Features — Roadmap & Mock-First Build Plan

Planning pass, 2026-08-12. Grounded in the backend
([`backend/docs/FRONTEND_API_GUIDE.md`](../../backend/docs/FRONTEND_API_GUIDE.md), 13 controllers)
and the current frontend. Two buckets:

- **Bucket A — Net-new (no backend exists):** build **mock-first** now, following the
  codebase's `// sau này có be thì...` convention (mock context/data with a clear seam to
  swap in a real API later). These are safe to ship as UI prototypes.
- **Bucket B — Backend-ready (endpoint exists, frontend still mock):** these are *wiring*
  jobs, not new features. Documented here for sequencing; not built mock-first (the mock
  already exists — they just need the real API, like the posts migration).

---

## Backend capability map (source of truth)

| Controller | Frontend status |
|---|---|
| Auth, Users | ✅ real |
| Posts, Comments, Reactions | ✅ real (wired 2026-08-12) |
| Locket moments + close friends | ✅ real |
| Friends (`/api/friends`) | ⚠️ mock (one `getFriends` carve-out) → **Bucket B** |
| Profile (`/api/profile`) | ⚠️ mock for other users → **Bucket B** |
| Notifications (`/api/notifications`) | ⚠️ mock → **Bucket B** |
| Chat REST + WebSocket/STOMP | ⚠️ mock → **Bucket B** |
| Devices / push + widget token | ❌ unused → **Bucket B** |
| **Stories, Saved, Liked, Explore** | ❌ **no backend at all** → **Bucket A (mock-first)** |

---

## Bucket A — Net-new, mock-first (build now)

### A1. Stories ⭐ — ✅ built mock-first 2026-08-12
Ephemeral 24h stories — distinct from permanent posts and from Locket moments (which are
private/close-friends). The story **bar already exists** (`StoryHighlightBar`) with rings +
LIVE badge, but `onPressStory` is unwired, so tapping does nothing.

- **New:** `StoryViewer` full-screen modal — segmented progress bars (one per frame),
  auto-advance timer, tap-left/right to seek, tap-and-hold to pause, swipe-down to close,
  cross-user advance at the end of a user's frames.
- **Mock:** extend `StoryItem` in `mockStories.ts` with `frames: { uri, createdAt }[]`;
  add a `viewedStoryIds` seam (mock now → `POST /stories/{id}/view` later).
- **Wire:** `NewsfeedScreen` passes `onPressStory` → opens `StoryViewer` at that user; the
  "My Story" bubble opens the composer (reuse `react-native-image-picker`) as a mock add.
- **Later (backend):** `GET /api/stories/feed`, `POST /api/stories` (multipart, 24h TTL),
  `POST /api/stories/{id}/view`, `GET /api/stories/{id}/viewers`.
- **Shipped:** `data/mockStories.ts` extended with `frames[]`; `contexts/StoriesContext.tsx`
  (mock-first: `stories`, `viewedIds`, `markViewed`, `addMyStoryFrame`, wired in
  `RootNavigator`); `components/Stories/StoryViewer.tsx` (segmented auto-advance progress
  bars, tap-left/right seek, hold-to-pause, cross-user advance, swipe/X close);
  `StoryHighlightBar` now dims viewed rings to grey; `NewsfeedScreen` opens the viewer and
  routes "My Story" → image-picker mock add. **Seam:** swap `MOCK_STORIES` + the two context
  mutations for a real `api/stories.ts` later. tsc + eslint (0 err) clean.

### A2. Saved / Bookmarks — ✅ built mock-first 2026-08-12
The profile tab bar in the design already shows a **Bookmark** icon — now wired to a real
save action.

- **Shipped:** `contexts/SavedContext.tsx` (mock-first, stores full `Post[]` so the grid
  renders without refetch: `saved`, `isSaved`, `toggleSave`; wired in `RootNavigator`);
  new `BookmarkIcon` (outline/filled) in `assets/Icon.tsx`; bookmark toggle on `PostCard`'s
  action row (right-aligned, accent-blue when saved); **Saved tab** added to `ProfileScreen`
  (`posts | saved | friends | settings`) rendering saved media as a `MasonryGrid`.
- **Seam:** swap the two `SavedContext` mutations for `POST/DELETE /api/posts/{id}/save` +
  `GET /api/saved` later. tsc + eslint (0 err) clean.

### A3. Liked / reacted posts — ✅ built mock-first 2026-08-12
Design's **Heart** profile tab — a grid of posts the user reacted to.

- **Shipped:** `contexts/LikedContext.tsx` (mock-first `liked: Post[]`, `isLiked`,
  `setLikedEntry`; wired in `RootNavigator`); `PostCard` syncs each post into it via an
  effect on `currentReaction` (so likes from feed data pre-populate the tab too); **Liked
  tab** added to `ProfileScreen` (`posts | liked | saved | friends | settings`) as a
  `MasonryGrid`. Refactored the Saved/Liked grid mapping into a shared `toGridItems` helper.
- **Seam:** needs a genuinely new backend endpoint — `GET /api/posts/liked` (backend only
  has per-post `currentReaction` today, no "my likes" list). tsc + eslint (0 err) clean.

### A4. Explore / discovery grid — ✅ built mock-first 2026-08-12
The Explore tab used to just toggle inline search; now it's a real destination.

- **Shipped:** `data/mockExplore.ts` (discovery items with a `tag` for search);
  `screens/ExploreScreen.tsx` (top search pill filtering the grid by tag, `MasonryGrid`,
  empty state, own `FloatingTabBar` with Explore active); `Explore` route in `types.ts` +
  `RootNavigator`; the `explore` tab in **all four hosts** (Newsfeed, Profile, Notifications,
  Messages) now navigates to `Explore` instead of toggling search / going Home.
- **Seam:** swap `MOCK_EXPLORE` for `GET /api/explore` (needs new backend). tsc + eslint clean.

---

## Bucket B — Backend-ready, wire later (not mock-first — migration jobs)

Sequenced by value/effort. Each mirrors the posts migration pattern (real `api/*.ts` +
context wired to endpoints, delete the mock).

1. **Real Notifications** — ✅ **done 2026-08-12.** `src/api/notifications.ts` +
   `NotificationsContext` (feed slice: paginated `load`/`loadMore`, `unreadCount`,
   optimistic `markRead`/`markAllRead` with rollback, wired in `RootNavigator`).
   `NotificationItem` migrated to the real `AppNotification` shape (synthesizes copy per
   `type`, read/unread styling, unread dot). `NotificationsScreen` "Recent Activity" now
   real (load on mount, loading/empty/error, "Mark all read"); friend-requests + suggestions
   stay mock pending B2. Deleted `mockNotifications` + old `NotificationData`/`NotificationType`.
   tsc + eslint (0 err) + grep-gate clean.
   **Follow-up:** surface `unreadCount` as a badge on the tab-bar/header bell (context
   already exposes it; the Home header bell currently badges Locket unread, not notifications).
2. **Real Friends graph** — `FriendShipController` (send/accept/decline/cancel/unfriend/
   status). Wire `FriendsContext`. ~1 session.
3. **Real other-user profiles** — `ProfileController`. Wire `OtherProfileScreen` header
   (posts already real). ~half session.
4. **Real-time chat** — `ChatController` (REST) + `ChatWebSocketController` (STOMP). Wire
   `ChatContext` + live socket. ~1–2 sessions.
5. **Push + Locket home-screen widget** — `DeviceController` (`register`, `widgetToken`).
   Native AppWidget / WidgetKit + push. Highest effort, biggest differentiator. Separate
   native task.

---

## Recommended order

**Now (mock-first):** A1 Stories ✅ → A2 Saved ✅ → A4 Explore ✅ → A3 Liked ✅ — **Bucket A complete.**
**Then (wiring):** B1 Notifications → B2 Friends → B3 Profiles → B4 Chat → B5 Push/Widget.

Each Bucket-A feature keeps a documented mock→real seam so the later backend swap is a
localized change (one `api/*.ts` + one context), exactly like the posts migration.
