/**
 * ProfileScreen — Babagang glassmorphic redesign (Phase F).
 *
 * Layout (top to bottom):
 *   GlassTopHeader (sticky)
 *   └─ ProfileHeader (hero banner → centred avatar → name/handle/bio → 3-col stats)
 *      └─ ProfileActionButtons (Follow | Message | Insight)
 *   ProfileTabs (icon-only: Grid | Users | Settings)
 *   Tab content:
 *     posts    → MasonryGrid (staggered 2-col)
 *     friends  → FriendCard list
 *     settings → settings menu rows
 *   FloatingTabBar
 */
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import {
  ArchiveIcon,
  BookmarkIcon,
  HeartIcon,
  LogoutIcon,
  SendIcon,
  SettingsIcon,
  StarIcon,
  UsersIcon,
} from '../assets/Icon';
import ConfirmModal from '../components/HomeScreen/ConfirmModal';
import CreatePostModal from '../components/HomeScreen/CreatePostModal';
import AboutCard from '../components/profileScreen/AboutCard';
import EditProfileModal from '../components/profileScreen/EditProfileModal';
import FriendCard from '../components/profileScreen/FriendCard';
import MasonryGrid, { GridItem } from '../components/profileScreen/MasonryGrid';
import ProfileActionButtons from '../components/profileScreen/ProfileActionButtons';
import ProfileHeader from '../components/profileScreen/ProfileHeader';
import ProfileTabs from '../components/profileScreen/ProfileTabs';
import GlassTopHeader from '../components/layout/GlassTopHeader';
import EmptyState from '../components/ui/EmptyState';
import { getUserPosts } from '../api/posts';
import { resolveMediaUrl } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useGoToTab } from '../hooks/useGoToTab';
import { useSaved } from '../contexts/SavedContext';
import { useLiked } from '../contexts/LikedContext';
import { mockFriendsByUser } from '../data/mockData';
import { RootStackParamList } from '../navigation/types';
import { C } from '../theme/colors';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Profile'>;
type ProfileTab = 'posts' | 'liked' | 'saved' | 'friends' | 'settings';

// Post (có media) → ô masonry.
const toGridItems = (posts: { id: string; mediaUrl: string[]; reactionCount: number }[]): GridItem[] =>
  posts
    .filter(p => p.mediaUrl.length > 0)
    .map(p => ({ id: p.id, imageUri: resolveMediaUrl(p.mediaUrl[0]), likeCount: p.reactionCount }));

// ── Mock masonry grid data (replace with real API data when backend is ready) ─
const MOCK_GRID_ITEMS: GridItem[] = [
  {
    id: 'g1',
    imageUri: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80',
    likeCount: 1200,
  },
  {
    id: 'g2',
    imageUri: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=400&q=80',
    likeCount: 854,
  },
  {
    id: 'g3',
    imageUri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    likeCount: 2400,
  },
  {
    id: 'g4',
    imageUri: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=400&q=80',
    likeCount: 3100,
  },
  {
    id: 'g5',
    imageUri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    likeCount: 980,
  },
  {
    id: 'g6',
    imageUri: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=400&q=80',
    likeCount: 1750,
  },
];

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { currentUser, logout, updateCurrentUser } = useAuth();
  const goToTab = useGoToTab();
  const { saved } = useSaved();
  const { liked } = useLiked();

  const savedGridItems = toGridItems(saved);
  const likedGridItems = toGridItems(liked);

  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [composerVisible, setComposerVisible] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [myPosts, setMyPosts] = useState<{ id: string; mediaUrl: string[]; reactionCount: number }[]>([]);
  const [postsCount, setPostsCount] = useState(0);

  // Đếm post thật của mình (GET /api/posts/user/{id}/page).
  useEffect(() => {
    if (!currentUser) return;
    getUserPosts(currentUser.userId, 0, 50)
      .then(res => {
        const posts = res?.data ?? [];
        setMyPosts(posts);
        setPostsCount(res?.totalElements ?? posts.length);
      })
      .catch(() => {
        setMyPosts([]);
        setPostsCount(0);
      });
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  // Guard — screen only reachable after login
  if (!currentUser) return null;

  const friends = mockFriendsByUser[currentUser.userId] ?? [];

  return (
    <View className="flex-1 bg-paper-base dark:bg-ink-base">
      {/* Sticky top header */}
      <GlassTopHeader
        title="Profile"
        onPressMenu={() => setEditModalVisible(true)}
        onPressAdd={() => setComposerVisible(true)}
        onPressBell={() => goToTab('notifications')}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile Header (hero + avatar + bio + stats) ──────────────── */}
        <ProfileHeader
          coverImage={currentUser.coverImage}
          avatar={currentUser.avatar}
          displayName={currentUser.fullName}
          handle={currentUser.handle}
          bio={currentUser.bio}
          postsCount={postsCount}
          followersCount={friends.length * 12} // mock — swap with real data
          followingCount={friends.length * 8}  // mock — swap with real data
          showChangeCover
          onChangeCover={() =>
            Alert.alert('Change Cover', 'Photo picker not supported in this demo.')
          }
          actions={
            <ProfileActionButtons
              onFollow={() => Alert.alert('Follow', 'This is your own profile!')}
              onMessage={() => setComposerVisible(true)}
              onInsight={() => Alert.alert('Insight', 'Analytics coming soon.')}
            />
          }
        />

        {/* ── Icon-Only Profile Tabs ─────────────────────────────────────── */}
        <ProfileTabs<ProfileTab>
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          iconOnly
          tabs={[
            { key: 'posts', label: 'Posts', Icon: ArchiveIcon },
            { key: 'liked', label: 'Liked', Icon: HeartIcon },
            { key: 'saved', label: 'Saved', Icon: BookmarkIcon },
            { key: 'friends', label: 'Friends', Icon: UsersIcon },
            { key: 'settings', label: 'Settings', Icon: SettingsIcon },
          ]}
        />

        {/* ── Tab: Posts → Staggered Masonry Grid ───────────────────────── */}
        {activeTab === 'posts' && (
          toGridItems(myPosts).length > 0 ? (
            <MasonryGrid items={toGridItems(myPosts)} />
          ) : MOCK_GRID_ITEMS.length > 0 ? (
            <MasonryGrid items={MOCK_GRID_ITEMS} />
          ) : (
            <View className="px-5 mt-5">
              <EmptyState
                icon={<ArchiveIcon size={26} color={C.brand} />}
                title="No posts yet"
                subtitle="Your first vibe awaits…"
              />
            </View>
          )
        )}

        {/* ── Tab: Liked → bài mình đã thả tim/lửa (mock, in-memory) ────── */}
        {activeTab === 'liked' && (
          likedGridItems.length > 0 ? (
            <MasonryGrid items={likedGridItems} />
          ) : (
            <View className="px-5 mt-5">
              <EmptyState
                icon={<HeartIcon size={26} color={C.brand} />}
                title="No liked posts"
                subtitle="Posts you react to show up here."
              />
            </View>
          )
        )}

        {/* ── Tab: Saved → bài đã bookmark (mock, in-memory) ────────────── */}
        {activeTab === 'saved' && (
          savedGridItems.length > 0 ? (
            <MasonryGrid items={savedGridItems} />
          ) : (
            <View className="px-5 mt-5">
              <EmptyState
                icon={<BookmarkIcon size={26} color={C.brand} />}
                title="No saved posts"
                subtitle="Tap the bookmark on any post to save it here."
              />
            </View>
          )
        )}

        {/* ── Tab: Friends ───────────────────────────────────────────────── */}
        {activeTab === 'friends' && (
          <View className="px-5 mt-5" style={{ gap: 12 }}>
            {friends.length > 0 ? (
              friends.map(friend => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onPress={() => navigation.push('OtherProfile', { userId: friend.id })}
                />
              ))
            ) : (
              <EmptyState icon={<UsersIcon size={26} color={C.brand} />} title="No friends yet" />
            )}
          </View>
        )}

        {/* ── Tab: Settings ─────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <View className="px-5 mt-5" style={{ gap: 16 }}>
            <View className="bg-paper-raised dark:bg-ink-raised rounded-card border border-hairline-light dark:border-hairline-dark overflow-hidden">
              <Pressable
                onPress={() => navigation.navigate('CloseFriends')}
                className="flex-row items-center gap-3 px-4 py-4 border-b border-hairline-light dark:border-hairline-dark active:bg-paper-overlay dark:active:bg-white/5"
              >
                <StarIcon size={18} />
                <Text className="text-content-strong dark:text-content-strong-dark font-medium flex-1">
                  Close Friends
                </Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('SentMoments')}
                className="flex-row items-center gap-3 px-4 py-4 border-b border-hairline-light dark:border-hairline-dark active:bg-paper-overlay dark:active:bg-white/5"
              >
                <SendIcon size={18} color={C.contentFaint} />
                <Text className="text-content-strong dark:text-content-strong-dark font-medium flex-1">
                  Sent Moments
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setLogoutConfirmVisible(true)}
                className="flex-row items-center gap-3 px-4 py-4 active:bg-paper-overlay dark:active:bg-white/5"
              >
                <LogoutIcon size={18} />
                <Text className="text-danger font-medium flex-1">Log Out</Text>
              </Pressable>
            </View>

            <AboutCard profile={currentUser} />
          </View>
        )}
      </ScrollView>

      <ConfirmModal
        visible={logoutConfirmVisible}
        icon={<LogoutIcon size={28} color={C.danger} />}
        title="Log Out"
        message="Are you sure you want to let your session fade away?"
        confirmLabel="Log Out"
        confirmColor={C.danger}
        onCancel={() => setLogoutConfirmVisible(false)}
        onConfirm={() => {
          setLogoutConfirmVisible(false);
          handleLogout();
        }}
      />

      <EditProfileModal
        visible={editModalVisible}
        profile={currentUser}
        onClose={() => setEditModalVisible(false)}
        onSave={updated => {
          updateCurrentUser(updated);
          setEditModalVisible(false);
        }}
      />

      <CreatePostModal
        visible={composerVisible}
        onClose={() => setComposerVisible(false)}
      />
    </View>
  );
}
