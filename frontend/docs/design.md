# Design System Specification: Modern Glassmorphic Social UI

## 1. Executive Summary & Design Philosophy

This design system represents a **Modern Glassmorphic & Soft-Modernist Mobile UI** designed for next-generation content creation and social networking platforms (as showcased in the *Babagang* application UI).

### Core Aesthetic Pillars
- **Frosted Glassmorphism**: High-blur translucent floating overlays (`backdrop-filter: blur(20px)`) that float gracefully over visual media.
- **Soft Geometry**: Generous corner radii (`24px`–`32px` on cards, full pills on navigation controls) creating an approachable, ultra-smooth touch interface.
- **High-Contrast Media Focus**: Clean, light-mode canvas with dark charcoal accents that allows vibrant, warm-toned photography to take center stage.
- **Micro-Elevation & Floating Mechanics**: Floating bottom navigation pill and floating top bar controls that give depth without visual clutter.

---

## 2. Color Palette & Palette Tokens

### Primary & Background Colors
| Token Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| `--bg-main` | `#F6F6F8` | Main app background canvas |
| `--surface-white` | `#FFFFFF` | Card containers, primary popovers, profile badges |
| `--surface-muted` | `#F0F0F3` | Soft pill buttons, inactive tab backgrounds |
| `--surface-dark-glass` | `rgba(20, 20, 22, 0.65)` | Translucent overlays on imagery, floating nav bar |
| `--surface-light-glass`| `rgba(255, 255, 255, 0.35)` | Light frosted badges and overlay controls |

### Typography & Icon Colors
| Token Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| `--text-primary` | `#0D0E11` | Headers, user titles, key metrics |
| `--text-secondary` | `#6C727F` | Handles (`@username`), timestamps, stats labels |
| `--text-tertiary` | `#9CA3AF` | Inactive tab icons, subtle captions |
| `--text-on-dark` | `#FFFFFF` | Text overlaid on images or dark glass panels |

### Accent & Status Indicators
| Token Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| `--accent-blue` | `#0084FF` | Verified checkmark badge, primary interactive links |
| `--status-live` | `#FF3B30` | Live broadcast status badge, notification ping dot |
| `--active-pill` | `#FFFFFF` | High-contrast white background for selected navigation icon |
| `--active-pill-icon` | `#0F0F0F` | Icon color inside active white floating pill |

---

## 3. Typography System

### Recommended Font Families
- **Primary Sans**: `Plus Jakarta Sans`, `Inter`, or `SF Pro Display / Text`
- **Fallback**: System `-apple-system`, `BlinkMacSystemFont`, `sans-serif`

### Type Scale & Hierarchy

```css
/* Typography Scale Tokens */
--font-header-title: bold 20px/1.25 'Plus Jakarta Sans', sans-serif;
--font-profile-name:  600 18px/1.3  'Plus Jakarta Sans', sans-serif;
--font-stat-number:   700 16px/1.2  'Plus Jakarta Sans', sans-serif;
--font-stat-label:    500 12px/1.4  'Plus Jakarta Sans', sans-serif;
--font-card-author:   600 14px/1.3  'Plus Jakarta Sans', sans-serif;
--font-card-handle:   400 12px/1.4  'Plus Jakarta Sans', sans-serif;
--font-body-caption:  400 13px/1.5  'Plus Jakarta Sans', sans-serif;
--font-hashtag:       500 13px/1.5  'Plus Jakarta Sans', sans-serif;
--font-button-label:  600 13px/1.0  'Plus Jakarta Sans', sans-serif;
```

---

## 4. Geometry, Radii & Spacing Grid

### Border Radius Tokens
- **Pill / Circular**: `border-radius: 9999px` (Avatars, floating nav, action buttons, live badges)
- **Large Container / Card**: `border-radius: 28px` (Main feed media cards, profile headers)
- **Medium Container**: `border-radius: 20px` (Inner overlays, secondary widgets)
- **Small Element**: `border-radius: 12px` (Dropdown menus, small tags)

### Elevation & Shadow Rules
```css
/* Floating Navigation Glass Shadow */
--shadow-floating-nav: 0px 12px 32px rgba(0, 0, 0, 0.18);

/* Card Soft Elevation */
--shadow-card: 0px 4px 20px rgba(0, 0, 0, 0.04);

/* Avatar Glow / Border */
--avatar-border: 2px solid #FFFFFF;
```

### Backdrop Blur Settings
```css
--glass-blur-heavy: blur(24px) saturate(180%);
--glass-blur-medium: blur(12px) saturate(150%);
```

---

## 5. UI Component Specifications

### A. Header Navigation Bar
- **Height**: `56px`
- **Left Icon**: Circular outline button (`36px × 36px`) with 4-grid menu icon.
- **Center Element**: App Title / Branding (`Babagang`), `20px` bold, centered.
- **Right Icon**: Notification bell icon with red status dot top-right (`8px × 8px`).

### B. Story Highlight Bar
- **Container**: Horizontal scroll view with `16px` item gap.
- **Avatar Unit**:
  - Outer Diameter: `60px × 60px`
  - Image Radius: Circular (`50%`)
  - Live Indicator: Dark capsule overlapping bottom with bold white "Live" text (`10px`).
  - Name Label: `12px` font below avatar, single-line truncated.

### C. Feed Media Cards
- **Container**: Aspect ratio variable (3:4 or 4:5 vertical), `border-radius: 28px`, clipped overflow.
- **Top Overlay Banner**:
  - Position: Absolute top (`12px` inset).
  - Background: Frosted dark glass `rgba(0,0,0,0.35)` with `backdrop-filter: blur(12px)`.
  - Layout: Flexbox row containing profile picture (`32px`), name + handle column, verified checkmark, and overflow action (`...`) menu.
- **Bottom Caption Overlay**:
  - Text: Clean white typography over subtle bottom gradient scrim (`linear-gradient(transparent, rgba(0,0,0,0.7))`).
  - Social Stats: Inline icons for Likes, Comments, Shares with counter labels (`1245`, `173`, `229`).

### D. Profile Screen Structure
1. **Hero Banner**: Dark atmospheric landscape banner (`height: 140px`) with rounded top edges.
2. **Central Profile Avatar**: `90px × 90px` circular image overflowing hero banner with thick white border (`4px`).
3. **Bio Section**: Centered typography with single emoji accent.
4. **Stats Counter**: 3-column horizontal split (Followers | Followings | Posts) with subtle vertical separators (`1px solid #E5E7EB`).
5. **Action Buttons**: 3 equal-width pill buttons (`Follow` [Primary Dark/Light], `Message`, `Insight`) with rounded pill shape (`20px`).
6. **Tab Indicator**: Row of line icons (Grid, Video, Heart, Bookmark) with active tab showing a solid black bottom indicator bar (`width: 32px`, `height: 3px`, `border-radius: 2px`).
7. **Content Grid**: 2-column Pinterest-style staggered masonry grid with `12px` gap and `20px` card corner radii.

### E. Floating Glass Bottom Navigation Bar
- **Dimensions**: Floating capsule, `width: approx 85%`, `height: 64px`, `margin-bottom: 24px`.
- **Background**: Frosted dark glass `rgba(25, 25, 28, 0.75)` with `backdrop-filter: blur(20px)`.
- **Active State**: White solid pill container (`48px × 48px` circle or rounded rectangle) enclosing active icon in dark fill (`#0F0F0F`).
- **Inactive State**: Muted white/grey stroke icons with `0.6` opacity.

---

## 6. Ready-to-Use CSS Tokens Template

```css
:root {
  /* Color Tokens */
  --color-bg: #F6F6F8;
  --color-surface: #FFFFFF;
  --color-text-primary: #0D0E11;
  --color-text-muted: #6C727F;
  --color-accent-blue: #0084FF;
  --color-glass-dark: rgba(20, 20, 22, 0.65);
  --color-glass-border: rgba(255, 255, 255, 0.18);

  /* Radius Tokens */
  --radius-card: 28px;
  --radius-pill: 9999px;
  --radius-button: 20px;

  /* Elevation */
  --shadow-nav: 0 16px 32px -4px rgba(0, 0, 0, 0.2);
  --glass-blur: blur(20px) saturate(180%);
}

/* Floating Navigation Bar CSS Snippet */
.floating-nav-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: min(320px, 90%);
  height: 64px;
  background: var(--color-glass-dark);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--color-glass-border);
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-nav);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 12px;
  z-index: 1000;
}

.nav-item.active {
  background: #FFFFFF;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000000;
}
```
