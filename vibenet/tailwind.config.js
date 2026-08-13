/** @type {import('tailwindcss').Config} */
// Color hexes here MUST stay in sync with src/theme/colors.ts (the same values, exported
// as JS constants for SVG icon props/placeholderTextColor/tintColor that `className`
// strings can't reach). See frontend/docs/UI_REDESIGN_PLAN.md §2.1/§2.2.
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F1EEFF',
          100: '#E4DEFF',
          200: '#C7BCFF',
          300: '#A692FF',
          400: '#8A6BFF',
          500: '#6C4CFF',
          600: '#5A34F5',
          700: '#4A28D6',
          800: '#3A1FA8',
          900: '#2A167A',
          DEFAULT: '#6C4CFF',
        },
        accent: {
          300: '#FF9BC0',
          400: '#FF6FA3',
          500: '#FF4D8D',
          600: '#F5297B',
          DEFAULT: '#FF4D8D',
        },
        spark: {
          400: '#E1FF6B',
          500: '#D6FF3F',
          600: '#B8E62E',
          DEFAULT: '#D6FF3F',
        },
        success: '#2FD670',
        danger: '#FF3B5C',
        warning: '#FFB020',
        ink: {
          base: '#0B0710',
          raised: '#15101F',
          overlay: '#1E1730',
          input: '#221A36',
        },
        paper: {
          base: '#FFFFFF',
          raised: '#F6F4FB',
          overlay: '#EDEAF6',
        },
        content: {
          strong: '#12101A',
          muted: '#6B6577',
          faint: '#9C97AA',
          'strong-dark': '#F5F3FA',
          'muted-dark': '#B5AEC6',
          'faint-dark': '#7C7690',
        },
        hairline: {
          light: '#ECE8F5',
          dark: '#2A2140',
        },
        'glass-surface': '#141416',
        'accent-blue': '#0084FF',
        'bg-main': '#F6F6F8',
        'surface-muted': '#F0F0F3',
      },
      borderRadius: {
        field: '16px',
        card: '24px',
        hero: '30px',
        blob: '34px',
        'card-lg': '28px',
      },
      fontSize: {
        display: ['34px', { fontWeight: '800', letterSpacing: '-0.02em' }],
        title: ['26px', { fontWeight: '800', letterSpacing: '-0.02em' }],
        headline: ['17px', { fontWeight: '700' }],
      },
    },
  },
  plugins: [],
};
