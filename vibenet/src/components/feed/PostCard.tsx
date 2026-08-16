import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import { PostItem } from '../../data/mockData';
import { Colors, Radii, Shadows, Spacing, Typography } from '../../constants/theme';

interface PostCardProps {
  post: PostItem;
  onOpenComments: (post: PostItem) => void;
  onPressAuthor?: (authorId: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH, 430);

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onOpenComments,
  onPressAuthor,
}) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);

  // Heart burst animation for double-tap
  const heartScale = useRef(new Animated.Value(0)).current;
  const lastTapRef = useRef<number>(0);

  const triggerHeartBurst = () => {
    heartScale.setValue(0);
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.2,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 0,
        duration: 350,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!isLiked) {
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }
      triggerHeartBurst();
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
  };

  const handleSaveToggle = () => {
    setIsSaved((prev) => !prev);
  };

  return (
    <View style={styles.cardContainer}>
      {/* 1. Header: Author info & options */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onPressAuthor?.(post.author.id)}
          style={styles.authorSection}>
          <Image
            source={{ uri: post.author.avatarUrl }}
            style={styles.avatarImg}
          />
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.authorFullName}>{post.author.fullName}</Text>
              {post.author.isVerified && (
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={Colors.accentBlue}
                  style={styles.verifiedIcon}
                />
              )}
            </View>
            <Text style={styles.authorHandle}>@{post.author.username}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <Text style={styles.timeAgoText}>{post.createdAt}</Text>
          <TouchableOpacity activeOpacity={0.7} style={styles.optionsBtn}>
            <Ionicons
              name="ellipsis-horizontal"
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Media Area with Carousel & Heart Burst */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleDoubleTap}
        style={styles.mediaContainer}>
        <Image
          source={{ uri: post.mediaUrls[currentMediaIdx] || post.mediaUrls[0] }}
          style={styles.mediaImage}
          contentFit="cover"
          transition={200}
        />

        {/* Location Tag Pill */}
        {post.location ? (
          <View style={styles.locationPill}>
            <Ionicons name="location-sharp" size={11} color="#FFFFFF" />
            <Text style={styles.locationText}>{post.location}</Text>
          </View>
        ) : null}

        {/* Multi-image indicator badge */}
        {post.mediaUrls.length > 1 && (
          <View style={styles.mediaCounterBadge}>
            <Text style={styles.mediaCounterText}>
              {currentMediaIdx + 1}/{post.mediaUrls.length}
            </Text>
          </View>
        )}

        {/* Animated Double-Tap Heart Burst */}
        <Animated.View
          style={[
            styles.heartBurstOverlay,
            {
              transform: [{ scale: heartScale }],
              opacity: heartScale.interpolate({
                inputRange: [0, 1, 1.2],
                outputRange: [0, 1, 0.9],
              }),
            },
          ]}
          pointerEvents="none">
          <Ionicons name="heart" size={90} color="#FFFFFF" />
        </Animated.View>
      </TouchableOpacity>

      {/* 3. Action Bar: Like, Comment, Share, Bookmark */}
      <View style={styles.actionsBar}>
        <View style={styles.leftActions}>
          {/* Like Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLikeToggle}
            style={styles.actionBtn}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={isLiked ? Colors.statusLive : Colors.textPrimary}
            />
            <Text
              style={[
                styles.actionCount,
                isLiked && { color: Colors.statusLive, fontWeight: '700' },
              ]}>
              {likesCount}
            </Text>
          </TouchableOpacity>

          {/* Comment Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onOpenComments(post)}
            style={styles.actionBtn}>
            <Ionicons
              name="chatbubble-outline"
              size={22}
              color={Colors.textPrimary}
            />
            <Text style={styles.actionCount}>{post.commentsCount}</Text>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity activeOpacity={0.7} style={styles.actionBtn}>
            <Feather
              name="send"
              size={20}
              color={Colors.textPrimary}
              style={{ transform: [{ rotate: '15deg' }] }}
            />
          </TouchableOpacity>
        </View>

        {/* Bookmark Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSaveToggle}
          style={styles.actionBtn}>
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={isSaved ? Colors.accentBlue : Colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* 4. Text & Caption Section */}
      <View style={styles.captionSection}>
        <Text style={styles.captionText}>
          <Text style={styles.captionAuthor}>@{post.author.username} </Text>
          {isExpanded
            ? post.textContent
            : post.textContent.slice(0, 95)}
          {post.textContent.length > 95 && !isExpanded && (
            <Text
              onPress={() => setIsExpanded(true)}
              style={styles.moreToggle}>
              ... more
            </Text>
          )}
        </Text>

        {/* Comments count preview link */}
        {post.commentsCount > 0 && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onOpenComments(post)}
            style={styles.viewCommentsRow}>
            <Text style={styles.viewCommentsText}>
              View all {post.commentsCount} comments
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radii.card,
    marginBottom: Spacing.four,
    marginHorizontal: Spacing.four,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)' },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceMuted,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorFullName: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  verifiedIcon: {
    marginTop: 1,
  },
  authorHandle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  timeAgoText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  optionsBtn: {
    padding: Spacing.one,
  },
  mediaContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1, // Clean square presentation
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  locationPill: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: Spacing.three,
    paddingVertical: 5,
    borderRadius: Radii.pill,
    // @ts-ignore
    backdropFilter: 'blur(10px)',
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  mediaCounterBadge: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  mediaCounterText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  heartBurstOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.one,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.one,
  },
  actionCount: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  captionSection: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    paddingTop: Spacing.one,
  },
  captionText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textPrimary,
  },
  captionAuthor: {
    fontWeight: '700',
  },
  moreToggle: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  viewCommentsRow: {
    marginTop: Spacing.two,
  },
  viewCommentsText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
