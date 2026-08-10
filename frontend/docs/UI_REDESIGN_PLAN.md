# Vibenet UI/UX Audit + Bold Gen-Z Redesign Plan

Planned by Opus 5, implemented incrementally by Sonnet 5. Style direction (user-selected):
**bold / vibrant Gen-Z social** (Locket / BeReal / TikTok-adjacent) — not muted minimal SaaS.
Scope: whole app.

Update the checkboxes in §3 as phases land. One phase per round is the expected pace.

---

## 0. Baseline findings

- `tailwind.config.js` `theme.extend` is empty. No design tokens anywhere — every color is a
  raw Tailwind class or an inline hex.
- `App.tsx` has `useColorScheme`/`<StatusBar>` commented out — status bar style is unmanaged.
- No animation library installed (only `react-native-gesture-handler` + `react-native-svg`).
  `react-native-svg` **is** installed — enables gradients with zero new native deps.
- Icons (`src/assets/Icon.tsx`, 40+ inline SVGs) each hardcode their own default `color` prop;
  callers frequently omit `color` and silently inherit these un-tokenized defaults.

---

## 1. Concrete flaws (full detail)

### 1A. Tokenless-ness (maintenance defect, not just aesthetics)
- Dark surface color written **9 different ways**: `#0a0a0a`, `#0c1014` (Newsfeed/Search/
  OnlineUsers only), `#11131F`, `#181825`, `#1A1A2E` vs `#1A1A27` vs `#1A1D2D` (three
  near-identical "slightly lighter" values), `#1f1f22` vs `#171717` (chat has its own two
  grays), `#2A2A3E` (NotificationItem).
- Light surface: `bg-white` vs `#FDFDFD` vs `bg-gray-50` vs `bg-gray-100`.
- "Primary" color is not one color: `bg-indigo-600` (#4F46E5) for most CTAs, `#6366F1`
  (indigo-500) for tab-bar active/ProfileTabs underline/spinners, **auth flow uses
  `bg-slate-900`/`#0f172a`/`#0a0a0a` instead of indigo entirely** — no brand identity
  carries through onboarding.
- `CheckIcon` default `#3B82F6` used for 3 unrelated meanings (verified badge, white
  checkmark, green success) — same icon, three colors.
- `#9CA3AF` placeholder hardcoded in ~15 files.

### 1B. Radius/spacing inconsistency
- Login inputs `rounded-xl`, Register inputs `rounded-lg` — identical field pattern, two
  radii. Primary buttons split across `rounded-xl`/`rounded-full`/`rounded-lg` with no rule.
  Cards split `rounded-2xl`/`rounded-3xl` with no logic. Avatars ~8 different sizes, ad-hoc
  ring treatments.

### 1C. Layout / real UX bugs
- **`mt-10` hardcoded** on NewsfeedScreen, ProfileScreen, MessagesListScreen,
  NotificationsScreen instead of `useSafeAreaInsets()` — wrong across notch/status-bar
  heights, inconsistent vs. Locket/Chat/OtherProfile (which correctly use `insets.top + 10`).
- Screen title hierarchy inconsistent: list-screen titles `text-xl font-bold`, but every
  stack-screen header (Locket family, OtherProfile, CloseFriends) is only
  `text-base font-bold` (16px) — detail headers read smaller than list titles.
- `ProfileHeader`'s verified `CheckIcon` renders **unconditionally for every user**.
- `FloatingTabBar` has no labels, no active pill/indicator — just a color swap on similar
  line icons. Logout is hidden behind a long-press only (undiscoverable). Center button
  `-mt-8` can clip on small devices.
- StatusBar unmanaged (see §0).

### 1D. Empty states — 5 different visual languages
Newsfeed (dashed card, no icon) / `MomentFeedEmptyState` (dashed + CameraIcon, nicest) /
Profile thoughts+friends (bare text) / Messages+ChatDetail+MomentViewers (one gray line).

### 1E. Motion: none
Every state change is a hard cut — likes, tab switches, sends, sheet opens, list inserts.
Biggest "feels cheap" gap for a Locket/BeReal/TikTok-class product.

### 1F. Generic "indigo SaaS" look
Indigo-600 on white/gray-500, rounded-2xl, 1px hairlines — competent but reads as a B2B
dashboard, not a youth social app. No saturated color, gradients, oversized playful shapes,
or expressive type.

### 1G. Component-specific
- `ReactionBar` hardcodes `bg-black/40` — muddy when placed on a solid `#11131F` footer
  (only looks right on media).
- `MessageBubble` received bubble uses the only-other-place-`#1f1f22`; no timestamp
  grouping/delivery state.
- `NotificationItem` badge palette (`pink-500/blue-500/purple-500/gray-500`) is a fifth,
  unrelated color vocabulary.
- `ConfirmModal` always shows a **red** icon circle even for non-destructive flows (e.g.
  OtherProfile's "Cancel Pending Request").

---

## 2. Design system

### 2.1 Where it lives
1. `tailwind.config.js` → `theme.extend` — tokens for anything via `className`.
2. `src/theme/colors.ts` (NEW) — same hex values as JS constants for SVG icon
   `color`/`fill`/`stroke`, `placeholderTextColor`, `tintColor`, `style={{color}}`.
3. `src/theme/motion.tsx` (NEW) — `PressableScale`, `Pop`, `FadeInUp`,
   `configureLayoutAnimation()`.
4. `src/components/ui/` (NEW) — shared primitives: `GradientButton`, `ScreenHeader`,
   `EmptyState`, `Card`, `Avatar`.

### 2.2 Color tokens
Electric violet primary + hot-magenta accent + acid-lime "spark", on inky violet-tinted darks.

```js
colors: {
  brand: { 50:'#F1EEFF',100:'#E4DEFF',200:'#C7BCFF',300:'#A692FF',400:'#8A6BFF',
    500:'#6C4CFF', 600:'#5A34F5',700:'#4A28D6',800:'#3A1FA8',900:'#2A167A', DEFAULT:'#6C4CFF' },
  accent: { 300:'#FF9BC0',400:'#FF6FA3',500:'#FF4D8D',600:'#F5297B', DEFAULT:'#FF4D8D' },
  spark: { 400:'#E1FF6B',500:'#D6FF3F',600:'#B8E62E', DEFAULT:'#D6FF3F' },
  success:'#2FD670', danger:'#FF3B5C', warning:'#FFB020',
  ink: { base:'#0B0710', raised:'#15101F', overlay:'#1E1730', input:'#221A36' },
  paper: { base:'#FFFFFF', raised:'#F6F4FB', overlay:'#EDEAF6' },
  content: { strong:'#12101A', muted:'#6B6577', faint:'#9C97AA',
    'strong-dark':'#F5F3FA', 'muted-dark':'#B5AEC6', 'faint-dark':'#7C7690' },
  hairline: { light:'#ECE8F5', dark:'#2A2140' },
}
```
Usage rule: `bg-paper-base dark:bg-ink-base`, `bg-paper-raised dark:bg-ink-raised`,
`text-content-strong dark:text-content-strong-dark`, `border-hairline-light
dark:border-hairline-dark`, primary CTA `bg-brand`, like/energy `bg-accent`.

`src/theme/colors.ts` mirrors these as `C.brand`, `C.accent`, `C.spark`, `C.inkBase`, etc.,
plus `PLACEHOLDER = C.contentFaint`. `Icon.tsx` defaults get repointed at `C.*` instead of
raw hex (no API change — callers unaffected).

### 2.3 Typography scale (system font — no new asset)
| Token | Tailwind | px/weight | Use |
|---|---|---|---|
| display | `text-[34px] font-extrabold tracking-tight` | 34/800 | auth heroes |
| title | `text-[26px] font-extrabold tracking-tight` | 26/800 | screen titles |
| header | `text-xl font-bold` | 20/700 | **all stack headers** (bump from 16) |
| headline | `text-[17px] font-bold` | 17/700 | card/sheet titles |
| body | `text-[15px] font-medium` | 15/500 | post/message/caption text |
| callout | `text-sm font-semibold` | 14/600 | buttons, labels |
| caption | `text-xs font-medium` | 12/500 | meta, timestamps |
| micro | `text-[10px] font-bold tracking-wider` | 10/800 | badges, overlines |

### 2.4 Radius & spacing
`theme.extend.borderRadius: { field:'16px', card:'24px', hero:'30px', blob:'34px' }`
- Inputs/small pressables → `rounded-field`. Content cards → `rounded-card`. Media/hero
  cards & sheets → `rounded-hero`. Pills/CTAs/chips/tab bar → `rounded-full`.
- Avatars: list avatars stay circles; **post/composer author + profile hero avatars become
  squircles** (`rounded-[20px]`/`rounded-[24px]`) via the shared `Avatar` primitive (one
  reversible switch point). Ring (`border-2 border-brand/30`) only in "story"/online
  contexts (OnlineUsers, ComposerCard).
- Screen horizontal padding standardized to `px-5`; card inner padding `p-4`; section gap
  `gap-4`.

### 2.5 Motion (RN `Animated` + `LayoutAnimation` only — no new native dep)
- **Press feedback**: `PressableScale` (spring scale 0.96) on CTAs, tab-bar buttons, cards,
  reaction buttons.
- **Like/reaction pop**: `Animated.sequence` scale 1→1.35→1 + fill/color swap to `accent`.
- **List insert/removal**: `LayoutAnimation.configureNext(easeInEaseOut)` before
  add/delete post, send message, accept/decline request, add/remove close friend. Enable
  via `UIManager.setLayoutAnimationEnabledExperimental(true)` once in `App.tsx`.
- **Screen mount**: `<FadeInUp delay={i*40}>` stagger (`Animated.timing`, ≤200ms total) on
  first card list per screen.
- **Tab bar**: animated active-indicator pill (translateX/width) + `brand` icon color +
  1.1 scale.
- **Sheets**: keep `Modal animationType="slide"`, add `Animated` backdrop opacity 0→1.
- **Loading**: violet-tinted `Animated` opacity-loop shimmer for feed skeletons; keep
  spinners for small inline cases.

### 2.6 Gradients (via already-installed `react-native-svg`)
`GradientButton`/`GradientRing` — absolute `<Svg><LinearGradient>` brand→accent behind
content. Use for primary CTAs, tab-bar center button (+ glow shadow), OnlineUsers story
rings. Flat `bg-brand` elsewhere; gradient stays special (hero CTAs only).

---

## 3. Prioritized implementation plan (progress tracker)

### Phase 0 — Tokens & icon constants — ✅ done 2026-08-10
- [x] `src/theme/colors.ts` (`C`, `PLACEHOLDER`)
- [x] `tailwind.config.js` extended with `colors`/`borderRadius`/`fontSize`
- [x] `Icon.tsx` defaults repointed at `C.*`
- [x] `src/theme/motion.tsx` (`PressableScale`, `Pop`, `FadeInUp`, layout-animation helper)
- [x] `App.tsx`: re-enabled `StatusBar`, enabled Android `LayoutAnimation` experimental flag

### Phase 1 — Shared primitives — ✅ done 2026-08-10
- [x] `src/components/ui/GradientButton.tsx` — brand→accent SVG gradient (react-native-svg,
      no new dep), solid `bg-brand` fallback underneath, `compact` mode for icon-only use
- [x] `src/components/ui/ScreenHeader.tsx` — standard stack header, `header` type scale
      (bumped `text-base`→`text-xl`). **Not yet wired into the 8 screens that duplicate
      this header inline** — that swap happens per-screen in Phases 2–7, this round only
      built the primitive.
- [x] `src/components/ui/EmptyState.tsx` — **not yet wired into the 5 existing empty
      states** either, same reasoning (built now, adopted per-screen later)
- [x] `src/components/ui/Card.tsx`, `Avatar.tsx` (circle/squircle switch + optional
      brand ring)
- [x] `FloatingTabBar`: retokenized, `PressableScale` on every button, animated
      active-state pill (fade+scale, not a measured sliding indicator — see the risk note
      below), gradient center button via `GradientButton` (compact mode)
- [x] `OnlineUsers`: `Avatar` with `ring` (gradient-ready brand ring) for the story look,
      online dot recolored `green-500`→`spark` (acid lime)
- [x] `App.tsx`: (done in Phase 0, listed here for cross-reference) `StatusBar` + Android
      `LayoutAnimation` enabled
- **Deviation from the plan**: the tab-bar active indicator is a per-icon fade/scale pill,
  not a `translateX` indicator sliding between icon positions. A sliding indicator needs
  `onLayout` measurement of sibling positions to compute travel distance — unverifiable
  without a device in this environment, so this round shipped the lower-risk version.
  Revisit if/when a device build is available.
- [x] `npx tsc --noEmit` clean, `npx eslint` clean (0 errors; only `no-inline-styles`
      warnings on genuinely-dynamic values — `Avatar`'s computed radius, `GradientButton`'s
      full-bleed SVG sizing, `OnlineUsers`' scroll padding), `npx jest` passing

### Phase 2 — Auth flow — ✅ done 2026-08-10
- [x] LoginScreen / RegisterScreen / SetupProfileScreen: primary CTA unified to
      `GradientButton` (fixes the `bg-slate-900`/`#0f172a` break from the rest of the
      app's `indigo-600`/`#6366F1` — auth now shares the same brand token as everywhere
      else), inputs standardized to `rounded-field` (fixes Login `rounded-xl` vs Register
      `rounded-lg`), full retokenize, hero text bumped to `display`/`title` scale
- [x] `npx tsc --noEmit` clean, `npx eslint` clean (0 errors), `npx jest` passing

### Phase 3 — Home / Newsfeed — ✅ done 2026-08-10
- [x] NewsfeedScreen: `mt-10` → `insets.top` (real bug fix, not just retokenizing);
      "The Feed" → `title` scale; feed list wrapped in `FadeInUp` stagger (capped at 5
      items' worth of delay so a long list doesn't have a slow last-item entrance);
      `animateNextLayout()` before add/delete post; empty state → shared `EmptyState`
- [x] Search: retokenized; unread Locket badge `bg-indigo-600`→`bg-accent` (pop color)
- [x] ComposerCard: `rounded-hero`, squircle+ring `Avatar`, `PressableScale` on media/emoji
      buttons, `GradientButton` for "Whisper"
- [x] PostCard: `rounded-hero`, squircle `Avatar` (no ring — ring reserved for
      online/story contexts only), "NEW" badge → `bg-spark text-ink-base`, `timeLeft` →
      `bg-danger/15 text-danger`, like button → `usePop()` scale-pop + `accent` fill,
      audio/video accents retokenized to `brand`
- [x] CreateWhisperModal / PostDetailModal: retokenized, `rounded-t-hero` sheets,
      `GradientButton` CTA where applicable, comment avatars → shared `Avatar`
- [x] ConfirmModal: icon-circle color is now **prop-driven** (`tone: 'danger' | 'neutral'`,
      defaults to `'danger'` so all existing call sites are unaffected) instead of always
      red — fixes the "Cancel Pending Request" mixed-signal flaw. **Not yet applied**:
      `OtherProfileScreen`'s cancel-request call site should pass `tone="neutral"` — left
      for Phase 5 (Profile) since that screen's full retokenize happens there.
- [x] `npx tsc --noEmit` clean, `npx eslint` clean (0 errors), `npx jest` passing

### Phase 4 — Chat — ✅ done 2026-08-10
- [x] MessagesListScreen: `mt-10` → `insets.top` (real bug fix); title → `title` scale;
      search field → `rounded-field`; retokenized `#171717`
- [x] ChatDetailHeader: retokenized, online dot → `spark`, "Active now" text kept as a
      readable `success` green (not `spark`, which is too low-contrast for body text)
- [x] ChatRoomRow: tokenized `#1f1f22`; selected state → `bg-brand/10`; wrapped in
      `PressableScale`
- [x] MessageBubble: sent bubble → `bg-brand`, `rounded-hero`; received → tokenized
      surfaces; avatar → shared `Avatar`
- [x] ChatComposer: tokenized input surface; send button `PressableScale` + `bg-brand`
- [x] ChatDetailScreen: empty state → shared `EmptyState`; `animateNextLayout()` before
      `sendMessage`
- [x] `npx tsc --noEmit` clean, `npx eslint` clean (0 errors), `npx jest` passing

### Phase 5 — Profile — ✅ done 2026-08-10
- [x] ProfileHeader: **verified `CheckIcon` gated behind a new `verified?: boolean` prop**
      (defaults `false`) instead of rendering unconditionally — no real verification data
      exists yet, so it simply doesn't render anywhere now (honest, not fabricated); hero
      avatar → squircle `Avatar` with ring; reactions count now a `brand`-colored stat
- [x] ProfileTabs: retokenized, active tab uses `border-brand`. **Deviation**: kept the
      static underline rather than an animated sliding indicator — same
      onLayout-measurement risk as the tab-bar indicator (§4), not attempted without a
      device.
- [x] AboutCard → wraps the shared `Card` primitive; FriendCard → shared `Avatar` +
      `Card`, wrapped in `PressableScale`; EditProfileModal → `rounded-t-hero`,
      `rounded-field` inputs, `GradientButton` save
- [x] ProfileScreen: `mt-10` → `insets.top`; empty states (thoughts/friends) → shared
      `EmptyState`; `animateNextLayout()` before add/delete post
- [x] OtherProfileScreen: `mt-10`-less header replaced with shared `ScreenHeader`
      (bumps its title from `text-base`→`text-xl`, matching list-screen title weight);
      empty states → shared `EmptyState`; **`ConfirmModal` now gets `tone="neutral"` for
      the "Cancel Request" flow** (vs `tone="danger"` for "Unfriend") — this was the
      exact mixed-signal flaw flagged in §1G, now fixed at its actual call site
- [x] `npx tsc --noEmit` clean, `npx eslint` clean (0 errors), `npx jest` passing

### Phase 6 — Notifications — ✅ done 2026-08-10
- [x] NotificationsScreen: `mt-10` → `insets.top`; title → `title` scale; "Recent
      Activity" list wrapped in `FadeInUp` stagger; `animateNextLayout()` before
      accept/decline so `FriendRequestCard`s animate out
- [x] FriendRequestCard: retokenized, Accept → `GradientButton` (accepted a size
      mismatch vs. the neighboring "Drift Away" pill — `GradientButton` doesn't have a
      compact/small variant yet; not worth building a size-variant system for one button)
- [x] NotificationItem: **badge palette retokenized** from the unrelated
      `pink-500/blue-500/purple-500/gray-500` set to the app's real semantic colors —
      like→`accent`, reply→`brand`, mention→`spark` (with `ink-base` text for contrast
      against the bright acid-lime), faded→muted content tone. Wrapped in
      `PressableScale`.
- [x] SuggestedConnectionItem: connect button uses `usePop()` scale-pop on tap
- [x] `npx tsc --noEmit` clean, `npx eslint` clean (0 errors), `npx jest` passing

### Phase 7 — Locket — ✅ done 2026-08-10 (redesign complete, all 7 phases)
- [x] All 6 Locket screens (Feed, Sent, Viewers, CloseFriends, Capture, Compose) now use
      the shared `ScreenHeader` (bumps title `text-base`→`text-xl`), retokenized
      end-to-end, `tintColor`/`ActivityIndicator` colors → `C.brand`, Try-Again buttons →
      `GradientButton`
- [x] `MomentFeedEmptyState.tsx` **deleted** — was single-use, replaced inline with the
      shared `EmptyState` in `LocketFeedScreen`
- [x] MomentCard: squircle-avatar sender, unread dot `indigo`→`accent`, `ReactionBar`
      gained an `onMedia` prop (`bg-black/40` only reads correctly over media; the
      footer-placed bar in `MomentCard` now uses `bg-paper-overlay dark:bg-ink-overlay`
      instead — fixes the "muddy on solid background" flaw from §1G)
- [x] ReactionBar: each emoji now pops (`usePop()`) on select; selected state `bg-brand/30`
- [x] CaptureButton, RecipientPicker, CloseFriendRow, AddCloseFriendSheet,
      SentMomentCard, ViewersProgressHeader, ViewerRow, CloseFriendsLimitBanner (amber →
      `warning` token), MomentPreview, ReplyContextBanner — all retokenized, avatars →
      shared `Avatar`, list rows → `PressableScale`/`GradientButton` where applicable
- [x] `npx tsc --noEmit` clean, `npx eslint src/ App.tsx` clean (**0 errors, 50 warnings**
      — all pre-existing/expected: `no-inline-styles` on genuinely dynamic values,
      `no-bitwise` in `jwt.ts`, one unrelated `eslint-comments/no-unused-disable` in
      `navigation/types.ts`), `npx jest` passing

**All 7 phases of the redesign are now complete.** Every screen and shared component in
the app runs on the new token system (`src/theme/colors.ts` + `tailwind.config.js`),
with real motion (`PressableScale`, `usePop`, `FadeInUp`, `LayoutAnimation`) applied
throughout — no Reanimated/native deps added. Remaining known gaps, all deliberately
deferred per §4's risk framework:
- Tab-bar/`ProfileTabs` active indicators are fade/scale, not measured sliding indicators
- No custom display font (system font only)
- Dark-mode-default not flipped (still follows OS `useColorScheme`)
- **Nothing in this redesign has been visually verified on a device/emulator** — this
  environment has no Android/iOS toolchain running. Before shipping: build both
  platforms, run `pod install` on iOS (needed since Phase C's camera work, unrelated to
  this redesign), and manually sanity-check every screen in both light and dark mode.

---

## 4. Risk flags — do NOT do without on-device build/test
- **No Reanimated/Moti/lottie/blur/linear-gradient native libs** — all need `pod install`/
  native rebuild unverifiable in this environment. Motion/gradients are built on
  `Animated`, `LayoutAnimation`, and the already-installed `react-native-svg` only.
- **No custom display font** — needs native asset linking + rebuild. Deferred; ship
  weight/size hierarchy on the system font now.
- **Android `LayoutAnimation`**: global toggle, low-risk but scope usage to list add/remove
  only (avoid full-screen layout swaps) since it can't be visually verified here.
- **Dark-mode-default**: pure JS via NativeWind's `useColorScheme().setColorScheme('dark')`,
  but it's an app-wide product decision — flag for explicit sign-off, don't flip silently.
- **Squircle avatars**: safe (pure `borderRadius`), but route through the shared `Avatar`
  primitive so it's one reversible switch, not scattered edits.
- **`GradientButton`**: SVG-behind-content can mis-size before first layout on some Android
  versions — ship a solid `bg-brand` fallback so failure degrades gracefully.

---

## 5. Key reference files
- `tailwind.config.js`, `src/theme/colors.ts` (new), `src/assets/Icon.tsx`
- `src/layout/FloatingTabBar.tsx` (shared across 4 screens)
- `src/components/HomeScreen/PostCard.tsx` (reference card + like-motion pattern)
