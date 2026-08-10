// Single source of truth for color values that Tailwind classNames can't reach:
// SVG icon color/fill/stroke props, placeholderTextColor, tintColor, style={{ color }}.
// Keep in sync with the `theme.extend.colors` block in tailwind.config.js — same hexes,
// two representations, because NativeWind className strings can't be read by RN's raw
// color props. See frontend/docs/UI_REDESIGN_PLAN.md §2.1/§2.2.
export const C = {
  brand: '#6C4CFF',
  brand600: '#5A34F5',
  brand700: '#4A28D6',
  accent: '#FF4D8D',
  accent600: '#F5297B',
  spark: '#D6FF3F',
  success: '#2FD670',
  danger: '#FF3B5C',
  warning: '#FFB020',

  inkBase: '#0B0710',
  inkRaised: '#15101F',
  inkOverlay: '#1E1730',
  inkInput: '#221A36',

  paperBase: '#FFFFFF',
  paperRaised: '#F6F4FB',
  paperOverlay: '#EDEAF6',

  contentStrong: '#12101A',
  contentMuted: '#6B6577',
  contentFaint: '#9C97AA',
  onDark: '#F5F3FA',
  mutedDark: '#B5AEC6',
  faintDark: '#7C7690',

  white: '#FFFFFF',
  black: '#000000',

  // ── Glassmorphic surface tokens (Babagang design system)
  glassSurface: '#141416',      // use with opacity modifier for dark glass overlays
  accentBlue: '#0084FF',        // verified badge, interactive links
  bgMain: '#F6F6F8',            // light warm-grey canvas
  surfaceWhiteGlass: '#FFFFFF', // white card surface
  surfaceMuted: '#F0F0F3',      // inactive pill backgrounds
} as const;

// Default placeholderTextColor across the app — was hardcoded '#9CA3AF' in ~15 files.
export const PLACEHOLDER = C.contentFaint;
