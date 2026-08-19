import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors, Radii, Spacing, Typography, BottomTabInset, MaxContentWidth } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { SendMomentModal } from '../../components/locket/SendMomentModal';
import { CloseFriendsModal } from '../../components/locket/CloseFriendsModal';
import { MyMomentsModal } from '../../components/locket/MyMomentsModal';
import { getMomentsFeed, reactToMoment, viewMoment, type MomentFeedItemResponse } from '../../services/api/locket';
import { resolveMediaUrl } from '../../services/config';

export default function LocketScreen() {
  const { user } = useAuth();
  const [moments, setMoments] = useState<MomentFeedItemResponse[]>([]);
  const [activeMomentIdx, setActiveMomentIdx] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [flyingEmojis, setFlyingEmojis] = useState<{ id: string; emoji: string }[]>([]);
  const [isSendModalVisible, setIsSendModalVisible] = useState(false);
  const [isCloseFriendsVisible, setIsCloseFriendsVisible] = useState(false);
  const [isMyMomentsVisible, setIsMyMomentsVisible] = useState(false);

  const activeMoment = moments[activeMomentIdx] ?? moments[0];

  const load = useCallback(async () => {
    try {
      const feed = await getMomentsFeed(0, 20);
      setMoments(feed.data);
      setActiveMomentIdx(0);
    } catch (err) {
      console.warn('Failed to load moments feed', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    if (activeMoment && activeMoment.viewedAt === null) {
      viewMoment(activeMoment.momentId).catch(() => {});
    }
  }, [activeMoment]);

  const handleReactEmoji = (emoji: string) => {
    if (!user || !activeMoment) return;

    const newFlying = { id: `fe-${Date.now()}-${Math.random()}`, emoji };
    setFlyingEmojis((prev) => [...prev, newFlying]);

    reactToMoment(activeMoment.momentId, emoji).catch((err) => console.warn('React to moment failed', err));

    setTimeout(() => {
      setFlyingEmojis((prev) => prev.filter((item) => item.id !== newFlying.id));
    }, 1500);
  };

  const handleSendMoment = () => {
    load();
  };

  if (!activeMoment) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={styles.container}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No moments yet. This feed only shows moments your close friends send you — post one, and add close friends so they can see it too.
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsSendModalVisible(true)}
              style={styles.emptyStateBtn}>
              <Text style={styles.emptyStateBtnText}>Send a moment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsCloseFriendsVisible(true)}
              style={styles.emptyStateSecondaryBtn}>
              <Text style={styles.emptyStateSecondaryBtnText}>Manage close friends</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsMyMomentsVisible(true)}
              style={styles.emptyStateSecondaryBtn}>
              <Text style={styles.emptyStateSecondaryBtnText}>View your sent moments</Text>
            </TouchableOpacity>
          </View>
        </View>
        <SendMomentModal
          visible={isSendModalVisible}
          onClose={() => setIsSendModalVisible(false)}
          onSendMoment={handleSendMoment}
          onManageCloseFriends={() => {
            setIsSendModalVisible(false);
            setIsCloseFriendsVisible(true);
          }}
        />
        <CloseFriendsModal
          visible={isCloseFriendsVisible}
          onClose={() => setIsCloseFriendsVisible(false)}
        />
        <MyMomentsModal
          visible={isMyMomentsVisible}
          onClose={() => setIsMyMomentsVisible(false)}
          onSendNew={() => {
            setIsMyMomentsVisible(false);
            setIsSendModalVisible(true);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          {/* Top Header */}
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsCloseFriendsVisible(true)}
              style={styles.iconBtn}>
              <Ionicons name="people-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Locket Moments</Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsSendModalVisible(true)}
              style={styles.iconBtn}>
              <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.audienceContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsCloseFriendsVisible(true)}
              style={styles.audiencePill}>
              <View style={styles.greenDot} />
              <Text style={styles.audienceText}>Close Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsMyMomentsVisible(true)}
              style={styles.myMomentsPill}>
              <Ionicons name="images-outline" size={13} color="#FFFFFF" />
              <Text style={styles.audienceText}>Your Moments</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            <View style={styles.viewfinderCard}>
              <Image
                source={{ uri: resolveMediaUrl(activeMoment.mediaUrl) }}
                style={styles.momentImage}
                contentFit="cover"
              />

              <View style={styles.authorBadge}>
                <Image source={{ uri: resolveMediaUrl(activeMoment.senderAvatarUrl) }} style={styles.authorAvatar} />
                <View>
                  <Text style={styles.authorName}>{activeMoment.senderName}</Text>
                  <Text style={styles.momentTime}>{new Date(activeMoment.createdAt).toLocaleString()}</Text>
                </View>
              </View>

              <View style={styles.flyingLayer} pointerEvents="none">
                {flyingEmojis.map((item) => (
                  <Text key={item.id} style={styles.flyingEmojiText}>
                    {item.emoji}
                  </Text>
                ))}
              </View>

              {activeMoment.caption ? (
                <View style={styles.captionOverlay}>
                  <Text style={styles.captionText}>{activeMoment.caption}</Text>
                </View>
              ) : null}
            </View>

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

            <View style={styles.replyBoxContainer}>
              <TextInput
                placeholder={`Reply to ${activeMoment.senderName.split(' ')[0]}...`}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={replyText}
                onChangeText={setReplyText}
                style={styles.replyInput}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsSendModalVisible(true)}
                style={styles.cameraIconBtn}>
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

        <SendMomentModal
          visible={isSendModalVisible}
          onClose={() => setIsSendModalVisible(false)}
          onSendMoment={handleSendMoment}
          onManageCloseFriends={() => {
            setIsSendModalVisible(false);
            setIsCloseFriendsVisible(true);
          }}
        />
        <CloseFriendsModal
          visible={isCloseFriendsVisible}
          onClose={() => setIsCloseFriendsVisible(false)}
        />
        <MyMomentsModal
          visible={isMyMomentsVisible}
          onClose={() => setIsMyMomentsVisible(false)}
          onSendNew={() => {
            setIsMyMomentsVisible(false);
            setIsSendModalVisible(true);
          }}
        />
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    paddingHorizontal: Spacing.six,
  },
  emptyStateText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyStateBtn: {
    backgroundColor: Colors.statusCloseFriend,
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.three,
    borderRadius: Radii.pill,
  },
  emptyStateBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyStateSecondaryBtn: {
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.two,
  },
  emptyStateSecondaryBtnText: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    fontSize: 13,
    textDecorationLine: 'underline',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
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
  myMomentsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: Spacing.four,
    paddingVertical: 8,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
