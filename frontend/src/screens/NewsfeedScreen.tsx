import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import ComposerCard from '../components/HomeScreen/ComposerCard';
import CreateWhisperModal from '../components/HomeScreen/CreateWhisperModal';
import FloatingTabBar, { TabKey } from '../layout/FloatingTabBar';
import Search from '../components/HomeScreen/Search';
import GlassTopHeader from '../components/layout/GlassTopHeader';
import StoryHighlightBar from '../components/HomeScreen/StoryHighlightBar';
import MediaFeedCard from '../components/HomeScreen/MediaFeedCard';
import { CameraIcon, ChevronDownIcon } from '../assets/Icon';
import EmptyState from '../components/ui/EmptyState';
import OnlineUsers from '../layout/OnlineUsers';
import PostCard from '../components/HomeScreen/PostCard';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { useFriends } from '../contexts/FriendsContext';
import { useLocket } from '../contexts/LocketContext';
import { usePosts } from '../contexts/PostsContext';
import { useGoToProfile } from '../hooks/useGoToProfile';
import { mockOnlineUsers } from '../data/mockData';
import { MOCK_STORIES } from '../data/mockStories';
import { MOCK_MEDIA_FEED } from '../data/mockMediaFeed';
import { C } from '../theme/colors';
import { animateNextLayout, FadeInUp } from '../theme/motion';
import { RootStackParamList } from '../navigation/types';
import { OnlineUser, PostData, ProfileDetails } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Cái này là post giả (chưa có backend), sau này có be thì bỏ
function createLocalPost(
  author: ProfileDetails,
  content: string,
  timeLeft: string,
): PostData {
  return {
    id: `local-${Date.now()}`,
    author: author.fullName,
    handle: `@${author.handle}`,
    avatar: author.avatar,
    content,
    type: 'thought',
    likes: 0,
    comments: 0,
    timestamp: 'JUST NOW',
    timeLeft,
    isNew: true,
    ownerId: author.userId,
  };
}

export default function NewsfeedScreen() {
  const navigation = useNavigation<Nav>();
  const { currentUser, logout } = useAuth();
  const goToProfile = useGoToProfile();
  const { getOrCreateRoomByFriend } = useChat();
  const { getFriendStatus } = useFriends();
  const { unreadCount: locketUnreadCount, refreshUnreadCount } = useLocket();

  useEffect(() => {
    refreshUnreadCount();
    // Chỉ cần gọi khi Home mount — refreshUnreadCount có identity ổn định (useCallback).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // posts giờ nằm trong PostsContext (dùng chung với trang Profile), không phải state riêng nữa
  const { posts, addPost, deletePost } = usePosts();
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [composerValue, setComposerValue] = useState('');
  const [composerExpanded, setComposerExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  // Sau này có be thì đổi thành: gọi searchUsers(query) (debounce như web), bỏ filter local này
  const searchResults = useMemo<OnlineUser[]>(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.trim().toLowerCase();
    return mockOnlineUsers.filter(
      u =>
        u.name.toLowerCase().includes(query) ||
        u.handle.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  // Màn này chỉ vào được sau khi đăng nhập nên currentUser luôn có giá trị, nhưng vẫn
  // cần guard vì kiểu của nó là ProfileDetails | null.
  if (!currentUser) return null;

  // "Online Now" chỉ hiện bạn bè thật sự (đã FRIENDS) đang online, không hiện người lạ
  const onlineFriends = mockOnlineUsers.filter(
    u => u.isOnline && getFriendStatus(u.id) === 'FRIENDS',
  );

  const handleToggleSearch = () => {
    setSearchOpen(v => !v);
    setSearchQuery('');
  };

  const handleInlineSubmit = () => {
    if (!composerValue.trim()) return;
    setIsSubmitting(true);
    // Sau này có be thì try catch ở đây
    setTimeout(() => {
      animateNextLayout();
      addPost(createLocalPost(currentUser, composerValue.trim(), '12H 00M REMAINING'));
      setComposerValue('');
      setComposerExpanded(false);
      setIsSubmitting(false);
    }, 400);
  };

  const handleModalSubmit = (content: string, durationMinutes: number) => {
    // Sau này có be thì try catch ở đây
    const hours = Math.floor(durationMinutes / 60);
    const timeLeft = `${String(hours).padStart(2, '0')}H 00M REMAINING`;
    animateNextLayout();
    addPost(createLocalPost(currentUser, content, timeLeft));
    setModalVisible(false);
  };

  const handleDeletePost = (id: string) => {
    animateNextLayout();
    deletePost(id);
  };

  return (
    <View className="flex-1 bg-paper-base dark:bg-ink-base">
      <GlassTopHeader title="Vibenet" unreadCount={locketUnreadCount} />
      <Search
        searchOpen={searchOpen}
        onToggleSearch={handleToggleSearch}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        searchResults={searchResults}
        isSearching={false}
        onSelectUser={user => {
          handleToggleSearch();
          goToProfile(user.id);
        }}
        onPressLocket={() => navigation.navigate('LocketFeed')}
        locketUnreadCount={locketUnreadCount}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120, gap: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <StoryHighlightBar stories={MOCK_STORIES} />

          {/* Sau này có be thì đổi mockOnlineUsers thành kết quả getOnlineUsers() (đã fetch) */}
          <OnlineUsers
            users={onlineFriends}
            onSelectUser={user =>
              navigation.navigate('ChatDetail', {
                chatId: getOrCreateRoomByFriend(user),
              })
            }
          />

          <ComposerCard
            avatar={currentUser.avatar}
            value={composerValue}
            onChangeText={setComposerValue}
            expanded={composerExpanded}
            onFocus={() => setComposerExpanded(true)}
            onCancel={() => {
              setComposerExpanded(false);
              setComposerValue('');
            }}
            onSubmit={handleInlineSubmit}
            onOpenMedia={() => setModalVisible(true)}
            isSubmitting={isSubmitting}
          />

          <View className="flex-row items-center justify-between px-5">
            <Text className="text-title text-content-strong dark:text-content-strong-dark">
              The Feed
            </Text>
            <Pressable className="flex-row items-center gap-1.5 bg-paper-raised dark:bg-ink-overlay px-3 py-1.5 rounded-full">
              <Text className="text-xs font-semibold text-content-muted dark:text-content-muted-dark">
                Newest First
              </Text>
              <ChevronDownIcon />
            </Pressable>
          </View>

          {/* MediaFeedCard section */}
          <View style={{ paddingHorizontal: 20, gap: 20 }}>
            {MOCK_MEDIA_FEED.map(post => (
              <MediaFeedCard key={post.id} post={post} />
            ))}
          </View>

          <View style={{ gap: 16 }}>
            {posts.length > 0 ? (
              posts.map((post, i) => (
                <FadeInUp key={post.id} delay={Math.min(i, 5) * 40}>
                  <PostCard post={post} onDelete={handleDeletePost} />
                </FadeInUp>
              ))
            ) : (
              <EmptyState
                icon={<CameraIcon size={26} color={C.brand} />}
                title="No whispers yet"
                subtitle="Share your first thought before it fades away."
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <FloatingTabBar
        activeTab={activeTab}
        onChangeTab={tab => {
          setActiveTab(tab);
          if (tab === 'messages') navigation.navigate('MessagesList');
          if (tab === 'notifications') navigation.navigate('Notifications');
          if (tab === 'profile') navigation.navigate('Profile');
        }}
        onPressCreate={() => setModalVisible(true)}
        onLogout={() => {
          logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }}
      />

      <CreateWhisperModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleModalSubmit}
      />
    </View>
  );
}
