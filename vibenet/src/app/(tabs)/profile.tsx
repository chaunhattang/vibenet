import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { useAuth } from '../../contexts/AuthContext';
import * as postsApi from '../../services/api/posts';
import * as friendsApi from '../../services/api/friends';
import type { PostResponse, UserResponse } from '../../services/api/types';
import { resolveMediaUrl } from '../../services/config';
import { Colors, Radii, Spacing, Typography, BottomTabInset, MaxContentWidth } from '../../constants/theme';
import { EditProfileModal } from '../../components/profile/EditProfileModal';
import { ProfileSkeleton } from '../../components/skeletons/ProfileSkeleton';
import { PostGridThumbnail } from '../../components/common/PostGridThumbnail';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_WIDTH = Math.min(SCREEN_WIDTH, MaxContentWidth);
const TAB_WIDTH = CONTAINER_WIDTH / 4;
const GRID_ITEM_SIZE = (CONTAINER_WIDTH - 32 - 10) / 2;

type ProfileTab = 'posts' | 'liked' | 'saved' | 'friends';

const TAB_INDEX_MAP: Record<ProfileTab, number> = {
  posts: 0,
  liked: 1,
  saved: 2,
  friends: 3,
};

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [myPosts, setMyPosts] = useState<PostResponse[]>([]);
  const [likedPosts, setLikedPosts] = useState<PostResponse[]>([]);
  const [savedPosts, setSavedPosts] = useState<PostResponse[]>([]);
  const [friends, setFriends] = useState<UserResponse[]>([]);

  const loadTab = useCallback(
    async (tab: ProfileTab) => {
      if (!user) return;
      try {
        if (tab === 'posts') {
          const page = await postsApi.getPostsByUser(user.id);
          setMyPosts(page.data);
        } else if (tab === 'liked') {
          const page = await postsApi.getLikedPosts();
          setLikedPosts(page.data);
        } else if (tab === 'saved') {
          const page = await postsApi.getSavedPosts();
          setSavedPosts(page.data);
        } else if (tab === 'friends') {
          const list = await friendsApi.getUserFriends(user.id);
          setFriends(list);
        }
      } catch (err) {
        console.warn('Failed to load profile tab', tab, err);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    postsApi
      .getPostsByUser(user.id)
      .then((page) => setMyPosts(page.data))
      .catch((err) => console.warn('Failed to load posts', err))
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  useEffect(() => {
    loadTab(activeTab);
  }, [activeTab, loadTab]);

  // Smooth linear tab indicator slide
  const indicatorTranslateX = useSharedValue(0);

  useEffect(() => {
    const targetX = TAB_INDEX_MAP[activeTab] * TAB_WIDTH;
    indicatorTranslateX.value = withTiming(targetX, { duration: 160 });
  }, [activeTab]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorTranslateX.value }],
  }));

  const handleLogoutPress = () => {
    setIsLogoutModalVisible(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalVisible(false);
    logout();
  };

  const handleSwitchTab = (tab: ProfileTab) => {
    if (tab !== activeTab) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      setActiveTab(tab);
    }
  };

  const renderGrid = (posts: PostResponse[]) => (
    <Animated.View
      key={`grid-${activeTab}`}
      entering={FadeIn.duration(150)}
      style={styles.gridContainer}>
      {posts.map((post) => (
        <TouchableOpacity
          key={post.id}
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)')}
          style={styles.gridItem}>
          <PostGridThumbnail
            mediaUrl={post.mediaUrl[0]}
            textContent={post.textContent}
            textGradient={post.textGradient}
            style={styles.gridItemImg}
          />
          <View style={styles.gridItemOverlay}>
            <View style={styles.gridStat}>
              <Ionicons name="heart" size={12} color="#FFFFFF" />
              <Text style={styles.gridStatText}>{post.reactionCount}</Text>
            </View>
            <View style={styles.gridStat}>
              <Ionicons name="chatbubble" size={12} color="#FFFFFF" />
              <Text style={styles.gridStatText}>{post.commentCount}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {posts.length === 0 && (
        <View style={styles.emptyTabState}>
          <Ionicons name="images-outline" size={36} color={Colors.textTertiary} />
          <Text style={styles.emptyTabTitle}>No posts here yet</Text>
        </View>
      )}
    </Animated.View>
  );

  const renderFriendsList = () => (
    <Animated.View
      key="friends-list"
      entering={FadeIn.duration(150)}
      style={styles.friendsListContainer}>
      {friends.map((friend) => (
        <TouchableOpacity
          key={friend.id}
          activeOpacity={0.7}
          onPress={() => router.push(`/chat/${friend.id}` as any)}
          style={styles.friendCard}>
          <Image source={{ uri: resolveMediaUrl(friend.profileResponse?.avatarUrl) || DEFAULT_AVATAR }} style={styles.friendAvatar} />
          <View style={styles.friendDetails}>
            <Text style={styles.friendName}>{friend.profileResponse?.fullName || friend.username}</Text>
            <Text style={styles.friendHandle}>@{friend.username}</Text>
          </View>
          <TouchableOpacity
            style={styles.messageFriendBtn}
            onPress={() => router.push(`/chat/${friend.id}` as any)}>
            <Text style={styles.messageFriendText}>Message</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      {friends.length === 0 && (
        <View style={styles.emptyTabState}>
          <Feather name="users" size={36} color={Colors.textTertiary} />
          <Text style={styles.emptyTabTitle}>No friends yet</Text>
        </View>
      )}
    </Animated.View>
  );

  const profile = user?.profileResponse;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          {/* Top Bar Actions */}
          <View style={styles.topBar}>
            <Text style={styles.topUsername}>@{user?.username || ''}</Text>
            <View style={styles.topRightBtns}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/(tabs)/notifications')}
                style={styles.topIconBtn}>
                <Ionicons name="heart-outline" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleLogoutPress}
                style={styles.topIconBtn}>
                <Ionicons name="log-out-outline" size={20} color={Colors.statusLive} />
              </TouchableOpacity>
            </View>
          </View>

          {isLoading ? (
            <ProfileSkeleton />
          ) : (
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
                <Text style={styles.fullName}>{profile?.fullName || user?.username || ''}</Text>
              </View>

              <Text style={styles.bioText}>{profile?.bio || 'No bio yet.'}</Text>
            </View>

            {/* Metrics Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{myPosts.length}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{friends.length}</Text>
                <Text style={styles.statLabel}>Friends</Text>
              </View>
            </View>

            {/* Action Buttons: Edit Profile & Share */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsEditModalVisible(true)}
                style={styles.primaryActionBtn}>
                <Text style={styles.primaryActionText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} style={styles.secondaryActionBtn}>
                <Text style={styles.secondaryActionText}>Share Profile</Text>
              </TouchableOpacity>
            </View>

            {/* Profile Tabs Switcher with Spring Gliding Indicator */}
            <View style={styles.tabsRowWrapper}>
              <View style={styles.tabsRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSwitchTab('posts')}
                  style={styles.tabBtn}>
                  <Feather
                    name="grid"
                    size={20}
                    color={activeTab === 'posts' ? Colors.textPrimary : Colors.textTertiary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSwitchTab('liked')}
                  style={styles.tabBtn}>
                  <Ionicons
                    name={activeTab === 'liked' ? 'heart' : 'heart-outline'}
                    size={22}
                    color={activeTab === 'liked' ? Colors.statusLive : Colors.textTertiary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSwitchTab('saved')}
                  style={styles.tabBtn}>
                  <Ionicons
                    name={activeTab === 'saved' ? 'bookmark' : 'bookmark-outline'}
                    size={20}
                    color={activeTab === 'saved' ? Colors.accentBlue : Colors.textTertiary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSwitchTab('friends')}
                  style={styles.tabBtn}>
                  <Feather
                    name="users"
                    size={20}
                    color={activeTab === 'friends' ? Colors.textPrimary : Colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>

              {/* Sliding Spring Indicator Line */}
              <Animated.View
                style={[
                  styles.activeIndicatorLine,
                  { width: TAB_WIDTH },
                  animatedIndicatorStyle,
                ]}
              />
            </View>

            {/* Animated Tab Contents */}
            {activeTab === 'posts' && renderGrid(myPosts)}
            {activeTab === 'liked' && renderGrid(likedPosts)}
            {activeTab === 'saved' && renderGrid(savedPosts)}
            {activeTab === 'friends' && renderFriendsList()}
          </ScrollView>
        )}
        </View>

        {/* Edit Profile Modal */}
        <EditProfileModal
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
        />

        <ConfirmModal
          visible={isLogoutModalVisible}
          title="Log out of VibeNet?"
          description="You'll need to sign back in with your username and password to use the app again."
          icon="log-out-outline"
          confirmText="Log Out"
          cancelText="Cancel"
          destructive
          onCancel={() => setIsLogoutModalVisible(false)}
          onConfirm={handleConfirmLogout}
        />
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
  topUsername: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  topRightBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
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
  primaryActionBtn: {
    flex: 1,
    height: 42,
    borderRadius: Radii.pill,
    backgroundColor: '#0D0E11',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryActionBtn: {
    flex: 1,
    height: 42,
    borderRadius: Radii.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  tabsRowWrapper: {
    position: 'relative',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabBtn: {
    flex: 1,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicatorLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    backgroundColor: Colors.textPrimary,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.four,
    gap: 10,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE * 1.25,
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
    gap: 8,
  },
  gridStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.pill,
  },
  gridStatText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyTabState: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.eight,
    gap: Spacing.two,
  },
  emptyTabTitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  friendsListContainer: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radii.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: Spacing.three,
  },
  friendAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.surfaceMuted,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  friendHandle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  messageFriendBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radii.pill,
    backgroundColor: '#0D0E11',
  },
  messageFriendText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
