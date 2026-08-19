import React from 'react';
import { Platform, StyleProp } from 'react-native';
import { Image, ImageStyle } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { resolveMediaUrl } from '../../services/config';

const VIDEO_EXT_RE = /\.(mp4|mov|webm|m4v)$/i;

interface MediaThumbnailProps {
  uri: string | null | undefined;
  style: StyleProp<ImageStyle>;
}

/**
 * Renders a photo or video URL as a static thumbnail. expo-image can't decode
 * video frames, so video URLs are shown via a paused expo-video player instead
 * (the loaded first frame acts as the thumbnail, with no playback/decoding cost).
 */
export const MediaThumbnail: React.FC<MediaThumbnailProps> = ({ uri, style }) => {
  const isVideo = VIDEO_EXT_RE.test(uri ?? '');
  const resolvedUri = resolveMediaUrl(uri);
  const player = useVideoPlayer(isVideo ? resolvedUri ?? null : null, (p) => {
    p.muted = true;
  });

  if (isVideo && resolvedUri && Platform.OS !== 'web') {
    return (
      <VideoView
        player={player}
        style={style}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
      />
    );
  }

  return <Image source={{ uri: resolvedUri }} style={style} contentFit="cover" />;
};
