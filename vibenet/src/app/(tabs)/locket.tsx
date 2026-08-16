import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TextInput,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import { MOCK_LOCKET_MOMENTS, LocketMomentItem } from '../../data/mockData';
import { Colors, Radii, Spacing, Typography, BottomTabInset, MaxContentWidth } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LocketScreen() {
  const { user } = useAuth();
  const [moments, setMoments] = useState<LocketMomentItem[]>(MOCK_LOCKET_MOMENTS);
  const [activeMomentIdx, setActiveMomentIdx] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [flyingEmojis, setFlyingEmojis] = useState<{ id: string; emoji: string }[]>([]);

  const activeMoment = moments[activeMomentIdx] || moments[0];

  const handleReactEmoji = (emoji: string) => {
    if (!user || !activeMoment) return;

    // Add flying emoji animation effect
    const newFlying = { id: `fe-${Date.now()}-${Math.random()}`, emoji };
    setFlyingEmojis((prev) => [...prev, newFlying]);

    // Update reactions on active moment
    setMoments((prev) =>
      prev.map((m, idx) =>
        idx === activeMomentIdx
          ? {
              ...m,
              reactions: [
                ...m.reactions,
                {
                  id: `r-${Date.now()}`,
                  emoji,
                  user: user,
                  createdAt: 'Just now',
                },
              ],
            }
          : m
      )
    );

    setTimeout(() => {
      setFlyingEmojis((prev) => prev.filter((item) => item.id !== newFlying.id));
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          {/* Top Header */}
          <View style={styles.header}>
            <TouchableOpacity activeOpacity={0.7} style={styles.iconBtn}>
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Locket Moments</Text>

            <TouchableOpacity activeOpacity={0.7} style={styles.iconBtn}>
              <Ionicons name="camera-reverse-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Audience / Recipient Selector Pill */}
          <View style={styles.audienceContainer}>
            <TouchableOpacity activeOpacity={0.8} style={styles.audiencePill}>
              <View style={styles.greenDot} />
              <Text style={styles.audienceText}>
                {activeMoment?.recipientGroup || 'All Close Friends'} (5)
              </Text>
              <Ionicons name="chevron-down" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Viewfinder Cards */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* Viewfinder Moment Card */}
            <View style={styles.viewfinderCard}>
              <Image
                source={{ uri: activeMoment.mediaUrl }}
                style={styles.momentImage}
                contentFit="cover"
              />

              {/* Author Badge Top-Left Overlay */}
              <View style={styles.authorBadge}>
                <Image
                  source={{ uri: activeMoment.author.avatarUrl }}
                  style={styles.authorAvatar}
                />
                <View>
                  <Text style={styles.authorName}>
                    {activeMoment.author.fullName}
                  </Text>
                  <Text style={styles.momentTime}>
                    {activeMoment.timeAgo} {activeMoment.location ? `• ${activeMoment.location}` : ''}
                  </Text>
                </View>
              </View>

              {/* Flying Emojis Layer */}
              <View style={styles.flyingLayer} pointerEvents="none">
                {flyingEmojis.map((item) => (
                  <Text key={item.id} style={styles.flyingEmojiText}>
                    {item.emoji}
                  </Text>
                ))}
              </View>

              {/* Caption Overlay at Bottom of Card */}
              {activeMoment.caption ? (
                <View style={styles.captionOverlay}>
                  <Text style={styles.captionText}>{activeMoment.caption}</Text>
                </View>
              ) : null}
            </View>

            {/* Reaction Pill Bar */}
            <View style={styles.reactionBarContainer}>
              <View style={styles.reactionPill}>
                {['❤️', '🔥', '😮', '😂', '👏', '🥳'].map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    activeOpacity={0.6}
                    onPress={() => handleReactEmoji(emoji)}
                    style={styles.emojiBtn}>
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recent Reactions summary */}
            {activeMoment.reactions.length > 0 && (
              <View style={styles.reactionsSummaryRow}>
                <Text style={styles.reactionsSummaryLabel}>Reactions:</Text>
                <View style={styles.reactionsAvatars}>
                  {activeMoment.reactions.slice(-4).map((r, i) => (
                    <View key={i} style={styles.reactionAvatarPill}>
                      <Text style={styles.reactionEmojiBadge}>{r.emoji}</Text>
                      <Image
                        source={{ uri: r.user.avatarUrl }}
                        style={styles.reactionAvatarImg}
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Moments Carousel Indicators */}
            <View style={styles.momentSwitcher}>
              {moments.map((_, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setActiveMomentIdx(idx)}
                  style={[
                    styles.momentDot,
                    idx === activeMomentIdx && styles.momentDotActive,
                  ]}
                />
              ))}
            </View>

            {/* Quick Reply & Send Moment Input */}
            <View style={styles.replyBoxContainer}>
              <TextInput
                placeholder={`Reply to ${activeMoment.author.fullName.split(' ')[0]}...`}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={replyText}
                onChangeText={setReplyText}
                style={styles.replyInput}
              />
              <TouchableOpacity activeOpacity={0.7} style={styles.cameraIconBtn}>
                <Ionicons name="camera" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              {replyText ? (
                <TouchableOpacity
                  onPress={() => setReplyText('')}
                  style={styles.sendIconBtn}>
                  <Feather name="send" size={18} color="#0D0E11" />
                </TouchableOpacity>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    ...Typography.titleSmall,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  audienceContainer: {
    alignItems: 'center',
    marginVertical: Spacing.two,
  },
  audiencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: Spacing.four,
    paddingVertical: 8,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.statusCloseFriend,
  },
  audienceText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.six,
    alignItems: 'center',
  },
  viewfinderCard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#111113',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginTop: Spacing.two,
  },
  momentImage: {
    width: '100%',
    height: '100%',
  },
  authorBadge: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    // @ts-ignore
    backdropFilter: 'blur(16px)',
  },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  authorName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  momentTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
  },
  captionOverlay: {
    position: 'absolute',
    bottom: Spacing.three,
    left: Spacing.three,
    right: Spacing.three,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two + 2,
    borderRadius: Radii.lg,
    // @ts-ignore
    backdropFilter: 'blur(16px)',
  },
  captionText: {
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  flyingLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flyingEmojiText: {
    fontSize: 56,
  },
  reactionBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: Spacing.four,
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    width: '94%',
  },
  emojiBtn: {
    padding: 6,
    borderRadius: 20,
  },
  emojiText: {
    fontSize: 24,
  },
  reactionsSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  reactionsSummaryLabel: {
    ...Typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  reactionsAvatars: {
    flexDirection: 'row',
    gap: 6,
  },
  reactionAvatarPill: {
    position: 'relative',
  },
  reactionAvatarImg: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  reactionEmojiBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    fontSize: 10,
    zIndex: 2,
  },
  momentSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: Spacing.two,
  },
  momentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  momentDotActive: {
    width: 18,
    backgroundColor: '#FFFFFF',
  },
  replyBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.four,
    height: 50,
    width: '100%',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  replyInput: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontSize: 14,
  },
  cameraIconBtn: {
    padding: Spacing.one,
  },
  sendIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
