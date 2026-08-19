import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import * as usersApi from '../../services/api/users';
import * as postsApi from '../../services/api/posts';
import * as reelsApi from '../../services/api/reels';
import * as friendsApi from '../../services/api/friends';
import type { FriendshipStatus } from '../../services/api/friends';
import type { PostResponse, ReelResponse, UserResponse } from '../../services/api/types';
import { resolveMediaUrl } from '../../services/config';
import { MediaThumbnail } from '../../components/common/MediaThumbnail';
import { PostGridThumbnail } from '../../components/common/PostGridThumbnail';
import { Colors, Radii, Spacing, Typography, BottomTabInset, MaxContentWidth } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_ITEM_SIZE = (Math.min(SCREEN_WIDTH, MaxContentWidth) - 32 - 10) / 2;

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';

export default function OtherUserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState<UserResponse | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [friendStatus, setFriendStatus] = useState<FriendshipStatus>('NONE');
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [isFriendActionPending, setIsFriendActionPending] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'reels'>('posts');
  const [userPosts, setUserPosts] = useState<PostResponse[]>([]);
  const [userReels, setUserReels] = useState<ReelResponse[]>([]);

  const isSelf = currentUser?.id === id;

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const [fetchedUser, postsPage, followers] = await Promise.all([
        usersApi.getUserById(id),
        postsApi.getPostsByUser(id),
        usersApi.getFollowers(id, 0, 1),
      ]);
      setProfileUser(fetchedUser);
      setUserPosts(postsPage.data);
      setFollowersCount(followers.totalElements);
      if (!isSelf && currentUser) {
        const myFollowing = await usersApi.getFollowing(currentUser.id, 0, 100);
        setIsFollowing(myFollowing.data.some((u) => u.id === id));

        const status = await friendsApi.checkFriendshipStatus(id);
        setFriendStatus(status.status);
        setFriendshipId(status.friendshipId);
      }
    } catch (err) {
      console.warn('Failed to load profile', err);
    }
  }, [id, isSelf, currentUser]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (activeTab !== 'reels' || !id || userReels.length > 0) return;
    reelsApi
      .getUserReels(id)
      .then((page) => setUserReels(page.data))
      .catch((err) => console.warn('Failed to load reels', err));
  }, [activeTab, id, userReels.length]);

  const handleToggleFollow = async () => {
    if (!id) return;
    try {
      if (isFollowing) {
        const res = await usersApi.unfollow(id);
        setIsFollowing(res.isFollowing);
        setFollowersCount(res.followersCount);
      } else {
        const res = await usersApi.follow(id);
        setIsFollowing(res.isFollowing);
        setFollowersCount(res.followersCount);
      }
    } catch (err) {
      console.warn('Follow toggle failed', err);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!id || isFriendActionPending) return;
    setIsFriendActionPending(true);
    try {
      await friendsApi.sendFriendRequest(id);
      setFriendStatus('PENDING_SENT');
    } catch (err) {
      console.warn('Send friend request failed', err);
    } finally {
      setIsFriendActionPending(false);
    }
  };

  const handleCancelOrUnfriend = async () => {
    if (!id || isFriendActionPending) return;
    setIsFriendActionPending(true);
    try {
      await friendsApi.unfriend(id);
      setFriendStatus('NONE');
      setFriendshipId(null);
    } catch (err) {
      console.warn('Cancel/unfriend failed', err);
    } finally {
      setIsFriendActionPending(false);
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (!friendshipId || isFriendActionPending) return;
    setIsFriendActionPending(true);
    try {
      await friendsApi.acceptFriendRequest(friendshipId);
      setFriendStatus('FRIENDS');
    } catch (err) {
      console.warn('Accept friend request failed', err);
    } finally {
      setIsFriendActionPending(false);
    }
  };

  const handleDeclineFriendRequest = async () => {
    if (!friendshipId || isFriendActionPending) return;
    setIsFriendActionPending(true);
    try {
      await friendsApi.declineFriendRequest(friendshipId);
      setFriendStatus('NONE');
      setFriendshipId(null);
    } catch (err) {
      console.warn('Decline friend request failed', err);
    } finally {
      setIsFriendActionPending(false);
    }
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out @${profileUser?.username}'s profile on VibeNet! https://vibenet.io/@${profileUser?.username}`,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  const handleDirectMessage = () => {
    if (!id) return;
    router.push(`/chat/${id}` as any);
  };

  const profile = profileUser?.profileResponse;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          {/* Top Header Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              style={styles.topIconBtn}>
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.topUsername}>@{profileUser?.username || ''}</Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleShareProfile}
              style={styles.topIconBtn}>
              <Feather name="share" size={18} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* Cover Banner */}
            <View style={styles.coverContainer}>
              <Image
                source={{ uri: resolveMediaUrl(profile?.coverImageUrl) || DEFAULT_COVER }}
                style={styles.coverImage}
                contentFit="cover"
              />
            </View>

            {/* Avatar Floating Center */}
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: resolveMediaUrl(profile?.avatarUrl) || DEFAULT_AVATAR }}
                style={styles.avatarImg}
              />
            </View>

            {/* User Details */}
            <View style={styles.profileInfoSection}>
              <View style={styles.nameRow}>
                <Text style={styles.fullName}>{profile?.fullName || profileUser?.username || ''}</Text>
              </View>

              <Text style={styles.bioText}>{profile?.bio || 'No bio yet.'}</Text>
            </View>

            {/* Metrics Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userPosts.length}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{followersCount}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
            </View>

            {/* Action Buttons: Follow & Message */}
            {!isSelf && (
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleToggleFollow}
                  style={[
                    styles.followBtn,
                    isFollowing ? styles.followingBtn : styles.notFollowingBtn,
                  ]}>
                  <Text
                    style={[
                      styles.followBtnText,
                      isFollowing ? styles.followingBtnText : styles.notFollowingBtnText,
                    ]}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleDirectMessage}
                  style={styles.messageBtn}>
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors.textPrimary} />
                  <Text style={styles.messageBtnText}>Message</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Friend Request Row */}
            {!isSelf && (
              <View style={styles.friendActionRow}>
                {friendStatus === 'NONE' && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={isFriendActionPending}
                    onPress={handleSendFriendRequest}
                    style={styles.friendBtn}>
                    <Ionicons name="person-add-outline" size={16} color={Colors.textPrimary} />
                    <Text style={styles.friendBtnText}>Add Friend</Text>
                  </TouchableOpacity>
                )}

                {friendStatus === 'PENDING_SENT' && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={isFriendActionPending}
                    onPress={handleCancelOrUnfriend}
                    style={styles.friendBtn}>
                    <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.friendBtnText}>Request Sent · Cancel</Text>
                  </TouchableOpacity>
                )}

                {friendStatus === 'PENDING_RECEIVED' && (
                  <>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      disabled={isFriendActionPending}
                      onPress={handleAcceptFriendRequest}
                      style={styles.friendAcceptBtn}>
                      <Text style={styles.friendAcceptBtnText}>Accept Friend Request</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      disabled={isFriendActionPending}
                      onPress={handleDeclineFriendRequest}
                      style={styles.friendDeclineBtn}>
                      <Ionicons name="close" size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </>
                )}

                {friendStatus === 'FRIENDS' && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={isFriendActionPending}
                    onPress={handleCancelOrUnfriend}
                    style={styles.friendBtn}>
                    <Ionicons name="people" size={16} color={Colors.textPrimary} />
                    <Text style={styles.friendBtnText}>Friends</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Tabs Row: Posts vs Reels */}
            <View style={styles.tabsRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveTab('posts')}
                style={[styles.tabBtn, activeTab === 'posts' && styles.activeTabBtn]}>
                <Feather
                  name="grid"
                  size={20}
                  color={activeTab === 'posts' ? Colors.textPrimary : Colors.textTertiary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveTab('reels')}
                style={[styles.tabBtn, activeTab === 'reels' && styles.activeTabBtn]}>
                <Ionicons
                  name={activeTab === 'reels' ? 'film' : 'film-outline'}
                  size={20}
                  color={activeTab === 'reels' ? Colors.textPrimary : Colors.textTertiary}
                />
              </TouchableOpacity>
            </View>

            {/* Grid Presentation */}
            <View style={styles.gridContainer}>
              {activeTab === 'posts'
                ? userPosts.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.85}
                      onPress={() => router.push('/(tabs)')}
                      style={styles.gridItem}>
                      <PostGridThumbnail
                        mediaUrl={item.mediaUrl[0]}
                        textContent={item.textContent}
                        textGradient={item.textGradient}
                        style={styles.gridItemImg}
                      />
                      <View style={styles.gridItemOverlay}>
                        <View style={styles.gridStat}>
                          <Ionicons name="heart" size={12} color="#FFFFFF" />
                          <Text style={styles.gridStatText}>{item.reactionCount}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                : userReels.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.85}
                      onPress={() => router.push('/(tabs)/explore')}
                      style={styles.gridItem}>
                      <MediaThumbnail uri={item.thumbnailUrl || item.videoUrl} style={styles.gridItemImg} />
                      <View style={styles.gridItemOverlay}>
                        <View style={styles.gridStat}>
                          <Ionicons name="heart" size={12} color="#FFFFFF" />
                          <Text style={styles.gridStatText}>{item.likesCount}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
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
    backgroundColor: Colors.bgMain,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.bgMain,
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
  },
  topIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  topUsername: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: BottomTabInset + Spacing.six,
  },
  coverContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#1E1E22',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -45,
  },
  avatarImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    backgroundColor: Colors.surfaceMuted,
  },
  profileInfoSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.two,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  fullName: {
    ...Typography.titleMedium,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bioText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 300,
    marginBottom: 6,
  },
  websiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  websiteText: {
    ...Typography.caption,
    color: Colors.accentBlue,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...Typography.titleSmall,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.four,
  },
  followBtn: {
    flex: 1,
    height: 42,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFollowingBtn: {
    backgroundColor: '#0D0E11',
  },
  followingBtn: {
    backgroundColor: '#E5E7EB',
  },
  followBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
  notFollowingBtnText: {
    color: '#FFFFFF',
  },
  followingBtnText: {
    color: '#0D0E11',
  },
  messageBtn: {
    flex: 1,
    height: 42,
    borderRadius: Radii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECECEC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  messageBtnText: {
    fontWeight: '700',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  friendActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.four,
  },
  friendBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: Radii.pill,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  friendBtnText: {
    fontWeight: '700',
    fontSize: 13,
    color: Colors.textPrimary,
  },
  friendAcceptBtn: {
    flex: 1,
    height: 40,
    borderRadius: Radii.pill,
    backgroundColor: Colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAcceptBtnText: {
    fontWeight: '700',
    fontSize: 13,
    color: '#FFFFFF',
  },
  friendDeclineBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  tabBtn: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabBtn: {
    borderBottomColor: Colors.textPrimary,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.four,
    gap: 10,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE * 1.3,
    borderRadius: Radii.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E1E22',
  },
  gridItemImg: {
    width: '100%',
    height: '100%',
  },
  gridItemOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  gridStatText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
