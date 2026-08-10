# Glassmorphic Mobile UI — Babagang Design System
## Progress Tracking Plan

> Source design spec: [`docs/design.md`](./design.md)
> Source HTML prototype: [`docs/mockDashboard&Profile.txt`](./mockDashboard&Profile.txt)
> Previous redesign log: [`docs/UI_REDESIGN_PLAN.md`](./UI_REDESIGN_PLAN.md)

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

_Last updated: 2026-08-10_
