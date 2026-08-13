import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import CreatePostModal from '../components/HomeScreen/CreatePostModal';
import GlassTopHeader from '../components/layout/GlassTopHeader';
import StoryHighlightBar from '../components/HomeScreen/StoryHighlightBar';
import StoryViewer from '../components/Stories/StoryViewer';
import { CameraIcon, ChevronDownIcon } from '../assets/Icon';
import EmptyState from '../components/ui/EmptyState';
import PostCard from '../components/HomeScreen/PostCard';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { useFriends } from '../contexts/FriendsContext';
import { useLocket } from '../contexts/LocketContext';
import { usePosts } from '../contexts/PostsContext';
import { useStories } from '../contexts/StoriesContext';
import { useGoToProfile } from '../hooks/useGoToProfile';
import { useGoToTab } from '../hooks/useGoToTab';
import { mockOnlineUsers } from '../data/mockData';
import { StoryItem } from '../data/mockStories';
import { C } from '../theme/colors';
import { FadeInUp } from '../theme/motion';
import { RootStackParamList } from '../navigation/types';
import { OnlineUser, Post } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function NewsfeedScreen() {
  const navigation = useNavigation<Nav>();
  const { currentUser } = useAuth();
  const goToProfile = useGoToProfile();
  const goToTab = useGoToTab();
  const { getOrCreateRoomByFriend } = useChat();
  const { getFriendStatus } = useFriends();
  const { unreadCount: locketUnreadCount, refreshUnreadCount } = useLocket();
  const { feed, feedLoading, feedError, loadFeed, loadMoreFeed } = usePosts();
  const { stories, viewedIds, markViewed, addMyStoryFrame } = useStories();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [storyStartIndex, setStoryStartIndex] = useState(0);

  // StoryViewer chỉ nhận những user thật sự có frame để xem.
  const usersWithStories = useMemo(() => stories.filter(s => s.frames.length > 0), [stories]);

  const handlePressStory = async (story: StoryItem) => {
    // "My Story" chưa có gì → mở picker thêm frame (mock). Sau này: POST /api/stories.
    if (story.id === 'mine' && story.frames.length === 0) {
      const res = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 });
      if (res.didCancel || !res.assets?.[0]?.uri) return;
      addMyStoryFrame(res.assets[0].uri);
      return;
    }
    const idx = usersWithStories.findIndex(s => s.id === story.id);
    if (idx >= 0) {
      setStoryStartIndex(idx);
      setStoryViewerVisible(true);
    }
  };

  useEffect(() => {
    refreshUnreadCount();
    loadFeed();
    // Chỉ chạy khi Home mount — cả hai hàm đều có identity ổn định (useCallback).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sau này có be thì đổi thành searchUsers(query) (debounce như web), bỏ filter local này
  const searchResults = useMemo<OnlineUser[]>(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.trim().toLowerCase();
    return mockOnlineUsers.filter(
      u =>
        u.name.toLowerCase().includes(query) ||
        u.handle.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const renderItem = useCallback(
    ({ item, index }: { item: Post; index: number }) => (
      <View className="px-5">
        <FadeInUp delay={Math.min(index, 5) * 40}>
          <PostCard post={item} />
        </FadeInUp>
      </View>
    ),
    [],
  );

  const keyExtractor = useCallback((item: Post) => item.id, []);
  const onEndReached = useCallback(() => loadMoreFeed(), [loadMoreFeed]);

  // Màn này chỉ vào được sau khi đăng nhập nên currentUser luôn có giá trị.
  if (!currentUser) return null;

  const handleToggleSearch = () => {
    setSearchOpen(v => !v);
    setSearchQuery('');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeed({ refresh: true });
    setRefreshing(false);
  };

  const listHeader = (
    <View style={{ gap: 16, paddingTop: 12 }}>
      <StoryHighlightBar stories={stories} onPressStory={handlePressStory} viewedIds={viewedIds} />
    </View>
  );

  const listEmpty = feedLoading ? (
    <View className="py-10">
      <ActivityIndicator color={C.brand} />
    </View>
  ) : (
    <EmptyState
      icon={<CameraIcon size={26} color={C.brand} />}
      title={feedError ?? 'No posts yet'}
      subtitle={feedError ? 'Pull to refresh.' : 'Be the first to share something.'}
    />
  );

  return (
    <View className="flex-1 bg-paper-base dark:bg-ink-base">
      <GlassTopHeader
        title="Vibenet"
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
        onPressAdd={() => setModalVisible(true)}
        onPressBell={() => goToTab('notifications')}
        onPressMessages={() => navigation.navigate('MessagesList')}
      />

      <FlatList
        data={feed}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={{ paddingBottom: 120, gap: 16 }}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        // Feed items are media-heavy (images + blur overlays) — keep the render
        // window small so scrolling doesn't have to keep dozens of them mounted.
        removeClippedSubviews
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.brand} />
        }
        ListFooterComponent={
          feedLoading && feed.length > 0 ? (
            <View className="py-4">
              <ActivityIndicator color={C.brand} />
            </View>
          ) : null
        }
      />

      <CreatePostModal visible={modalVisible} onClose={() => setModalVisible(false)} />

      <StoryViewer
        visible={storyViewerVisible}
        users={usersWithStories}
        startUserIndex={storyStartIndex}
        onClose={() => setStoryViewerVisible(false)}
        onViewedUser={markViewed}
      />
    </View>
  );
}
