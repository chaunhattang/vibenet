import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Colors, Radii, Shadows, Spacing } from '../../constants/theme';

export interface LayeredCardProps {
  children: React.ReactNode;
  outerStyle?: ViewStyle;
  innerStyle?: ViewStyle;
  footerContent?: React.ReactNode;
  headerContent?: React.ReactNode;
  dark?: boolean;
}

/**
 * LayeredCard provides a modern, tactile layered container architecture.
 * Features an outer #F3F3F3 surface with smooth border radius framing
 * an inner nested #FDFDFD surface with crisp contrast and soft elevation.
 */
export const LayeredCard: React.FC<LayeredCardProps> = ({
  children,
  outerStyle,
  innerStyle,
  footerContent,
  headerContent,
  dark = false,
}) => {
  return (
    <View
      style={[
        styles.outerContainer,
        dark ? styles.outerDark : styles.outerLight,
        Shadows.layeredCard as ViewStyle,
        outerStyle,
      ]}>
      {headerContent}
      
      {/* Nested inner surface (#FDFDFD) */}
      <View
        style={[
          styles.innerContainer,
          dark ? styles.innerDark : styles.innerLight,
          Shadows.innerCard as ViewStyle,
          innerStyle,
        ]}>
        {children}
      </View>

      {footerContent ? (
        <View style={styles.footerWrapper}>{footerContent}</View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    borderRadius: Radii.card + 4, // ~32px
    padding: Spacing.two + 2, // ~10px frame padding
    borderWidth: 1,
    overflow: 'hidden',
  },
  outerLight: {
    backgroundColor: Colors.surfaceLayerOuter, // #F3F3F3
    borderColor: Colors.surfaceLayerBorder, // #E6E6EC
  },
  outerDark: {
    backgroundColor: '#18191D',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  innerContainer: {
    width: '100%',
    borderRadius: Radii.lg + 2, // ~24px
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.six,
    borderWidth: 1,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
      },
    }),
  },
  innerLight: {
    backgroundColor: Colors.surfaceLayerInner, // #FDFDFD
    borderColor: Colors.surfaceInnerBorder, // #ECECEE
  },
  innerDark: {
    backgroundColor: '#202126',
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  footerWrapper: {
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
