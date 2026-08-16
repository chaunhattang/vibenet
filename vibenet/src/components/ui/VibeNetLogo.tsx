import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Path,
  G,
} from 'react-native-svg';

export interface VibeNetLogoProps {
  size?: number;
  variant?: 'vibe' | 'glyph';
  style?: ViewStyle;
}

/**
 * VibeNetLogo renders the signature vector emblem for VibeNet.
 * Perfectly calibrated for both Web and Native with contour-matching shadows and zero clipping artifacts.
 */
export const VibeNetLogo: React.FC<VibeNetLogoProps> = ({
  size = 58,
  variant = 'vibe',
  style,
}) => {
  const cornerRadius = Math.round(size * 0.3); // 30% corner radius for squircle

  if (variant === 'glyph') {
    return (
      <View style={[{ width: size, height: size, backgroundColor: 'transparent' }, style]}>
        <Svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
          <Defs>
            <LinearGradient id="vibeGlyphGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#38BDF8" />
              <Stop offset="45%" stopColor="#6366F1" />
              <Stop offset="80%" stopColor="#A855F7" />
              <Stop offset="100%" stopColor="#EC4899" />
            </LinearGradient>
          </Defs>

          {/* Dynamic V-Wave Ribbon */}
          <Path
            d="M22 28 C26 28 30 31 34 38 L50 68 L66 38 C70 31 74 28 78 28 C85 28 89 34 85 42 L58 86 C54 92 46 92 42 86 L15 42 C11 34 15 28 22 28 Z"
            fill="url(#vibeGlyphGrad1)"
          />
          {/* Pulsing Sparkle Connection Core */}
          <Path
            d="M50 20 C50.5 28 56 33.5 64 34 C56 34.5 50.5 40 50 48 C49.5 40 44 34.5 36 34 C44 33.5 49.5 28 50 20 Z"
            fill="#EC4899"
          />
        </Svg>
      </View>
    );
  }

  // Primary Vibe Squircle Badge
  return (
    <View
      style={[
        styles.glowContainer,
        {
          width: size,
          height: size,
          borderRadius: cornerRadius,
        },
        style,
      ]}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ overflow: 'visible', borderRadius: cornerRadius }}>
        <Defs>
          {/* Squircle Dynamic Aura Gradient */}
          <LinearGradient id="vibeBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF416C" />
            <Stop offset="30%" stopColor="#8A2387" />
            <Stop offset="70%" stopColor="#6A11CB" />
            <Stop offset="100%" stopColor="#2575FC" />
          </LinearGradient>

          <LinearGradient id="ribbonGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="60%" stopColor="#F0F4FF" />
            <Stop offset="100%" stopColor="#CBD5E1" />
          </LinearGradient>

          <LinearGradient id="accentRibbon" x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#FFFFFF" />
          </LinearGradient>
        </Defs>

        {/* Outer Squircle Container */}
        <Rect
          x="0"
          y="0"
          width="100"
          height="100"
          rx="30"
          fill="url(#vibeBgGrad)"
        />

        {/* The Signature VibeNet 'V' Emblem */}
        <G transform="translate(0, 4)">
          {/* Main Dynamic 'V' Ribbon */}
          <Path
            d="M26 26 C30 26 34 29 37 36 L50 63 L63 36 C66 29 70 26 74 26 C81 26 85 33 80 41 L57 80 C53.5 86 46.5 86 43 80 L20 41 C15 33 19 26 26 26 Z"
            fill="url(#ribbonGrad1)"
          />

          {/* Left Fluid Highlight Wing */}
          <Path
            d="M26 26 C30 26 34 29 37 36 L50 63 L45 73 L20 41 C15 33 19 26 26 26 Z"
            fill="url(#accentRibbon)"
            opacity="0.8"
          />

          {/* Interconnected Vibe Sparkle / Pulse Core */}
          <Path
            d="M50 20 C50.6 28 56 33.4 64 34 C56 34.6 50.6 40 50 48 C49.4 40 44 34.6 36 34 C44 33.4 49.4 28 50 20 Z"
            fill="#FFFFFF"
          />

          {/* Satellite Frequency Pulse Dots */}
          <Circle cx="76" cy="20" r="3.2" fill="#FFFFFF" opacity="0.9" />
          <Circle cx="84" cy="28" r="2" fill="#FFFFFF" opacity="0.75" />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  glowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#8A2387',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.38,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 10px 24px -4px rgba(138, 35, 135, 0.42)',
      },
    }),
  },
});
