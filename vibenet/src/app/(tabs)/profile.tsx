import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { MOCK_POSTS, MOCK_USERS } from '../../data/mockData';
import { Colors, Radii, Spacing, Typography, BottomTabInset, MaxContentWidth } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_ITEM_SIZE = (Math.min(SCREEN_WIDTH, MaxContentWidth) - 32 - 10) / 2;

type ProfileTab = 'posts' | 'liked' | 'saved' | 'friends';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');

  const myPosts = MOCK_POSTS;
  const savedPosts = MOCK_POSTS.filter((p) => p.isSaved);
  const likedPosts = MOCK_POSTS.filter((p) => p.isLiked);

  const renderGrid = (posts: typeof MOCK_POSTS) => (
    <View style={styles.gridContainer}>
      {posts.map((post) => (
        <TouchableOpacity
          key={post.id}
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)')}
          style={styles.gridItem}>
          <Image
            source={{ uri: post.mediaUrls[0] }}
            style={styles.gridItemImg}
            contentFit="cover"
          />
          <View style={styles.gridItemOverlay}>
            <View style={styles.gridStat}>
              <Ionicons name="heart" size={12} color="#FFFFFF" />
              <Text style={styles.gridStatText}>{post.likesCount}</Text>
            </View>
            <View style={styles.gridStat}>
              <Ionicons name="chatbubble" size={12} color="#FFFFFF" />
              <Text style={styles.gridStatText}>{post.commentsCount}</Text>
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
    </View>
  );

  const renderFriendsList = () => (
    <View style={styles.friendsListContainer}>
      {MOCK_USERS.map((friend) => (
        <TouchableOpacity
          key={friend.id}
          activeOpacity={0.7}
          onPress={() => router.push(`/chat/${friend.id}` as any)}
          style={styles.friendCard}>
          <Image source={{ uri: friend.avatarUrl }} style={styles.friendAvatar} />
          <View style={styles.friendDetails}>
            <Text style={styles.friendName}>{friend.fullName}</Text>
            <Text style={styles.friendHandle}>@{friend.username}</Text>
          </View>
          <TouchableOpacity
            style={styles.messageFriendBtn}
            onPress={() => router.push(`/chat/${friend.id}` as any)}>
            <Text style={styles.messageFriendText}>Message</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          {/* Top Bar Actions */}
          <View style={styles.topBar}>
            <Text style={styles.topUsername}>@{user?.username || 'alexrivera'}</Text>
            <View style={styles.topRightBtns}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/(tabs)/notifications')}
                style={styles.topIconBtn}>
                <Ionicons name="heart-outline" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={logout}
                style={styles.topIconBtn}>
                <Ionicons name="log-out-outline" size={20} color={Colors.statusLive} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* Cover Banner */}
            <View style={styles.coverContainer}>
              <Image
                source={{
                  uri:
                    user?.coverImageUrl ||
                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
                }}
                style={styles.coverImage}
                contentFit="cover"
              />
            </View>

            {/* Avatar Floating Center */}
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri:
                    user?.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                }}
                style={styles.avatarImg}
              />
            </View>

            {/* User Details */}
            <View style={styles.profileInfoSection}>
              <View style={styles.nameRow}>
                <Text style={styles.fullName}>{user?.fullName || 'Alex Rivera'}</Text>
                {user?.isVerified && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={Colors.accentBlue}
                  />
                )}
              </View>
              <Text style={styles.handleText}>@{user?.username || 'alexrivera'}</Text>

              {user?.bio ? <Text style={styles.bioText}>{user.bio}</Text> : null}

              {user?.website ? (
                <View style={styles.websiteRow}>
                  <Feather name="link" size={12} color={Colors.accentBlue} />
                  <Text style={styles.websiteText}>{user.website}</Text>
                </View>
              ) : null}
            </View>

            {/* Stats Row */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user?.postsCount || 42}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user?.friendsCount || 384}</Text>
                <Text style={styles.statLabel}>Friends</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{user?.momentsCount || 128}</Text>
                <Text style={styles.statLabel}>Moments</Text>
              </View>
            </View>

            {/* Action Buttons: Edit Profile & Share */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity activeOpacity={0.8} style={styles.primaryActionBtn}>
                <Text style={styles.primaryActionText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} style={styles.secondaryActionBtn}>
                <Text style={styles.secondaryActionText}>Share Profile</Text>
              </TouchableOpacity>
            </View>

            {/* Profile Tabs Switcher */}
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
                onPress={() => setActiveTab('liked')}
                style={[styles.tabBtn, activeTab === 'liked' && styles.activeTabBtn]}>
                <Ionicons
                  name={activeTab === 'liked' ? 'heart' : 'heart-outline'}
                  size={22}
                  color={activeTab === 'liked' ? Colors.statusLive : Colors.textTertiary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveTab('saved')}
                style={[styles.tabBtn, activeTab === 'saved' && styles.activeTabBtn]}>
                <Ionicons
                  name={activeTab === 'saved' ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color={activeTab === 'saved' ? Colors.accentBlue : Colors.textTertiary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveTab('friends')}
                style={[styles.tabBtn, activeTab === 'friends' && styles.activeTabBtn]}>
                <Feather
                  name="users"
                  size={20}
                  color={activeTab === 'friends' ? Colors.textPrimary : Colors.textTertiary}
                />
              </TouchableOpacity>
            </View>

            {/* Tab Contents */}
            {activeTab === 'posts' && renderGrid(myPosts)}
            {activeTab === 'liked' && renderGrid(likedPosts)}
            {activeTab === 'saved' && renderGrid(savedPosts)}
            {activeTab === 'friends' && renderFriendsList()}
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
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: BottomTabInset + Spacing.six,
  },
  coverContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#0D0E11',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -50,
  },
  avatarImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: Colors.surfaceMuted,
  },
  profileInfoSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fullName: {
    ...Typography.titleMedium,
    fontSize: 20,
    color: Colors.textPrimary,
  },
  handleText: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  bioText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.two,
    lineHeight: 18,
  },
  websiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.one,
  },
  websiteText: {
    ...Typography.caption,
    color: Colors.accentBlue,
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.four,
    marginTop: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...Typography.bodyLarge,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#EAEAEA',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.three,
  },
  primaryActionBtn: {
    flex: 1,
    height: 38,
    borderRadius: Radii.pill,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flex: 1,
    height: 38,
    borderRadius: Radii.pill,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
    marginTop: Spacing.four,
    backgroundColor: '#FFFFFF',
  },
  tabBtn: {
    paddingVertical: Spacing.three,
    flex: 1,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabBtn: {
    borderBottomColor: Colors.textPrimary,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    borderRadius: Radii.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.surfaceMuted,
  },
  gridItemImg: {
    width: '100%',
    height: '100%',
  },
  gridItemOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  gridStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  gridStatText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  emptyTabState: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing.eight,
    gap: Spacing.two,
  },
  emptyTabTitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  friendsListContainer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.two,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.three,
    borderRadius: Radii.md,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceMuted,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  friendHandle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  messageFriendBtn: {
    backgroundColor: Colors.surfaceMuted,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radii.pill,
  },
  messageFriendText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
