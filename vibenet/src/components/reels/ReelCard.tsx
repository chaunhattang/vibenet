import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import type { ReelResponse } from '../../services/api/types';
import * as reactionsApi from '../../services/api/reactions';
import * as reelsApi from '../../services/api/reels';
import * as usersApi from '../../services/api/users';
import { Colors, Radii, Spacing, BottomTabInset } from '../../constants/theme';
import { resolveMediaUrl } from '../../services/config';
import { onReelReaction, onReelComment } from '../../services/websocket';
import { useAuth } from '../../contexts/AuthContext';

interface ReelCardProps {
  reel: ReelResponse;
  isActive: boolean;
  onOpenComments: (reel: ReelResponse) => void;
  onPressAuthor?: (authorId: string) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ReelCard: React.FC<ReelCardProps> = ({
  reel,
  isActive,
  onOpenComments,
  onPressAuthor,
}) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(reel.liked);
  const [likesCount, setLikesCount] = useState(reel.likesCount);
  const [commentsCount, setCommentsCount] = useState(reel.commentsCount);
  const [sharesCount, setSharesCount] = useState(reel.sharesCount);
  const [isSaved, setIsSaved] = useState(reel.saved);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Live cross-device sync: reflect likes/comments made from this account's other
  // sessions (or anyone else currently viewing this reel) without a manual refresh.
  useEffect(() => {
    const unsubReaction = onReelReaction(reel.id, (event) => {
      setLikesCount(event.likesCount);
      if (event.actorUserId === user?.id) {
        setIsLiked(!!event.actorReaction);
      }
    });
    const unsubComment = onReelComment(reel.id, (event) => {
      setCommentsCount(event.commentsCount);
    });
    return () => {
      unsubReaction();
      unsubComment();
    };
  }, [reel.id, user?.id]);

  const isVideoSource = true; // reels are always uploaded as video

  // expo-video Native Player instance
  const player = useVideoPlayer(resolveMediaUrl(reel.videoUrl) ?? null, (p) => {
    p.loop = true;
    p.muted = isMuted;
    if (isActive && !isPaused) {
      p.play();
    }
  });

  useEffect(() => {
    if (!player) return;
    if (isActive && !isPaused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, isPaused, player]);

  useEffect(() => {
    if (player) {
      player.muted = isMuted;
    }
  }, [isMuted, player]);

  // Reanimated 4 Shared Values for Double-Tap Heart Burst
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);
  const lastTapRef = useRef<number>(0);

  const triggerHeartBurst = () => {
    heartScale.value = 0;
    heartOpacity.value = 0.9;
    heartScale.value = withSequence(
      withSpring(1.3, { damping: 10, stiffness: 220 }),
      withDelay(200, withTiming(0, { duration: 250 }))
    );
    heartOpacity.value = withDelay(250, withTiming(0, { duration: 200 }));
  };

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  const doLike = () => {
    reactionsApi.toggleReelReaction(reel.id, 'LOVE').catch((err) => {
      console.warn('Failed to toggle reel reaction', err);
      // revert optimistic update on failure
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => (isLiked ? prev + 1 : Math.max(0, prev - 1)));
    });
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!isLiked) {
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
        doLike();
      }
      triggerHeartBurst();
    } else {
      setIsPaused((prev) => !prev);
    }
    lastTapRef.current = now;
  };

  const handleLikeToggle = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
      triggerHeartBurst();
    }
    doLike();
  };

  const handleSaveToggle = () => {
    const next = !isSaved;
    setIsSaved(next);
    reelsApi.toggleSaveReel(reel.id).catch((err) => {
      console.warn('Failed to toggle reel save', err);
      setIsSaved(!next);
    });
  };

  const handleFollowToggle = () => {
    setIsFollowing(true);
    usersApi.follow(reel.creator.id).catch((err) => {
      console.warn('Failed to follow creator', err);
      setIsFollowing(false);
    });
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const handleShareReel = async () => {
    try {
      await Share.share({
        message: `Watch @${reel.creator.username}'s Reel on VibeNet: "${reel.caption ?? ''}" https://vibenet.io/reels/${reel.id}`,
      });
      setSharesCount((prev) => prev + 1);
      reelsApi.shareReel(reel.id).then(setSharesCount).catch(() => {});
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleDoubleTap}
        style={styles.touchArea}>
        {/* Full-Screen Hardware Video / Media Canvas */}
        {isVideoSource && Platform.OS !== 'web' ? (
          <VideoView
            player={player}
            style={styles.mediaVideo}
            contentFit="cover"
            nativeControls={false}
            allowsPictureInPicture={false}
          />
        ) : (
          <Image
            source={{ uri: resolveMediaUrl(reel.thumbnailUrl || reel.videoUrl) }}
            style={styles.mediaVideo}
            contentFit="cover"
          />
        )}

        {/* Paused Indicator Overlay */}
        {isPaused && (
          <View style={styles.pausedOverlay}>
            <View style={styles.pauseCircle}>
              <Ionicons name="play" size={36} color="#FFFFFF" />
            </View>
          </View>
        )}

        {/* Double-Tap Heart Burst Animation */}
        <Animated.View
          style={[styles.heartBurstOverlay, animatedHeartStyle]}
          pointerEvents="none">
          <Ionicons name="heart" size={96} color="#FFFFFF" />
        </Animated.View>

        {/* Dark Vignette Bottom Gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.88)']}
          locations={[0, 0.55, 1]}
          style={styles.bottomGradient}
          pointerEvents="box-none"
        />

        {/* Right Floating Actions Column */}
        <View style={styles.rightActionsCol}>
          {/* Author Avatar + Follow Badge */}
          <View style={styles.avatarActionWrap}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onPressAuthor?.(reel.creator.id)}>
              <Image
                source={{ uri: resolveMediaUrl(reel.creator.avatarUrl) }}
                style={styles.authorAvatar}
              />
            </TouchableOpacity>
            {!isFollowing && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleFollowToggle}
                style={styles.followBadge}>
                <Feather name="plus" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Like Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLikeToggle}
            style={styles.actionBtn}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={30}
              color={isLiked ? '#FF3B30' : '#FFFFFF'}
            />
            <Text style={styles.actionCount}>{formatCount(likesCount)}</Text>
          </TouchableOpacity>

          {/* Comments Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onOpenComments(reel)}
            style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={28} color="#FFFFFF" />
            <Text style={styles.actionCount}>{formatCount(commentsCount)}</Text>
          </TouchableOpacity>

          {/* Bookmark / Save Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSaveToggle}
            style={styles.actionBtn}>
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={28}
              color={isSaved ? '#FFD700' : '#FFFFFF'}
            />
            <Text style={styles.actionCount}>Save</Text>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleShareReel}
            style={styles.actionBtn}>
            <Feather
              name="send"
              size={26}
              color="#FFFFFF"
              style={{ transform: [{ rotate: '12deg' }] }}
            />
            <Text style={styles.actionCount}>{formatCount(sharesCount)}</Text>
          </TouchableOpacity>

          {/* Sound / Mute Toggle Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsMuted(!isMuted)}
            style={styles.actionBtn}>
            <Ionicons
              name={isMuted ? 'volume-mute-outline' : 'volume-high-outline'}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {/* Spinning Vinyl Audio Disc */}
          <View style={styles.vinylWrapper}>
            <Image
              source={{ uri: resolveMediaUrl(reel.creator.avatarUrl) }}
              style={styles.vinylDisc}
            />
          </View>
        </View>

        {/* Bottom-Left Information Overlay */}
        <View style={styles.bottomInfoOverlay}>
          {/* Author Tag */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPressAuthor?.(reel.creator.id)}
            style={styles.authorRow}>
            <Text style={styles.authorName}>@{reel.creator.username}</Text>
          </TouchableOpacity>

          {/* Caption */}
          {reel.caption ? (
            <Text numberOfLines={2} style={styles.captionText}>
              {reel.caption}
            </Text>
          ) : null}

          {/* Music Audio Ticker */}
          {reel.audioTitle ? (
            <View style={styles.audioTickerRow}>
              <Ionicons name="musical-notes" size={13} color="#FFFFFF" />
              <Text numberOfLines={1} style={styles.audioTitleText}>
                {reel.audioTitle}
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  touchArea: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  mediaVideo: {
    width: '100%',
    height: '100%',
  },
  pausedOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
  },
  pauseCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heartBurstOverlay: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
    zIndex: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 340,
    zIndex: 10,
  },
  rightActionsCol: {
    position: 'absolute',
    right: Spacing.four,
    bottom: BottomTabInset + 20,
    alignItems: 'center',
    gap: Spacing.four,
    zIndex: 20,
  },
  avatarActionWrap: {
    position: 'relative',
    marginBottom: 4,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: Colors.surfaceMuted,
  },
  followBadge: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    backgroundColor: '#FF3B30',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  actionBtn: {
    alignItems: 'center',
    gap: 3,
  },
  actionCount: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  vinylWrapper: {
    marginTop: 6,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  vinylDisc: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  bottomInfoOverlay: {
    position: 'absolute',
    left: Spacing.four,
    bottom: BottomTabInset + 20,
    right: 75,
    zIndex: 20,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  authorName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  captionText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  audioTickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  audioTitleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
