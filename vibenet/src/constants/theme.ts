import { Platform } from 'react-native';

const tintColorLight = '#0D0E11';
const tintColorDark = '#FFFFFF';

export const Fonts = {
  sans: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  }),
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'Courier New, monospace',
  }),
};

export const Colors = {
  // Classic light/dark maps for compatibility with starter components
  light: {
    text: '#0D0E11',
    textSecondary: '#6C727F',
    textTertiary: '#9CA3AF',
    background: '#F6F6F8',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E8E8EC',
    border: 'rgba(0, 0, 0, 0.08)',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9CA3AF',
    textTertiary: '#6C727F',
    background: '#0D0E11',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    backgroundElement: '#141416',
    backgroundSelected: '#252528',
    border: 'rgba(255, 255, 255, 0.1)',
  },

  // Primary canvas & surfaces
  bgMain: '#F6F6F8',
  bgDark: '#0D0E11',
  surfaceWhite: '#FFFFFF',
  surfaceMuted: '#F0F0F3',
  surfaceSubtle: '#E8E8EC',
  surfaceDark: '#141416',
  
  // Glassmorphic overlays
  surfaceDarkGlass: 'rgba(20, 20, 22, 0.75)',
  surfaceLightGlass: 'rgba(255, 255, 255, 0.85)',
  surfaceSuperGlass: 'rgba(255, 255, 255, 0.45)',
  glassBorder: 'rgba(255, 255, 255, 0.6)',
  glassBorderDark: 'rgba(255, 255, 255, 0.1)',
  
  // Typography
  textPrimary: '#0D0E11',
  textSecondary: '#6C727F',
  textTertiary: '#9CA3AF',
  textPlaceholder: '#B0B5C0',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: 'rgba(255, 255, 255, 0.7)',
  
  // Accents & Badges
  accentBlue: '#0084FF',
  accentPink: '#E1306C',
  accentPurple: '#833AB4',
  accentOrange: '#FD1D1D',
  accentYellow: '#FCAF45',
  
  // Status
  statusLive: '#FF3B30',
  statusOnline: '#34C759',
  statusCloseFriend: '#10B981',
  statusWarning: '#FF9500',
  
  // Floating nav pill
  navPillBg: 'rgba(20, 20, 22, 0.88)',
  navPillActiveIcon: '#0D0E11',
  navPillActiveBg: '#FFFFFF',
  navPillInactiveIcon: '#9CA3AF',

  // Story & Highlight Gradients
  storyGradient: ['#FCAF45', '#FF5252', '#C13584', '#833AB4'],
  closeFriendGradient: ['#10B981', '#059669', '#047857'],
  darkGlassGradient: ['rgba(30, 30, 35, 0.85)', 'rgba(15, 15, 18, 0.95)'],
  primaryButtonGradient: ['#0D0E11', '#1F242D'],
};

export type ThemeColor = keyof typeof Colors.light;

export const Radii = {
  sm: 10,
  md: 16,
  lg: 22,
  card: 28,
  xl: 32,
  pill: 9999,
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 32,
  eight: 40,
  nine: 48,
  ten: 56,
};

export const Typography = {
  titleLarge: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.6,
    color: Colors.textPrimary,
  },
  titleMedium: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    color: Colors.textPrimary,
  },
  titleSmall: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    color: Colors.textPrimary,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: -0.2,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: -0.1,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    color: Colors.textTertiary,
  },
  button: {
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  badge: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
    textTransform: 'uppercase' as const,
  },
};

export const Shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
    },
    android: {
      elevation: 3,
    },
    web: {
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
    },
  }),
  cardHover: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 24,
    },
    android: {
      elevation: 6,
    },
    web: {
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
    },
  }),
  floatingNav: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.22,
      shadowRadius: 30,
    },
    android: {
      elevation: 10,
    },
    web: {
      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.2)',
    },
  }),
  button: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
    },
    android: {
      elevation: 2,
    },
    web: {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
    },
  }),
};

export const MaxContentWidth = 430;
export const BottomTabInset = 84;
