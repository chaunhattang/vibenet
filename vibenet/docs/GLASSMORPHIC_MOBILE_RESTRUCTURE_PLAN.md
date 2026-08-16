# Glassmorphic Mobile UI — Babagang Design System
## Progress Tracking Plan

> Source design spec: [`docs/design.md`](./design.md)
> Source design sketch (screenshot): [`docs/designSketch.png`](./designSketch.png) — **authoritative for nav + layout fidelity**
> Source HTML prototype: [`docs/mockDashboard&Profile.txt`](./mockDashboard&Profile.txt)
> Previous redesign log: [`docs/UI_REDESIGN_PLAN.md`](./UI_REDESIGN_PLAN.md)

> [!IMPORTANT]
> **Round 1 (Phases A–G) shipped** the Babagang glass system onto the codebase (see Progress Summary).
> **Round 2 (Phases H–K, below)** is a *fidelity pass* driven by re-extracting the design directly from
> [`designSketch.png`](./designSketch.png). Where the sketch and the earlier mock HTML disagree, **the sketch wins.**
> The headline change: the bottom navigation is **4 icons, not 5** — see Phase H.

---

## Overview

This plan tracks the application of the **Modern Glassmorphic & Soft-Modernist Mobile UI**
(code-named "Babagang") into the existing React Native `FeFadeMobile` project.

The current app already has a solid token system and component library built in
`UI_REDESIGN_PLAN.md` Phases 0–7. This round **extends** (not replaces) that system to
overlay the new Babagang aesthetic on top of the existing NativeWind + `src/theme` stack.

### Auth Screen Redesign ✅ Done 2026-08-10
Merged `LoginScreen` + `RegisterScreen` into a single unified glassmorphic auth screen:
- Atmospheric `ImageBackground` (Unsplash gradient photo) filling the top 45%
- Dark glass memoji badge (`src/assets/memoji/15.png`) in a frosted-glass pill
- Segmented tab switcher (Sign In / Register) — no separate screen navigation
- Frosted glass card (`rgba(255,255,255,0.68)`) with `border: 1px solid rgba(255,255,255,0.60)`
- Icon-prefixed input fields, dark-pill submit button with arrow icon
- Soul Sync TTL picker retained in Register form
- Google + Apple SSO pill buttons
- `RegisterScreen.tsx` → thin `navigation.replace('Login')` redirect (back-stack clean)
- `npx tsc --noEmit` ✅ · ESLint 0 errors ✅


### Design Language Goals
| Element | Target Spec (from `design.md` / mock) |
|---|---|
| App background | `#F6F6F8` (light canvas) |
| Glass dark overlay | `rgba(20, 20, 22, 0.65)` + `backdrop-filter: blur(20px)` |
| Glass light overlay | `rgba(255, 255, 255, 0.35)` |
| Accent blue | `#0084FF` (verified badge, interactive links) |
| Live / danger dot | `#FF3B30` |
| Active pill (nav) | White circle `#FFFFFF`, 48×48px, icon `#0F0F0F` |
| Primary text | `#0D0E11` |
| Secondary text | `#6C727F` |
| Tertiary text | `#9CA3AF` |
| Card radius | 28px |
| Button radius | 20px pill |
| Floating nav | Dark glass capsule, 85% width, 64px tall, `bottom: 24px` |
| Font | Plus Jakarta Sans (Google Font — requires native linking) |

---

## Compatibility Notes

The current app uses:
- **NativeWind v4** with `tailwind.config.js` token system (`C.*` in `src/theme/colors.ts`)
- **Existing floating nav bar** in `src/layout/FloatingTabBar.tsx` (dark glass, semi-transparent)
- **PostCard** (`src/components/HomeScreen/PostCard.tsx`) — text-based "Whisper" cards, no full-bleed media support yet
- **ProfileHeader** (`src/components/profileScreen/ProfileHeader.tsx`) — left-aligned banner + squircle avatar, NOT centred circular

Key deltas from mock HTML to implement:
1. **New glass tokens** (`glassDark`, `glassLight`, `accentBlue`, `statusLive`, `bgMain`, `surfaceMuted`) — extend `src/theme/colors.ts` and `tailwind.config.js`
2. **Top Header component** — missing; currently no sticky translucent top bar
3. **Story Highlight Bar** — missing entirely; needs new component
4. **Feed cards are text-based** — mock shows full-bleed 480px media cards with frosted glass overlays; this is a new `MediaFeedCard` variant
5. **Profile layout** — centred avatar + 3-col split stats + pill action buttons + masonry grid vs current left-aligned + horizontal icon stats

---

## Phase Checklist

### Phase A — Glassmorphic Token Extensions ⏳ Pending

Goal: Add the new Babagang colour and surface tokens without breaking the existing Phases 0–7 system.

**`src/theme/colors.ts`**
- [ ] Add `glassDark: 'rgba(20, 20, 22, 0.65)'`
- [ ] Add `glassLight: 'rgba(255, 255, 255, 0.35)'`
- [ ] Add `glassBorder: 'rgba(255, 255, 255, 0.18)'`
- [ ] Add `accentBlue: '#0084FF'` (distinct from existing `brand` purple — used for verified badge only)
- [ ] Add `statusLive: '#FF3B30'` (matches existing `danger`, alias or duplicate)
- [ ] Add `bgMain: '#F6F6F8'` (light canvas — currently `paper.base: #FFFFFF`; this is slightly warm grey)
- [ ] Add `surfaceMuted: '#F0F0F3'` (inactive pill backgrounds)
- [ ] Add `textPrimaryGlass: '#0D0E11'` and `textSecondaryGlass: '#6C727F'` (babagang palette aligns closely with current `content.*` tokens — document mapping or alias)

**`tailwind.config.js`**
- [ ] Add `glass-dark`, `glass-light`, `glass-border` color classes
- [ ] Add `accent-blue` class
- [ ] Add `bg-main`, `surface-muted` classes
- [ ] Confirm existing `radius-card (24px)` → extend to `28px` variant (`radius-card-lg`)

**Verification**
- [ ] `npx tsc --noEmit` passes
- [ ] `npx eslint src/ App.tsx` passes (0 errors)

---

### Phase B — Top Header Bar Component ⏳ Pending

Goal: Build the sticky `56px` glassmorphic top header matching the mock.

**Mock spec (`design.md` §5A, mock HTML lines 601–620)**
- Height: 56px
- Background: `rgba(246, 246, 248, 0.85)` with `backdrop-filter: blur(12px)`
- Left: Circular icon button `36×36px`, border `1px solid rgba(0,0,0,0.08)`, 4-grid menu SVG
- Centre: App title text `20px bold` (e.g. "VibeNet" or screen-specific title)
- Right: Circular icon button, bell SVG + red live dot `8×8px` (top-right of button, `border: 2px white`)

**Files to create / modify**
- [ ] **[NEW]** `src/components/layout/GlassTopHeader.tsx`
  - Props: `title: string`, `onPressMenu?: () => void`, `onPressBell?: () => void`, `unreadCount?: number`
  - Sticky at top, uses `useSafeAreaInsets().top` for padding
  - Backdrop blur via `style` (NativeWind cannot express `backdrop-filter`; use a
    semi-transparent background colour instead on RN — `rgba(246,246,248,0.92)` solid approximation)
- [ ] **MODIFY** `src/screens/NewsfeedScreen.tsx` — replace current `Search` header area with `GlassTopHeader`
- [ ] **MODIFY** `src/screens/ProfileScreen.tsx` — wire `GlassTopHeader` with title `'Profile'`

**Verification**
- [ ] `npx tsc --noEmit` passes
- [ ] Header visible on both screens, title updates per screen

---

### Phase C — Story Highlight Bar ⏳ Pending

Goal: Horizontal scrolling story strip with 60px avatars, LIVE badge, and username labels.

**Mock spec (`design.md` §5B, mock HTML lines 631–673)**
- Container: `padding: 16px 20px`, `gap: 16px`, horizontal scroll
- Avatar unit: `60×60px` circle, `border: 2px solid white`, subtle shadow
- Story ring (has-story): inner `2px` blue border (`#0084FF`) on avatar
- Live badge: absolute bottom-centre capsule, dark glass bg, white `LIVE` text `9px bold uppercase`
- Username label: `12px` below avatar, max `64px` width, truncated

**Files to create / modify**
- [ ] **[NEW]** `src/components/HomeScreen/StoryHighlightBar.tsx`
  - Props: `stories: StoryItem[]` where `StoryItem = { id, name, avatarUri, isLive, hasStory }`
  - `FlatList` horizontal, keyExtractor by id
- [ ] **[NEW or MODIFY]** `src/types/index.ts` — add `StoryItem` type
- [ ] **[NEW]** `src/data/mockStories.ts` — 5 sample entries (My Story, elena_r [LIVE], marcus_v, chloe_d, david_k) using existing Unsplash URIs from mock HTML
- [ ] **MODIFY** `src/screens/NewsfeedScreen.tsx` — insert `StoryHighlightBar` below `GlassTopHeader`, above feed cards

**Verification**
- [ ] `npx tsc --noEmit` passes
- [ ] Horizontal scroll renders, live badge visible on `elena_r` entry

---

### Phase D — Glassmorphic Media Feed Card ⏳ Pending

Goal: New full-bleed media card variant matching the mock's `feed-card` style (480px tall,
frosted glass top overlay, bottom gradient scrim with caption + stat pills).

> [!NOTE]
> The existing `PostCard` handles text "Whisper" posts. This new `MediaFeedCard` is a
> **separate component** for photo/video feed posts. Both will coexist.

**Mock spec (`design.md` §5C, mock HTML lines 679–753)**
- Card: full-width, `480px` height, `border-radius: 28px`, `overflow: hidden`
- Background: cover image (`background-size: cover; background-position: center`)
- **Top frosted glass banner** (absolute, inset 12px from edges, 52px tall, `border-radius: 20px`):
  - Background: `rgba(20, 20, 22, 0.65)` + blur
  - Left: `34px` circle avatar + name (13px 600 white) + verified check + handle (11px white/70%)
  - Right: 3-dot overflow SVG (white)
- **Bottom gradient scrim** (absolute, bottom 0, full width):
  - `linear-gradient(transparent, rgba(0,0,0,0.85))`
  - Caption text: `13px` white
  - Hashtags: `#0084FF`
  - Stats row: heart icon + count, comment icon + count, share icon + count (12px 600 white)
- Card corner radius `28px` (`radius-card-lg` token from Phase A)

**Files to create / modify**
- [ ] **[NEW]** `src/components/HomeScreen/MediaFeedCard.tsx`
  - Props: `media: { uri: string; type: 'image' | 'video' }`, `author: AuthorInfo`, `caption: string`, `hashtags: string[]`, `stats: { likes, comments, shares }`
  - Uses `Image` (RN) as background; top glass overlay + bottom scrim as `View` with absolute positioning
  - Tap author info → `onPressAuthor()` callback
- [ ] **[NEW]** `src/types/index.ts` additions — `MediaFeedPost` type
- [ ] **[NEW]** `src/data/mockMediaFeed.ts` — 2 sample entries (Elena Rostova architecture photo, Marcus Vance valley mist photo) using Unsplash URIs from mock
- [ ] **MODIFY** `src/screens/NewsfeedScreen.tsx`
  - Add `MediaFeedCard` list section above or interleaved with existing `PostCard` Whisper feed
  - Show `mockMediaFeed` data for now; swap with real API later

**Verification**
- [ ] `npx tsc --noEmit` passes
- [ ] Media cards render at full width with correct overlay layers

---

### Phase E — Floating Glass Bottom Nav Alignment ⏳ Pending

Goal: Align existing `FloatingTabBar` styling exactly with the Babagang mock spec.

**Mock spec (`design.md` §5E, mock HTML lines 549–592, 861–886)**
- Nav container: `width: min(320px, 85%)`, `height: 64px`, `bottom: 24px`
- Background: `rgba(25, 25, 28, 0.75)` + `backdrop-filter: blur(20px)` + `border: 1px solid rgba(255,255,255,0.18)`
- **Active state**: white solid circle `48×48px`, icon dark `#0F0F0F`, `transform: scale(1.05)`
- **Inactive state**: white/grey stroke icons, `opacity: 0.6`
- Nav icons (5): Home, Search, Add (+), Heart/Notifications, Profile

**Current state**: `FloatingTabBar` has 4 tabs (home, messages, notifications, profile) + gradient centre `+` button. Active = brand-coloured icon + faded pill bg. Needs alignment to white-pill-on-dark-glass spec.

- [ ] **MODIFY** `src/layout/FloatingTabBar.tsx`
  - Update `TabIcon` active pill from `bg-brand/15` (transparent coloured) → solid `bg-white` (`#FFFFFF`) with scaled dark icon fill
  - Update inactive icon opacity to `0.6`
  - Verify container width/height: `width: min(320px, 85%)`, `height: 64px`, `bottom: 24px`
  - Keep the existing 5-button layout (home, messages, +, notifications, profile) — already matches mock's 5-icon pattern

**Verification**
- [ ] Active tab shows white circle pill with dark icon
- [ ] Inactive icons are visible at reduced opacity
- [ ] `npx tsc --noEmit` passes

---

### Phase F — Glassmorphic Profile Screen Restructure ⏳ Pending

Goal: Restructure `ProfileScreen` and `ProfileHeader` to match Babagang profile layout.

**Mock spec (`design.md` §5D, mock HTML lines 761–852)**

#### F1 — Hero Banner + Centred Circular Avatar
- Hero banner: `140px` height, atmospheric dark gradient/image background
- Avatar: `90×90px` circle (NOT squircle), `border: 4px solid white`, centred below banner overlapping by `~45px`
- Current: left-aligned squircle avatar, 80px, `border-4` white border — needs centering + shape change + size increase

#### F2 — Bio Section (Centred)
- Name row: centred, `18px 700`, + verified checkmark (if applicable)
- Handle: centred, `13px` secondary text
- Bio text: centred, `13px`, `max-width: 320px`
- Current: left-aligned — needs `text-center` + `align-items: center` wrapper

#### F3 — 3-Column Split Stats Counter
- Container: full-width, `padding: 12px 0`, top + bottom hairline borders, `margin: 20px 0`
- 3 columns: Followers | Following | Posts, separated by `1px` vertical dividers
- Each column: number `16px 700` + label `12px 500` secondary
- Current: horizontal icon-stat row (Thoughts, Friends, Reactions) — needs full replace

#### F4 — 3 Pill Action Buttons (Equal Width)
- Row: `gap: 10px`, all `flex: 1`, `height: 40px`, `border-radius: 20px`
- Follow: `bg: text-primary` (dark), `color: white` — primary CTA
- Message: `bg: surface-muted`, `color: text-primary` — secondary
- Insight: `bg: surface-muted`, `color: text-primary` — secondary
- Current: Edit + Share Profile — button labels and purpose change

#### F5 — Icon-Only Tab Bar (Grid | Video | Heart | Bookmark)
- Row: 4 tabs equally spaced, `border-bottom` hairline
- Active: icon in primary colour + `32px wide, 3px tall, border-radius: 2px` solid bottom indicator bar
- Tab icons (SVG): Grid (posts), Video, Heart (liked), Bookmark (saved)
- Current: `ProfileTabs` component with label text + icon — needs icon-only + bottom bar indicator

#### F6 — 2-Column Staggered Masonry Grid
- `grid-template-columns: 1fr 1fr`, `gap: 12px`, `padding: 16px 20px`
- Odd cards: `height: 210px`, even cards: `height: 160px` → staggered appearance
- Each card: `border-radius: 20px`, cover image, bottom-left glassmorphic like count pill
- Current: list of `PostCard` text whispers — masonry is a new layout

**Files to modify**
- [ ] **MODIFY** `src/components/profileScreen/ProfileHeader.tsx`
  - Centre avatar position (absolute, centered horizontally)
  - Change avatar shape from squircle to circle (`shape="circle"`)
  - Add `90px` size, `4px` white border
  - Centre all text content
  - Replace stat row with 3-column split stats counter (Followers | Following | Posts) — requires new props: `followersCount`, `followingCount`; remove `reactionsCount`, rename `postsCount`
  - Add 3 pill action buttons (Follow, Message, Insight) as `actions` slot content — or extract to `ProfileActionButtons.tsx`
- [ ] **[NEW]** `src/components/profileScreen/ProfileActionButtons.tsx`
  - Props: `onFollow`, `onMessage`, `onInsight`, `isFollowing?: boolean`
- [ ] **MODIFY** `src/components/profileScreen/ProfileTabs.tsx`
  - Icon-only mode: hide label text
  - Add solid `3×32px` bottom bar indicator on active tab (not the current `border-b-2 -mb-px` approach)
  - Tab icons: Grid (existing), VideoIcon, HeartIcon, BookmarkIcon
- [ ] **[NEW]** `src/components/profileScreen/MasonryGrid.tsx`
  - Props: `items: GridItem[]` where `GridItem = { id, imageUri, likeCount }`
  - Renders 2-column alternating heights using a custom layout approach (split items into left/right column arrays by index)
  - Each cell: `Image` + bottom-left glass like-count pill
- [ ] **MODIFY** `src/screens/ProfileScreen.tsx`
  - Update `ProfileHeader` props (new stat fields, centred layout)
  - Switch profile tab from `thoughts | friends | settings` to `posts | videos | liked | saved`
  - Replace post list with `MasonryGrid` for the posts tab
  - Keep settings & friends accessible via settings button in header menu (or keep as additional tabs)

**Verification**
- [ ] `npx tsc --noEmit` passes
- [ ] Avatar visually centred below hero banner
- [ ] 3-column stats render with vertical dividers
- [ ] Masonry grid alternates heights

---

### Phase G — Polish & Verification ⏳ Pending

- [ ] Review all new components for consistent use of Phase A tokens (`glassDark`, `accentBlue`, etc.)
- [ ] Ensure all existing Phase 0–7 screens are unbroken (auth, chat, notifications, locket)
- [ ] `npx tsc --noEmit` clean
- [ ] `npx eslint src/ App.tsx` clean (0 errors)
- [ ] `npx jest` all tests pass
- [ ] Document any deferred items in this file

---

## Deferred / Risk Items

| Item | Risk | Decision |
|---|---|---|
| `backdrop-filter: blur()` on RN | Not natively supported in RN without a library (`@react-native-community/blur` needs pod install + rebuild) | Use high-opacity solid glass approximation instead (`rgba(20,20,22,0.92)`) — visually close, zero native dep |
| Plus Jakarta Sans font | Needs native font asset linking + pod install + rebuild | Deferred; system font (`-apple-system`) with matched weight hierarchy |
| `linear-gradient` as card background | Already handled via `react-native-svg` `LinearGradient` (from UI_REDESIGN_PLAN Phase 0) | Safe to use |
| Measured sliding tab indicator | Needs `onLayout` per-tab measurement — unverifiable without device | Static `3px` bottom border on active tab div approach (approximation) |
| Masonry column heights on all screens | Alternating static heights (`210/160px`) may clip portrait images oddly | Use `aspect-ratio: 4/5` or fixed heights with `resizeMode: cover` |

---

## File Map

```
src/
├── components/
│   ├── HomeScreen/
│   │   ├── StoryHighlightBar.tsx        [NEW — Phase C]
│   │   ├── MediaFeedCard.tsx            [NEW — Phase D]
│   │   ├── PostCard.tsx                 [existing — unchanged]
│   │   └── ...
│   ├── layout/
│   │   └── GlassTopHeader.tsx           [NEW — Phase B]
│   └── profileScreen/
│       ├── ProfileHeader.tsx            [MODIFY — Phase F1/F2/F3]
│       ├── ProfileActionButtons.tsx     [NEW — Phase F4]
│       ├── ProfileTabs.tsx              [MODIFY — Phase F5]
│       └── MasonryGrid.tsx              [NEW — Phase F6]
├── data/
│   ├── mockStories.ts                   [NEW — Phase C]
│   └── mockMediaFeed.ts                 [NEW — Phase D]
├── layout/
│   └── FloatingTabBar.tsx               [MODIFY — Phase E]
├── screens/
│   ├── NewsfeedScreen.tsx               [MODIFY — Phase B/C/D]
│   └── ProfileScreen.tsx                [MODIFY — Phase F]
├── theme/
│   ├── colors.ts                        [MODIFY — Phase A]
│   └── motion.tsx                       [existing — unchanged]
└── types/
    └── index.ts                         [MODIFY — Phase C/D]

tailwind.config.js                       [MODIFY — Phase A]
docs/
└── GLASSMORPHIC_MOBILE_RESTRUCTURE_PLAN.md   [this file]
```

---

## Progress Summary

| Phase | Scope | Status |
|---|---|---|
| **A** | Token Extensions (glassDark, accentBlue, bgMain…) | ✅ Done |
| **B** | GlassTopHeader Component | ✅ Done |
| **C** | StoryHighlightBar Component | ✅ Done |
| **D** | MediaFeedCard (glassmorphic full-bleed card) | ✅ Done |
| **E** | FloatingTabBar white-pill alignment | ✅ Done |
| **F** | Profile Screen Restructure (hero, stats, pills, masonry) | ✅ Done |
| **G** | Polish & final verification | ✅ Done |

_Round 1 last updated: 2026-08-10_

---

# Round 2 — Design Sketch Fidelity Upgrade

_Added 2026-08-11 · Source of truth: [`docs/designSketch.png`](./designSketch.png)_

## Design Extracted From the Sketch

The sketch is a two-panel iPhone mockup: **left = Feed dashboard**, **right = User profile**. Re-reading
it pixel-by-pixel surfaced several deltas from the currently-shipped Round-1 build.

### Panel 1 — Feed Dashboard
- **Top header**: 4-dot grid menu button (left, circular outline) · title **"Babagang"** centered, ~20px bold ·
  bell button (right, circular outline) with a small red live dot. — *Matches shipped `GlassTopHeader`.* ✅
- **Story bar**: five 60px circular avatars — **Irma, Amanda, Luiz, Nina, Izaa**. The first (Irma) carries a
  small dark **"Live"** capsule pinned to the bottom-centre of the avatar. Names sit ~12px below. — *Matches
  shipped `StoryHighlightBar`, but mock/data labels differ (see Phase J).*
- **Feed card**: full-bleed portrait media, 28px radius. Dark frosted **top glass banner** with 34px avatar +
  **"Alana maesya"** + blue verified tick + **"@Naisyaatxt"** handle + 3-dot overflow. Bottom scrim shows the
  **stats row first** (♥ 1245 · 💬 173 · ➤ 229) and **caption below** it — *note the ordering vs the mock HTML,
  which put caption above stats. Sketch = stats-then-caption.* Caption: "Love your mine #lovetoyou #foryourpage
  #beautifull #popular #peoplefrost" with hashtags tinted blue. — *Phase J.*
- **Bottom nav (CRITICAL)**: a dark glass capsule with **exactly four icons** — **Home · Explore (compass) ·
  Notifications (heart) · Profile (person)**. Home is active: a **solid white circle** with the icon in near-black.
  **There is no centre "+" button and no messages icon in the bar.** — *This contradicts the shipped 5-slot
  `FloatingTabBar`. See Phase H.*

### Panel 2 — User Profile
- **Hero banner**: dark atmospheric mountain/tower landscape, ~140px, flush to the top. — ✅ shipped.
- **Avatar**: 90px circle, 4px white border, **centred**, overlapping the banner by ~45px. — ✅ shipped.
- **Identity block (centred)**: name **"Katty Abrahams"** 18px bold + blue verified tick · bio "I'm delighted to
  introduce myself as a professional model 👋" in secondary grey, ~2 lines, max ~320px. *No separate `@handle`
  line is visible in this sketch* (the mock HTML had one) — treat handle as optional. — *Phase J.*
- **Stats**: three columns **567 K Followers · 1665 Followings · 166 Posts** with hairline top/bottom rules and
  1px vertical dividers. *Note the label is "Followings" (plural) in the sketch.* — ✅ shipped (verify labels).
- **Action buttons**: three equal pills **Follow · Message · Insight**. In the sketch **all three read as light
  `surface-muted` pills** (Follow is not a filled dark CTA here) — softer than the mock's dark primary Follow.
  Flag as a styling decision in Phase J.
- **Tab bar**: four line icons **Grid · Video · Heart · Bookmark**, Grid active with a short solid underline. — ✅ shipped.
- **Masonry**: 2-column staggered image grid, 12px gap, 20px radius, glass like-count pill bottom-left. — ✅ shipped.

### Net new work for Round 2
| # | Delta | Phase |
|---|---|---|
| 1 | Bottom nav must be **4 icons** (Home/Explore/Notifications/Profile), drop messages + centre "+" | **H** |
| 2 | New **Explore (compass)** icon — no such asset exists in `assets/Icon.tsx` today | **H** |
| 3 | Re-home the **create/compose** and **messages** entry points displaced by the nav change | **H** |
| 4 | **Login / Register** screen polish pass to the sketch's soft-glass language | **I** |
| 5 | Feed/profile fidelity: card content ordering, story labels, muted action pills, handle optional | **J** |
| 6 | Polish, regression check of Locket/Chat/Notifications, verification | **K** |

---

## Phase H — Bottom Navigation: Exact Sketch Match ✅ Done 2026-08-11

> **Decision (2026-08-11):** Match the sketch **exactly** — 4 icons, no centre "+", no messages tab.
> This supersedes Round-1 Phase E's "keep the existing 5-button layout" note.

**Target spec (from `designSketch.png`, both panels)**
- Dark glass capsule: `width ≈ min(320px, 85%)`, `height 64px`, `bottom: safe-area + 24px`, full-pill radius,
  `bg rgba(20,20,22,0.65)` approximation, `border 1px rgba(255,255,255,0.18)`, floating-nav shadow.
- **Four** evenly-spaced `44px` touch targets, order left→right:
  1. **Home** — `HomeIcon`
  2. **Explore** — **new** `ExploreIcon` (compass: outer circle + diamond/needle)
  3. **Notifications** — `HeartIcon` (sketch uses a heart here, not the current bell)
  4. **Profile** — `UserIcon`
- **Active** = solid `#FFFFFF` circle (`~48px`, `scale 1.05`), icon `#0F0F0F`. **Inactive** = white/grey stroke at
  `opacity 0.55–0.6`. (Reuse the existing animated-pill `TabIcon` — already correct.)

**Files to modify / create**
- [ ] **MODIFY** `src/assets/Icon.tsx` — add `ExploreIcon` (compass). `HeartIcon` already exists.
- [ ] **MODIFY** `src/layout/FloatingTabBar.tsx`
  - Change `TabKey` from `'home' | 'messages' | 'notifications' | 'profile'` to
    **`'home' | 'explore' | 'notifications' | 'profile'`**.
  - Remove the `messages` `TabIcon`, remove the centre `GradientButton` (`PlusIcon`/`onPressCreate`) and its
    `-mt-8` overhang, and remove the now-unused `onPressCreate` prop.
  - Add the **Explore** `TabIcon` (compass) in slot 2; keep Notifications (switch its glyph `BellIcon → HeartIcon`
    to match the sketch) and Profile.
  - Layout stays `justify-between`, but with 4 children it now reads as evenly spaced per the sketch.
  - Keep the long-press-profile → logout affordance (it's not visible in the sketch but is harmless and preserves
    existing behaviour).
- [ ] **MODIFY** `src/screens/NewsfeedScreen.tsx` (and any other host of `FloatingTabBar`) — update the
  `activeTab`/`onChangeTab` wiring to the new keys and drop the `onPressCreate` prop.
- [ ] **MODIFY** `src/navigation/RootNavigator.tsx` / screen tab handlers — route `explore` to a destination
  (see decision below).

**Re-homing displaced actions (required — do not silently drop them)**
- [ ] **Create / compose (the old centre "+")** → move the entry point to the **top header**: add an optional
  trailing "+" affordance to `GlassTopHeader` (or a small compose button beside the bell), wired to the existing
  `onPressCreate` / `CreateWhisperModal` flow. Posting must remain reachable.
- [ ] **Messages (the old messages tab)** → reach chat from the **grid-menu button** in `GlassTopHeader`
  (opens a menu/sheet that includes Messages), keeping `MessagesListScreen` in the stack. Confirm no dead route.
- [ ] **Explore tab destination** → if no dedicated Explore/search screen exists yet, point it at the existing
  `Search` surface (`src/components/HomeScreen/Search.tsx`) or stub an `ExploreScreen`; note the choice here.

**Verification**
- [ ] Bar renders **4** icons, evenly spaced, active shows white circle + dark icon.
- [ ] Create and Messages both still reachable from their new homes.
- [ ] `npx tsc --noEmit` passes · `npx eslint src/ App.tsx` clean (0 errors).

---

## Phase I — Login / Register Redesign ✅ Done 2026-08-11

Goal: lift the unified auth screen (`src/screens/LoginScreen.tsx`, hosting both Sign In + Register via the
segmented switcher — see "Auth Screen Redesign" note above) to full parity with the Babagang soft-glass language.
The sketch has no auth panel, so `design.md` §2–§4 tokens are authoritative here.

**Target refinements**
- [ ] **Canvas & backdrop** — atmospheric top `ImageBackground` (~45% height) fading into `bgMain #F6F6F8`;
  ensure the fade is a real gradient scrim, not a hard seam.
- [ ] **Frosted card** — `rgba(255,255,255,0.68)` fill, `1px rgba(255,255,255,0.60)` border, `radius-card 28px`,
  `shadow-card`. Confirm it reads as glass over the photo.
- [ ] **Segmented switcher** — Sign In / Register pill selector: active segment = white pill on
  `surfaceMuted #F0F0F3` track, inactive = `text-secondary`. Animate the thumb.
- [ ] **Inputs** — icon-prefixed fields (`IconMail`/`IconUser`/`IconLock` already present), `surfaceMuted` fill,
  `radius-button 20px`, `PLACEHOLDER` colour token, eye-toggle on password.
- [ ] **Primary CTA** — dark pill (`text-primary #0D0E11` bg, white label) with trailing arrow (`IconArrow`),
  full-width, 20px radius — matches the profile "Follow" primary language.
- [ ] **SSO row** — Google + Apple pill buttons on `surface-white` with hairline border; keep existing `IconGoogle`/`IconApple`.
- [ ] **Register extras** — retain the Soul Sync TTL picker; ensure it uses the same pill/token styling.
- [ ] **Typography** — align to the `--font-*` scale in `design.md §3` (system-font weights; Plus Jakarta Sans
    remains deferred, see Risk table).
- [ ] Keep `RegisterScreen.tsx` as the thin `navigation.replace('Login')` redirect (back-stack stays clean).

**Verification**
- [ ] Both tabs switch without a screen navigation; forms validate as before.
- [ ] `npx tsc --noEmit` passes · ESLint clean.

---

## Phase J — Feed & Profile Fidelity Tweaks ⏳ Pending

Small, surgical alignments to the sketch (no structural rewrites).

**Feed (`MediaFeedCard.tsx`, `StoryHighlightBar.tsx`, `src/data/*`)**
- [ ] **Card scrim ordering** — render the **stats row above the caption** (sketch order), or confirm current
  order and decide; document the final choice.
- [ ] **Hashtag tint** — hashtags in captions rendered in `accentBlue #0084FF`, `500` weight.
- [ ] **Story data/labels** — update `src/data/mockStories.ts` toward the sketch set (Irma [Live], Amanda, Luiz,
  Nina, Izaa) or keep existing names but confirm the **Live** capsule renders on the first/live entry only.
- [ ] **Author sample** — mock author "Alana maesya · @Naisyaatxt" + verified tick to match the sketch card.

**Profile (`ProfileHeader.tsx`, `ProfileActionButtons.tsx`)**
- [ ] **Stat labels** — confirm **Followers · Followings · Posts** (sketch uses "Followings" plural) and the
  `567 K` / `1665` / `166` formatting style (space before "K").
- [ ] **Action pills** — sketch shows all three (Follow/Message/Insight) as **light `surface-muted` pills**.
  Decide: keep Round-1's dark primary "Follow", or soften to the sketch's uniform light look. Record the call.
- [ ] **Handle optional** — sketch omits the `@handle` line under the name; make `ProfileHeader` render it only
  when provided (don't force an empty row).

**Verification**
- [ ] Visual spot-check against `designSketch.png` both panels · `npx tsc --noEmit` passes.

---

## Phase K — Round 2 Polish & Verification ⏳ Pending

- [ ] All Round-2 components use Phase A tokens (`glassSurface`, `accentBlue`, `bgMain`, `surfaceMuted`).
- [ ] **Regression**: auth, chat/messages (now via header), notifications, Locket, create-flow all reachable and unbroken.
- [ ] Grep for stale `onPressCreate` / `'messages'` `TabKey` references after Phase H.
- [ ] `npx tsc --noEmit` clean · `npx eslint src/ App.tsx` clean · `npx jest` passes.
- [ ] Update the Progress Summary + this file's "last updated" stamp.

---

## Round 2 Decisions & Risks

| Item | Decision |
|---|---|
| Nav icon count | **4, matching the sketch exactly** (Home / Explore / Notifications / Profile). Drops messages tab + centre "+". |
| Where the "+" goes | Compose entry relocated to `GlassTopHeader` (trailing +), not the tab bar. |
| Where Messages goes | Reached via the header grid-menu; `MessagesListScreen` stays in the nav stack. |
| Notifications glyph | Sketch uses a **heart**, not a bell — switch the notifications tab glyph to `HeartIcon`. |
| Explore destination | Route to existing `Search` surface unless/until a dedicated `ExploreScreen` is built. |
| Auth source of truth | `design.md` tokens (sketch has no auth panel). |
| Font | Plus Jakarta Sans still **deferred** — system fonts with matched weights (unchanged from Round 1). |

---

## Round 2 Progress Summary

| Phase | Scope | Status |
|---|---|---|
| **H** | Bottom nav → exact 4-icon sketch match (+ re-home create/messages) | ✅ Done |
| **I** | Login / Register redesign to soft-glass parity | ✅ Done |
| **J** | Feed & profile fidelity tweaks | ⏳ Pending |
| **K** | Polish & verification | ⏳ Pending |

### Phase H/I implementation notes
- `FloatingTabBar.tsx`: `TabKey` is now `'home' | 'explore' | 'notifications' | 'profile'`; `activeTab` accepts `null`
  for screens with no corresponding tab (used by `MessagesListScreen`, since Messages no longer has a bar slot).
  Notifications glyph switched `BellIcon → HeartIcon` to match the sketch; centre `GradientButton`/`PlusIcon` removed.
- New `ExploreIcon` (compass) added to `src/assets/Icon.tsx`.
- Compose re-homed to `GlassTopHeader`'s new optional `onPressAdd` trailing "+" button (`NewsfeedScreen`,
  `ProfileScreen`). Messages re-homed to the header's grid-menu button (`onPressMenu` → `navigation.navigate('MessagesList')`
  on `NewsfeedScreen`); `ProfileScreen`'s menu button still opens Edit Profile, so its "+" is the only re-homed compose entry there.
- Explore tab routes to the existing inline `Search` toggle on `NewsfeedScreen`; from other screens it navigates Home.
- `LoginScreen.tsx` was already ~95% at spec from the Round-1 "Auth Screen Redesign" work; Phase I applied the two
  remaining deltas — input fields now use `surfaceMuted` fill (was `surface-white`), and the segmented Sign In/Register
  switcher got a real animated sliding thumb (`Animated.Value` + `onLayout` width measurement) instead of a static
  per-segment background swap.
- `npx tsc --noEmit`: 0 errors. `npx eslint src/ App.tsx`: 0 errors (161 pre-existing warnings, none new).

_Round 2 last updated: 2026-08-11_
