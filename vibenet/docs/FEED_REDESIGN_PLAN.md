# Feed & Post Redesign — Real Instagram-Style Posts

> Source design spec: [`docs/design.md`](./design.md) · Source sketch: [`docs/designSketch.png`](./designSketch.png)
> Companion trackers: [`GLASSMORPHIC_MOBILE_RESTRUCTURE_PLAN.md`](./GLASSMORPHIC_MOBILE_RESTRUCTURE_PLAN.md) (glass UI), [`LOCKET_FEATURE_PLAN.md`](./LOCKET_FEATURE_PLAN.md) (moments)

Planning pass, 2026-08-12. Grounded in the **real backend** (`PostController`,
`CommentController`, `ReactionController` — verified against
[`backend/docs/FRONTEND_API_GUIDE.md`](../../backend/docs/FRONTEND_API_GUIDE.md) §4.5–4.7)
and the current frontend (mock feed, real `src/api/*` layer for auth/locket).

---

## 0. Decisions locked (2026-08-12)

| # | Decision | Consequence |
|---|---|---|
| 1 | **Main feed = Instagram-style Post wired to the real `/api/posts` backend.** | Feed, profile grid, comments, reactions all go real. First real wiring of `/api/posts`. |
| 2 | **Drop "Whisper" / "Soul Sync" TTL entirely.** | Backend posts are permanent — no TTL field exists. Ephemeral sharing lives **only** in Locket moments. |
| 3 | Design language = the shipped **Babagang glass system** (`design.md`). | No new visual language; the Post just becomes media-first + real data. |
| 4 | Locket (moments) stays as-is — the separate ephemeral feature. | This plan does **not** touch `src/components/Locket/*` or `LocketContext`. |

**The core problem this fixes:** the feed today is a 3-way mock hybrid —
mock Whisper text posts (`PostCard` + `PostsContext`), a separate mock `MediaFeedCard`
section (`MOCK_MEDIA_FEED`), and the Locket entry point. None of the feed touches a
backend, even though a complete `/api/posts` API already ships. This plan collapses the
first two into **one real Instagram Post** and deletes the Whisper concept.

---

## 1. Current-state audit

### Real (keep — the pattern to mirror)
- `src/api/client.ts` — fetch wrapper: `apiGet`, `apiPost`, `apiPut`, `apiDelete`,
  `apiPostMultipart`, `ApiResponse` envelope unwrap, JWT header injection, `resolveMediaUrl`.
- `src/api/locket.ts` — the exact shape a new `src/api/posts.ts` should copy (see multipart
  `createMoment` for the media-upload pattern).
- `AuthContext` (real login/register, real `currentUser` with backend UUID).
- `PageResponse<T>`, `PostOwnerResponse` types already exist in `src/types/index.ts`.

### Mock (to replace or delete)
| File | Fate |
|---|---|
| `src/contexts/PostsContext.tsx` | **Rewrite** — real API-backed (mirror `LocketContext` feed slice). |
| `src/components/HomeScreen/PostCard.tsx` | **Rewrite** — Instagram media-first card on `PostResponse`. |
| `src/components/HomeScreen/MediaFeedCard.tsx` | **Delete/merge** — folded into the new `PostCard`. |
| `src/components/HomeScreen/ComposerCard.tsx` | **Rewrite** — opens the real create-post flow. |
| `src/components/HomeScreen/CreateWhisperModal.tsx` | **Rewrite → `CreatePostModal`** — media picker + caption → `POST /api/posts`. |
| `src/components/HomeScreen/PostDetailModal.tsx` | **Rewrite** — real comments (`GET/POST …/comments`). |
| `src/data/mockData.ts` (`mockPosts`, `mockComments`) | **Delete** those exports (feed & comments go real). |
| `src/data/mockMediaFeed.ts` | **Delete**. |
| `PostData` / `CommentData` types (Whisper shape) | **Replace** with `Post` / `Comment` (backend shape). |
| `src/data/mockStories.ts` + `StoryHighlightBar` | **Keep mock** for now — no stories backend exists. Flag as deferred. |
| `OnlineUsers` / `mockOnlineUsers` | **Keep mock** — no presence backend. Deferred. |

> ⚠️ **Naming**: the Whisper feature currently overloads `PostData.type: 'moment' | 'thought'`.
> After this plan, `moment` = Locket only. Do not reuse `PostData` — introduce a clean `Post`.

---

## 2. API contract (source of truth — backend, already shipped)

### Posts — `/api/posts` (JWT)
| Method | Path | Body/Params | Returns |
|---|---|---|---|
| POST | `/api/posts` (multipart) | `textContent`, `mediaFiles[]` | `PostResponse` |
| PUT | `/api/posts/{postId}` | `?textContent=` (query) | `PostResponse` |
| DELETE | `/api/posts/{postId}` | – | `Void` |
| GET | `/api/posts/{postId}` | – | `PostResponse` |
| GET | `/api/posts/user/{userId}/page` | `?page&size` | `PageResponse<PostResponse>` |
| GET | `/api/posts/feed` | `?page&size` | `PageResponse<PostResponse>` |

```ts
interface PostResponse {
  id: string; owner: PostOwnerResponse; textContent: string; mediaUrl: string[];
  commentCount: number; reactionCount: number;
  currentReaction: "LOVE" | "FIRE" | null; // caller's own reaction
  createdAt: string;
}
interface PostOwnerResponse { id: string; username: string; fullName: string; avatarUrl: string; }
```

### Comments — `/api/posts/{postId}/comments` (JWT)
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/posts/{postId}/comments` | `{ content: string }` | `CommentResponse` |
| GET | `/api/posts/{postId}/comments` | `?page&size` | `PageResponse<CommentResponse>` |

```ts
interface CommentResponse { id: string; postId: string; owner: PostOwnerResponse; content: string; createdAt: string; }
```

### Reactions — `/api/posts/{postId}/reactions` (JWT)
| Method | Path | Params | Returns |
|---|---|---|---|
| POST | `/api/posts/{postId}/reactions` | `?type=LOVE\|FIRE` | `ReactionType \| null` |

**Toggle semantics** (use the returned value, don't guess): no reaction → sets `type`;
same `type` again → removed (`null`); different type → switches. `reactionCount` on the
post must be adjusted locally from the return value (+1 on set, −1 on remove, 0 on switch).

> Backend has **two** reaction types (`LOVE`, `FIRE`) — not a single "like". The Post UI
> needs a small reaction affordance (long-press or a 2-emoji picker), not just a heart.
> Sketch shows only a heart; simplest mapping: tap = `LOVE`, long-press = `FIRE` picker.

---

## 3. New types (`src/types/index.ts`)

Add clean backend-shaped types; keep the old `PostData`/`CommentData` only until every
consumer is migrated, then delete.

```ts
export type ReactionType = 'LOVE' | 'FIRE';

export type PostOwner = { id: string; username: string; fullName: string; avatarUrl: string };

export type Post = {
  id: string;
  owner: PostOwner;
  textContent: string;
  mediaUrl: string[];           // 0..n media; card renders carousel when >1
  commentCount: number;
  reactionCount: number;
  currentReaction: ReactionType | null;
  createdAt: string;
};

export type Comment = {
  id: string; postId: string; owner: PostOwner; content: string; createdAt: string;
};

export type CreatePostInput = {
  textContent?: string;
  media: { uri: string; mimeType: string; fileName: string }[]; // from image-picker assets
};
```

---

## 4. New API layer (`src/api/posts.ts`)

Mirror `src/api/locket.ts` exactly (imports from `./client`).

```ts
export const getFeed = (page, size) => apiGet<PageResponse<Post>>('/api/posts/feed', { page, size });
export const getUserPosts = (userId, page, size) =>
  apiGet<PageResponse<Post>>(`/api/posts/user/${userId}/page`, { page, size });
export const getPost = (postId) => apiGet<Post>(`/api/posts/${postId}`);
export const createPost = (input: CreatePostInput) => { /* FormData: textContent + mediaFiles[] */ };
export const updatePost = (postId, textContent) => apiPut<Post>(`/api/posts/${postId}?textContent=${enc}`);
export const deletePostRequest = (postId) => apiDelete<void>(`/api/posts/${postId}`);
export const reactToPost = (postId, type) => apiPost<ReactionType | null>(`/api/posts/${postId}/reactions?type=${type}`);
export const getComments = (postId, page, size) =>
  apiGet<PageResponse<Comment>>(`/api/posts/${postId}/comments`, { page, size });
export const addComment = (postId, content) => apiPost<Comment>(`/api/posts/${postId}/comments`, { content });
```

`createPost` FormData: append each media asset as `mediaFiles` (same
`{ uri, type, name }` cast used in `locket.ts createMoment`), and `textContent` if present.

---

## 5. New `PostsContext` (`src/contexts/PostsContext.tsx`)

Mirror `LocketContext`'s feed slice (paginated, optimistic mutations, rollback on failure).

**State:** `feed: Post[]`, `feedLoading`, `feedError`, `hasMoreFeed`, `page`.
**Functions → endpoint:**
| Function | Endpoint | Notes |
|---|---|---|
| `loadFeed()` | `GET /api/posts/feed?page=0` | initial + pull-to-refresh |
| `loadMoreFeed()` | `GET …?page=n` | infinite scroll |
| `createPost(input)` | `POST /api/posts` | prepend result to `feed` on success |
| `updatePost(id, text)` | `PUT /api/posts/{id}` | replace in `feed` |
| `deletePost(id)` | `DELETE /api/posts/{id}` | optimistic remove + rollback |
| `react(id, type)` | `POST …/reactions?type=` | optimistic; reconcile from return value |

Profile-owned posts are fetched per-screen via `getUserPosts(userId)` (same precedent as
`MomentViewersScreen` calling the API directly) — not held in this global context.

---

## 6. The Post component (core deliverable)

**`src/components/HomeScreen/PostCard.tsx`** — full rewrite onto `Post`, Instagram layout in
the Babagang glass language (`design.md` §5C tokens):

- **Header row**: `36px` circular avatar → tap = `goToProfile(owner.id)`; `fullName` (14/600) +
  blue verified tick placeholder; `@username · relativeTime(createdAt)`; `···` overflow
  (owner → edit/delete via `ConfirmModal`).
- **Media**: `mediaUrl[0]` full-bleed, `aspect-ratio 4/5`, `radius-card 28px`, `resizeMode cover`
  through `resolveMediaUrl`. If `mediaUrl.length > 1` → horizontal pager + dot indicator. If
  `mediaUrl.length === 0` → text-only card (no media block).
- **Action row**: Heart (tap→`react(id,'LOVE')`, long-press→FIRE), `reactionCount`; Comment
  (opens `PostDetailModal`), `commentCount`; Share (stub). Filled heart when
  `currentReaction === 'LOVE'`, flame when `'FIRE'`; `usePop()` animation on set.
- **Caption**: `fullName` bold + `textContent`, hashtags tinted `accentBlue #0084FF`. "View all
  {commentCount} comments" → opens detail.

Delete `MediaFeedCard.tsx` — the media-first layout now lives in `PostCard`. Update
`NewsfeedScreen` to render one `PostCard` list from `feed` (remove the `MOCK_MEDIA_FEED` block).

**`PostDetailModal.tsx`** — real comments: `getComments(postId)` on open (paginated),
`addComment` optimistically prepends, input wired to `POST …/comments`.

**`CreatePostModal.tsx`** (rename from `CreateWhisperModal`) — `react-native-image-picker`
(already installed) for media + caption `TextInput` → `createPost`. Drop the TTL/duration
picker. `ComposerCard` becomes a thin launcher for it.

> **TextInput focus bug**: define these sub-components at **module scope**, never nested in a
> screen/component body (the recent LoginScreen bug — nested components remount the input on
> every keystroke and eat focus).

---

## 7. Screen & navigation changes

- `NewsfeedScreen.tsx`: remove `MOCK_MEDIA_FEED` + Whisper composer wiring; render real `feed`
  from `PostsContext` in a `FlatList` (infinite scroll via `onEndReached`, pull-to-refresh);
  `onPressAdd` → `CreatePostModal`. Keep `GlassTopHeader`, `StoryHighlightBar` (mock),
  `OnlineUsers` (mock), `FloatingTabBar`, Locket entry — all unchanged.
- `ProfileScreen.tsx` / `OtherProfileScreen.tsx`: the posts tab → `MasonryGrid` fed by
  `getUserPosts(userId)` (real), each cell links to the post. Drop "Current Thoughts"/TTL.
- No new routes. `RootNavigator` provider tree unchanged (rewrite `PostsProvider` in place).

---

## 8. What to delete (after migration)

`mockMediaFeed.ts`; `mockPosts`/`mockComments` from `mockData.ts`; the TTL/`timeLeft`/
`isNew`/`type:'thought'` fields and `createLocalPost` helper in `NewsfeedScreen`; old
`PostData`/`CommentData` once no file imports them. Grep gate: `PostData`, `timeLeft`,
`Whisper`, `Soul Sync`, `MOCK_MEDIA_FEED`, `mockPosts` → 0 hits in `src/`.

---

## 9. Build order & tracker

### Phase 1 — Types + API + Context — ✅ done 2026-08-12
- [x] `Post`, `Comment`, `PostOwner`, `ReactionType`, `CreatePostInput` in `src/types/index.ts`
- [x] `src/api/posts.ts` (mirror `locket.ts`)
- [x] Rewrite `PostsContext` (real feed slice, optimistic react/delete, reaction reconciled from server return)
- [x] `npx tsc --noEmit` clean

### Phase 2 — Post card + feed — ✅ done 2026-08-12
- [x] Rewrite `PostCard` (media-first, carousel for >1 media, LOVE/FIRE reactions, hashtag tint, owner edit/delete)
- [x] `NewsfeedScreen` → real `FlatList` feed, infinite scroll (`onEndReached`), pull-to-refresh, loading/empty/error states
- [x] Delete `MediaFeedCard` + `mockMediaFeed.ts`
- [x] `tsc` + `eslint` (0 errors) clean

### Phase 3 — Create + detail/comments — ✅ done 2026-08-12
- [x] `CreatePostModal` (image-picker multi-select + caption → `createPost`), deleted `CreateWhisperModal`
- [x] `ComposerCard` → thin launcher
- [x] `PostDetailModal` → real comments (`getComments` paginated on open, optimistic `addComment`)
- [x] `tsc` + `eslint` clean

### Phase 4 — Profile posts + cleanup — ✅ done 2026-08-12
- [x] `OtherProfileScreen` posts tab → real `getUserPosts` + new `PostCard` (`editable={false}`)
- [x] `ProfileScreen` → real post count via `getUserPosts` totalElements; `CreatePostModal` wired
- [x] Deleted `mockPosts`/`mockComments`, `PostData`/`CommentData`, all TTL/Soul-Sync remnants (incl. auth-screen picker)
- [x] Grep gate passes; `tsc` + `eslint` (0 errors) + `jest` clean

### Deferred (no backend yet, or follow-up)
- [ ] **`ProfileScreen` own posts grid** still uses `MOCK_GRID_ITEMS` (visual mock) — swap for a real `getUserPosts` masonry. Count is already real.
- [ ] **FIRE reaction UX** — currently tap=LOVE / long-press=FIRE on `PostCard`. Revisit if design wants both surfaced explicitly.
- [ ] **Not smoke-tested against a live backend** — implemented against the documented + controller-verified contract; backend not running in this env. Verify create/feed/comments/reactions end-to-end before shipping.
- [ ] Stories (`StoryHighlightBar` mock), presence/`OnlineUsers` mock, Share action stub, token persistence (AsyncStorage), video playback in feed (currently first frame via `Image`).

### Known fallout (expected, pre-existing)
- Mock areas keyed on fake ids (`mockProfiles`, `mockOnlineUsers`, friends) won't match a real UUID account — `OtherProfileScreen` profile/friends still mock while its **posts** are real. Same documented mock-vs-real-id gap as the Locket migration.

---

## 10. Risks & decisions

| Item | Decision |
|---|---|
| Two reaction types (LOVE/FIRE) vs sketch's single heart | Tap = LOVE, long-press = FIRE picker. Revisit if design wants both surfaced. |
| Media aspect ratio (backend gives no dimensions) | Fixed `4/5` portrait, `cover`. Carousel when `mediaUrl.length > 1`. |
| Text-only posts (`mediaUrl` empty) | Allowed by backend — render caption-only card, no media block. |
| Token not persisted | Known (no AsyncStorage) — session lost on restart; deferred, same as Locket. |
| Real UUIDs vs remaining mock (stories/presence/friends) | Those stay mock and may render empty for a real account — expected until migrated. |
| `resolveMediaUrl` on `mediaUrl[]` | Backend returns relative paths — always pass through `resolveMediaUrl` (as Locket does). |
