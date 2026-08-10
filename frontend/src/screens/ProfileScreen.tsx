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
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import {
  ArchiveIcon,
  LogoutIcon,
  SendIcon,
  SettingsIcon,
  StarIcon,
  UsersIcon,
} from '../assets/Icon';
import ConfirmModal from '../components/HomeScreen/ConfirmModal';
import CreateWhisperModal from '../components/HomeScreen/CreateWhisperModal';
import AboutCard from '../components/profileScreen/AboutCard';
import EditProfileModal from '../components/profileScreen/EditProfileModal';
import FriendCard from '../components/profileScreen/FriendCard';
import MasonryGrid, { GridItem } from '../components/profileScreen/MasonryGrid';
import ProfileActionButtons from '../components/profileScreen/ProfileActionButtons';
import ProfileHeader from '../components/profileScreen/ProfileHeader';
import ProfileTabs from '../components/profileScreen/ProfileTabs';
import GlassTopHeader from '../components/layout/GlassTopHeader';
import EmptyState from '../components/ui/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { usePosts } from '../contexts/PostsContext';
import { mockFriendsByUser } from '../data/mockData';
import FloatingTabBar, { TabKey } from '../layout/FloatingTabBar';
import { RootStackParamList } from '../navigation/types';
import { C } from '../theme/colors';
import { animateNextLayout } from '../theme/motion';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Profile'>;
type ProfileTab = 'posts' | 'friends' | 'settings';

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
  const { posts, addPost } = usePosts();
  const { currentUser, logout, updateCurrentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [tabBarActive, setTabBarActive] = useState<TabKey>('profile');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [whisperModalVisible, setWhisperModalVisible] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);

  const handleLogout = () => {
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  // Guard — screen only reachable after login
  if (!currentUser) return null;

  const friends = mockFriendsByUser[currentUser.userId] ?? [];
  const myPosts = posts.filter(p => p.ownerId === currentUser.userId);

  const handleWhisperSubmit = (content: string, durationMinutes: number) => {
    const hours = Math.floor(durationMinutes / 60);
    animateNextLayout();
    addPost({
      id: `local-${Date.now()}`,
      author: currentUser.fullName,
      handle: `@${currentUser.handle}`,
      avatar: currentUser.avatar,
      content,
      type: 'thought',
      likes: 0,
      comments: 0,
      timestamp: 'JUST NOW',
      timeLeft: `${String(hours).padStart(2, '0')}H 00M REMAINING`,
      isNew: true,
      ownerId: currentUser.userId,
    });
    setWhisperModalVisible(false);
  };

  return (
    <View className="flex-1 bg-paper-base dark:bg-ink-base">
      {/* Sticky top header */}
      <GlassTopHeader
        title="Profile"
        onPressMenu={() => setEditModalVisible(true)}
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
          postsCount={myPosts.length}
          followersCount={friends.length * 12} // mock — swap with real data
          followingCount={friends.length * 8}  // mock — swap with real data
          showChangeCover
          onChangeCover={() =>
            Alert.alert('Change Cover', 'Photo picker not supported in this demo.')
          }
          actions={
            <ProfileActionButtons
              onFollow={() => Alert.alert('Follow', 'This is your own profile!')}
              onMessage={() => setWhisperModalVisible(true)}
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
            { key: 'friends', label: 'Friends', Icon: UsersIcon },
            { key: 'settings', label: 'Settings', Icon: SettingsIcon },
          ]}
        />

        {/* ── Tab: Posts → Staggered Masonry Grid ───────────────────────── */}
        {activeTab === 'posts' && (
          MOCK_GRID_ITEMS.length > 0 ? (
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

      <FloatingTabBar
        activeTab={tabBarActive}
        onChangeTab={tab => {
          setTabBarActive(tab);
          if (tab === 'home') navigation.navigate('Home');
          else if (tab === 'messages') navigation.navigate('MessagesList');
          else if (tab === 'notifications') navigation.navigate('Notifications');
        }}
        onPressCreate={() => setWhisperModalVisible(true)}
        onLogout={handleLogout}
      />

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

      <CreateWhisperModal
        visible={whisperModalVisible}
        onClose={() => setWhisperModalVisible(false)}
        onSubmit={handleWhisperSubmit}
      />
    </View>
  );
}
