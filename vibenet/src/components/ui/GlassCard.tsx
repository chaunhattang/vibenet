import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Radii, Shadows } from '../../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  dark?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 30,
  tint = 'light',
  dark = false,
}) => {
  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          styles.webCard,
          dark ? styles.webCardDark : styles.webCardLight,
          Shadows.card as ViewStyle,
          style,
        ]}>
        {children}
      </View>
    );
  }

  return (
    <BlurView
      intensity={intensity}
      tint={dark ? 'dark' : tint}
      style={[
        styles.cardContainer,
        dark ? styles.cardDark : styles.cardLight,
        Shadows.card as ViewStyle,
        style,
      ]}>
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: Radii.card,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardLight: {
    borderColor: Colors.glassBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  cardDark: {
    borderColor: Colors.glassBorderDark,
    backgroundColor: 'rgba(20, 20, 22, 0.75)',
  },
  webCard: {
    borderRadius: Radii.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  webCardLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.6)',
    // @ts-ignore
    backdropFilter: 'blur(20px)',
  },
  webCardDark: {
    backgroundColor: 'rgba(20, 20, 22, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    // @ts-ignore
    backdropFilter: 'blur(20px)',
  },
});
