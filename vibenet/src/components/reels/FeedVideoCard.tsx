import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, Share } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import type { PostResponse } from '../../services/api/types';
import * as reactionsApi from '../../services/api/reactions';
import * as postsApi from '../../services/api/posts';
import { Colors, Spacing, BottomTabInset } from '../../constants/theme';
import { resolveMediaUrl } from '../../services/config';
import { onPostReaction, onPostComment } from '../../services/websocket';
import { useAuth } from '../../contexts/AuthContext';

interface FeedVideoCardProps {
  post: PostResponse;
  isActive: boolean;
  onOpenComments: (post: PostResponse) => void;
  onPressAuthor?: (authorId: string) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Videos at (or near) a standard vertical ratio fill the screen edge-to-edge like
// TikTok's native 9:16 content — a portrait video with width/height at or below this
// ratio is close enough to crop-fill without losing meaningful content. Anything wider
// (square, 4:5, landscape) instead gets letterboxed with a blurred backdrop of itself,
// same as TikTok does for non-vertical uploads.
const PORTRAIT_FILL_RATIO = 0.62;

// Full-screen vertical player for a video Post — the "Reels" tab reuses the same
// Post entity/APIs as the Feed tab instead of a separate reel upload flow.
export const FeedVideoCard: React.FC<FeedVideoCardProps> = ({
  post,
  isActive,
  onOpenComments,
  onPressAuthor,
}) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(!!post.currentReaction);
  const [likesCount, setLikesCount] = useState(post.reactionCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [sharesCount, setSharesCount] = useState(post.sharesCount);
  const [isSaved, setIsSaved] = useState(post.saved);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const unsubReaction = onPostReaction(post.id, (event) => {
      setLikesCount(event.reactionCount);
      if (event.actorUserId === user?.id) {
        setIsLiked(!!event.actorReaction);
      }
    });
    const unsubComment = onPostComment(post.id, (event) => {
      setCommentCount(event.commentCount);
    });
    return () => {
      unsubReaction();
      unsubComment();
    };
  }, [post.id, user?.id]);

 
  useEffect(() => {
    setIsLiked(!!post.currentReaction);
    setLikesCount(post.reactionCount);
    setCommentCount(post.commentCount);
    setIsSaved(post.saved);
  }, [post.currentReaction, post.reactionCount, post.commentCount, post.saved]);

  const videoUrl = resolveMediaUrl(post.mediaUrl[0]);
  const player = useVideoPlayer(videoUrl ?? null, (p) => {
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
    if (player) player.muted = isMuted;
  }, [isMuted, player]);

  // Read the decoded video's native pixel size once metadata loads, to decide whether
  // it fills the screen naturally (cover) or needs a letterboxed/blurred treatment.
  const { videoTrack } = useEvent(player, 'videoTrackChange', { videoTrack: player.videoTrack });
  const naturalRatio = videoTrack ? videoTrack.size.width / videoTrack.size.height : null;
  const needsLetterbox = naturalRatio !== null && naturalRatio > PORTRAIT_FILL_RATIO;

  // Second player driving a blurred, cover-filled backdrop copy behind the letterboxed
  // foreground — only actually used (mounted) when needsLetterbox is true.
  const bgPlayer = useVideoPlayer(needsLetterbox && videoUrl ? videoUrl : null, (p) => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    if (!bgPlayer) return;
    if (isActive && !isPaused) {
      bgPlayer.play();
    } else {
      bgPlayer.pause();
    }
  }, [isActive, isPaused, bgPlayer, needsLetterbox]);

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

  const toggleLike = async () => {
    const wasLiked = isLiked;
    const optimisticLiked = !wasLiked;
    setIsLiked(optimisticLiked);
    setLikesCount((prev) => Math.max(0, prev + (optimisticLiked ? 1 : -1)));
    try {
      const result = await reactionsApi.togglePostReaction(post.id, 'LOVE');
      const nowLiked = !!result;
      if (nowLiked !== optimisticLiked) {
        setIsLiked(nowLiked);
        setLikesCount((prev) => Math.max(0, prev + (nowLiked ? 1 : -1)));
      }
    } catch {
      setIsLiked(wasLiked);
      setLikesCount((prev) => Math.max(0, prev + (wasLiked ? 1 : -1)));
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!isLiked) {
        triggerHeartBurst();
        toggleLike();
      }
    } else {
      setIsPaused((prev) => !prev);
    }
    lastTapRef.current = now;
  };

  const handleLikeToggle = () => {
    if (!isLiked) triggerHeartBurst();
    toggleLike();
  };

  const handleSaveToggle = () => {
    const next = !isSaved;
    setIsSaved(next);
    postsApi.toggleSavePost(post.id).catch(() => setIsSaved(!next));
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out @${post.owner.username}'s video on VibeNet.`,
      });
      setSharesCount((prev) => prev + 1);
      postsApi.sharePost(post.id).then(setSharesCount).catch(() => {});
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity activeOpacity={1} onPress={handleDoubleTap} style={styles.touchArea}>
        {Platform.OS !== 'web' ? (
          needsLetterbox ? (
            <>
              {/* Blurred, cover-filled backdrop of the same video — fills the letterbox
                  bars instead of plain black, matching TikTok's non-vertical treatment. */}
              <VideoView
                player={bgPlayer}
                style={styles.mediaVideoAbsolute}
                contentFit="cover"
                nativeControls={false}
                pointerEvents="none"
              />
              <BlurView intensity={45} tint="dark" style={styles.mediaVideoAbsolute} />
              <View style={styles.letterboxScrim} pointerEvents="none" />
              <VideoView
                player={player}
                style={styles.mediaVideoAbsolute}
                contentFit="contain"
                nativeControls={false}
                allowsPictureInPicture={false}
              />
            </>
          ) : (
            <VideoView
              player={player}
              style={styles.mediaVideo}
              contentFit="cover"
              nativeControls={false}
              allowsPictureInPicture={false}
            />
          )
        ) : (
          <Image
            source={{ uri: resolveMediaUrl(post.mediaUrl[0]) }}
            style={styles.mediaVideo}
            contentFit="cover"
          />
        )}

        {isPaused && (
          <View style={styles.pausedOverlay}>
            <View style={styles.pauseCircle}>
              <Ionicons name="play" size={36} color="#FFFFFF" />
            </View>
          </View>
        )}

        <Animated.View style={[styles.heartBurstOverlay, animatedHeartStyle]} pointerEvents="none">
          <Ionicons name="heart" size={96} color="#FFFFFF" />
        </Animated.View>

        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.88)']}
          locations={[0, 0.55, 1]}
          style={styles.bottomGradient}
          pointerEvents="box-none"
        />

        <View style={styles.rightActionsCol}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPressAuthor?.(post.owner.id)}
            style={styles.avatarActionWrap}>
            <Image source={{ uri: resolveMediaUrl(post.owner.avatarUrl) }} style={styles.authorAvatar} />
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={handleLikeToggle} style={styles.actionBtn}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={30}
              color={isLiked ? '#FF3B30' : '#FFFFFF'}
            />
            <Text style={styles.actionCount}>{formatCount(likesCount)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onOpenComments(post)}
            style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={28} color="#FFFFFF" />
            <Text style={styles.actionCount}>{formatCount(commentCount)}</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={handleSaveToggle} style={styles.actionBtn}>
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={28}
              color={isSaved ? '#FFD700' : '#FFFFFF'}
            />
            <Text style={styles.actionCount}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={handleShare} style={styles.actionBtn}>
            <Feather name="send" size={26} color="#FFFFFF" style={{ transform: [{ rotate: '12deg' }] }} />
            <Text style={styles.actionCount}>{formatCount(sharesCount)}</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={() => setIsMuted(!isMuted)} style={styles.actionBtn}>
            <Ionicons
              name={isMuted ? 'volume-mute-outline' : 'volume-high-outline'}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomInfoOverlay}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPressAuthor?.(post.owner.id)}
            style={styles.authorRow}>
            <Text style={styles.authorName}>@{post.owner.username}</Text>
          </TouchableOpacity>

          {post.textContent ? (
            <Text numberOfLines={2} style={styles.captionText}>
              {post.textContent}
            </Text>
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
  mediaVideoAbsolute: {
    ...StyleSheet.absoluteFillObject,
  },
  letterboxScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  pausedOverlay: {
    ...StyleSheet.absoluteFillObject,
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
});
