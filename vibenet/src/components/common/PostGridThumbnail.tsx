import React from 'react';
import { StyleProp, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageStyle } from 'expo-image';
import { MediaThumbnail } from './MediaThumbnail';

const DEFAULT_TEXT_GRADIENT: [string, string, ...string[]] = ['#833AB4', '#FD1D1D', '#FCAF45'];

interface PostGridThumbnailProps {
  mediaUrl?: string | null;
  textContent?: string | null;
  textGradient?: string[] | null;
  style: StyleProp<ImageStyle>;
}

/**
 * Renders a post's grid tile. Text-only posts (no mediaUrl) have nothing for
 * MediaThumbnail to show, so render their gradient + caption instead, matching
 * how PostCard displays them in the feed.
 */
export const PostGridThumbnail: React.FC<PostGridThumbnailProps> = ({
  mediaUrl,
  textContent,
  textGradient,
  style,
}) => {
  if (!mediaUrl) {
    const colors: [string, string, ...string[]] =
      textGradient && textGradient.length >= 2
        ? (textGradient as [string, string, ...string[]])
        : DEFAULT_TEXT_GRADIENT;

    return (
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[style, styles.textCard]}>
        <Text numberOfLines={5} style={styles.textCardText}>
          {textContent}
        </Text>
      </LinearGradient>
    );
  }

  return <MediaThumbnail uri={mediaUrl} style={style} />;
};

const styles = StyleSheet.create({
  textCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  textCardText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
