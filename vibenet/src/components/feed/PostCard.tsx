import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useVideoPlayer, VideoView } from 'expo-video';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { PostResponse } from '../../services/api/types';
import * as reactionsApi from '../../services/api/reactions';
import * as postsApi from '../../services/api/posts';
import { resolveMediaUrl } from '../../services/config';
import { onPostReaction, onPostComment } from '../../services/websocket';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Radii, Spacing, Typography } from '../../constants/theme';

interface PostCardProps {
  post: PostResponse;
  onOpenComments: (post: PostResponse) => void;
  onPressAuthor?: (authorId: string) => void;
  onPressOptions?: (post: PostResponse) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const VIDEO_EXT_RE = /\.(mp4|mov|webm|m4v)$/i;
const DEFAULT_TEXT_GRADIENT: [string, string, ...string[]] = ['#833AB4', '#FD1D1D', '#FCAF45'];

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onOpenComments,
  onPressAuthor,
  onPressOptions,
}) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(!!post.currentReaction);
  const [likesCount, setLikesCount] = useState(post.reactionCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [sharesCount, setSharesCount] = useState(post.sharesCount);
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);

  // Live cross-device sync: reflect likes/comments made from this account's other
  // sessions (or anyone else currently viewing this post) without a manual refresh.
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

  // Local state is seeded from props only on mount, so when the feed screen reloads
  // (e.g. on regaining focus) with a fresh `post` object, re-sync from it too —
  // otherwise a missed WebSocket event would leave this card stuck on stale data.
  useEffect(() => {
    setIsLiked(!!post.currentReaction);
    setLikesCount(post.reactionCount);
    setCommentCount(post.commentCount);
  }, [post.currentReaction, post.reactionCount, post.commentCount]);

  const mediaUrls = post.mediaUrl ?? [];
  const isTextOnly = mediaUrls.length === 0;
  const isVideo = !isTextOnly && VIDEO_EXT_RE.test(mediaUrls[currentMediaIdx] ?? mediaUrls[0] ?? '');
  const hasMultipleImages = mediaUrls.length > 1;
  const textGradientColors: [string, string, ...string[]] =
    post.textGradient && post.textGradient.length >= 2
      ? (post.textGradient as [string, string, ...string[]])
      : DEFAULT_TEXT_GRADIENT;

  const [isMuted, setIsMuted] = useState(true);
  const videoUrl = isVideo ? resolveMediaUrl(mediaUrls[currentMediaIdx] || mediaUrls[0]) : undefined;
  const player = useVideoPlayer(videoUrl ?? null, (p) => {
    p.loop = true;
    p.muted = isMuted;
    p.play();
  });

  useEffect(() => {
    if (player) player.muted = isMuted;
  }, [isMuted, player]);

  const handleShare = async () => {
    setSharesCount((prev) => prev + 1);
    try {
      const updated = await postsApi.sharePost(post.id);
      setSharesCount(updated);
    } catch {
      setSharesCount((prev) => Math.max(0, prev - 1));
    }
  };

  // Native Reanimated 4 Shared Values for 120 FPS Double-Tap Heart Burst
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);
  const lastTapRef = useRef<number>(0);

  const triggerHeartBurst = () => {
    heartScale.value = 0;
    heartOpacity.value = 0.9;
    heartScale.value = withSequence(
      withSpring(1.2, { damping: 10, stiffness: 200 }),
      withDelay(180, withTiming(0, { duration: 250 }))
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
    // optimistic update
    setIsLiked(optimisticLiked);
    setLikesCount((prev) => Math.max(0, prev + (optimisticLiked ? 1 : -1)));
    try {
      const result = await reactionsApi.togglePostReaction(post.id, 'LOVE');
      const nowLiked = !!result;
      // only reconcile if the server disagrees with the optimistic guess
      if (nowLiked !== optimisticLiked) {
        setIsLiked(nowLiked);
        setLikesCount((prev) => Math.max(0, prev + (nowLiked ? 1 : -1)));
      }
    } catch {
      // revert on failure
      setIsLiked(wasLiked);
      setLikesCount((prev) => Math.max(0, prev + (wasLiked ? 1 : -1)));
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!isLiked) {
        toggleLike();
      }
      triggerHeartBurst();
    }
    lastTapRef.current = now;
  };

  const handleLikeToggle = () => {
    if (!isLiked) triggerHeartBurst();
    toggleLike();
  };

  const renderAuthorPill = () => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPressAuthor?.(post.owner.id)}
      style={styles.authorGlassPill}>
      <Image
        source={{ uri: resolveMediaUrl(post.owner.avatarUrl) }}
        style={styles.authorAvatar}
      />
      <View style={styles.authorTextCol}>
        <View style={styles.nameRow}>
          <Text style={styles.authorName}>{post.owner.fullName || post.owner.username}</Text>
        </View>
        <Text style={styles.authorHandle}>@{post.owner.username}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18).stiffness(140)}
      style={styles.cardWrapper}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleDoubleTap}
        style={styles.cardContainer}>
        {/* 1. MEDIA CANVAS: PHOTO / CAROUSEL / VIDEO / TEXT */}
        {isTextOnly ? (
          /* Text-Only Post — uses the author's chosen gradient theme, falling back to a default */
          <LinearGradient
            colors={textGradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.textOnlyCardCanvas}>
            <Text style={styles.textOnlyQuoteText}>{post.textContent}</Text>
          </LinearGradient>
        ) : (
          /* Photo / Video / Carousel Canvas */
          <View style={styles.mediaCanvasWrapper}>
            {isVideo && videoUrl && Platform.OS !== 'web' ? (
              <VideoView
                player={player}
                style={styles.mediaImage}
                contentFit="cover"
                nativeControls={false}
                allowsPictureInPicture={false}
              />
            ) : (
              <Image
                source={{ uri: resolveMediaUrl(mediaUrls[currentMediaIdx] || mediaUrls[0]) }}
                style={styles.mediaImage}
                contentFit="cover"
                transition={200}
              />
            )}

            {/* Mute / Unmute Toggle */}
            {isVideo && videoUrl && Platform.OS !== 'web' && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsMuted((prev) => !prev)}
                style={styles.videoMuteBtn}>
                <Ionicons
                  name={isMuted ? 'volume-mute' : 'volume-high'}
                  size={16}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            )}

            {/* Multi-Image Carousel Dot Switcher */}
            {hasMultipleImages && (
              <View style={styles.carouselNavRow}>
                {mediaUrls.map((_, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.8}
                    onPress={() => setCurrentMediaIdx(idx)}
                    style={[
                      styles.carouselDot,
                      currentMediaIdx === idx && styles.activeCarouselDot,
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Carousel Counter Badge */}
            {hasMultipleImages && (
              <View style={styles.carouselCounterBadge}>
                <Text style={styles.carouselCounterText}>
                  {currentMediaIdx + 1}/{mediaUrls.length}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 2. Top Floating Overlay (Author Pill + 3-Dots Menu) */}
        <View style={styles.topOverlayRow}>
          {Platform.OS === 'web' ? (
            <View style={styles.webGlassPillWrapper}>{renderAuthorPill()}</View>
          ) : (
            <BlurView intensity={45} tint="dark" style={styles.authorBlurWrapper}>
              {renderAuthorPill()}
            </BlurView>
          )}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onPressOptions?.(post)}
            style={styles.moreOptionsBtn}>
            <Ionicons name="ellipsis-vertical" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 3. Double-Tap Heart Burst Animation (Native UI Thread Worklet) */}
        <Animated.View
          style={[styles.heartBurstOverlay, animatedHeartStyle]}
          pointerEvents="none">
          <Ionicons name="heart" size={88} color="#FFFFFF" />
        </Animated.View>

        {/* 4. Bottom Floating Overlay: Gradient + Stats + Caption */}
        <LinearGradient
          colors={
            isTextOnly
              ? ['transparent', 'rgba(0, 0, 0, 0.35)', 'rgba(0, 0, 0, 0.75)']
              : ['transparent', 'rgba(0, 0, 0, 0.55)', 'rgba(0, 0, 0, 0.92)']
          }
          locations={[0, 0.45, 1]}
          style={styles.bottomGradient}>
          {/* Stats Action Row */}
          <View style={styles.statsRow}>
            {/* Likes */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleLikeToggle}
              style={styles.statActionItem}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={18}
                color={isLiked ? '#FF3B30' : '#FFFFFF'}
              />
              <Text style={styles.statCount}>{likesCount}</Text>
            </TouchableOpacity>

            {/* Comments */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onOpenComments(post)}
              style={styles.statActionItem}>
              <Ionicons
                name="chatbubble-outline"
                size={17}
                color="#FFFFFF"
              />
              <Text style={styles.statCount}>{commentCount}</Text>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleShare}
              style={styles.statActionItem}>
              <Feather
                name="send"
                size={16}
                color="#FFFFFF"
                style={{ transform: [{ rotate: '12deg' }] }}
              />
              {sharesCount > 0 && <Text style={styles.statCount}>{sharesCount}</Text>}
            </TouchableOpacity>
          </View>

          {/* Location */}
          {post.location ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={11} color="rgba(255,255,255,0.85)" />
              <Text style={styles.locationText}>{post.location}</Text>
            </View>
          ) : null}

          {/* Caption with Hashtags (only if not text-only or if extra caption provided) */}
          {!isTextOnly && post.textContent ? (
            <Text numberOfLines={3} style={styles.captionText}>
              {post.textContent}
            </Text>
          ) : null}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.five,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 20,
      },
      android: { elevation: 4 },
      web: { boxShadow: '0 10px 28px rgba(0, 0, 0, 0.08)' },
    }),
  },
  cardContainer: {
    width: '100%',
    aspectRatio: 0.88,
    borderRadius: 30,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0D0E11',
  },
  mediaCanvasWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  textOnlyCardCanvas: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.eight,
  },
  textOnlyQuoteText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  videoMuteBtn: {
    position: 'absolute',
    top: Spacing.four + 44,
    right: Spacing.four,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselNavRow: {
    position: 'absolute',
    top: Spacing.four + 44,
    right: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  carouselDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeCarouselDot: {
    width: 14,
    backgroundColor: '#FFFFFF',
  },
  carouselCounterBadge: {
    position: 'absolute',
    bottom: 90,
    right: Spacing.four,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  carouselCounterText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  topOverlayRow: {
    position: 'absolute',
    top: Spacing.four,
    left: Spacing.four,
    right: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  authorBlurWrapper: {
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  webGlassPillWrapper: {
    borderRadius: Radii.pill,
    backgroundColor: 'rgba(20, 20, 24, 0.65)',
    // @ts-ignore
    backdropFilter: 'blur(16px)',
  },
  authorGlassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    gap: Spacing.two,
    backgroundColor: Platform.OS === 'web' ? 'transparent' : 'rgba(20, 20, 24, 0.45)',
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: Colors.surfaceMuted,
  },
  authorTextCol: {
    paddingRight: Spacing.two,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  authorHandle: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 10,
    fontWeight: '500',
  },
  moreOptionsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(20, 20, 24, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    // @ts-ignore
    backdropFilter: 'blur(16px)',
  },
  heartBurstOverlay: {
    position: 'absolute',
    alignSelf: 'center',
    top: '38%',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.four + 2,
    paddingBottom: Spacing.four + 2,
    paddingTop: Spacing.eight,
    zIndex: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    marginBottom: Spacing.two,
  },
  statActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  statCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  captionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    letterSpacing: -0.1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  locationText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
  },
});
