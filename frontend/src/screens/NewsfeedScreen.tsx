import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  Alert,
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
import { ChevronDownIcon } from '../assets/Icon';
import OnlineUsers from '../layout/OnlineUsers';
import PostCard from '../components/HomeScreen/PostCard';
import { CURRENT_USER_AVATAR } from '../constants';
import { usePosts } from '../contexts/PostsContext';
import { mockOnlineUsers } from '../data/mockData';
import { RootStackParamList } from '../navigation/types';
import { OnlineUser, PostData } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Cái này là post giả (chưa có backend), sau này có be thì bỏ
function createLocalPost(content: string, timeLeft: string): PostData {
  return {
    id: `local-${Date.now()}`,
    author: 'You',
    handle: '@me',
    avatar: CURRENT_USER_AVATAR,
    content,
    type: 'thought',
    likes: 0,
    comments: 0,
    timestamp: 'JUST NOW',
    timeLeft,
    isNew: true,
    ownerId: 'me',
  };
}

export default function NewsfeedScreen() {
  const navigation = useNavigation<Nav>();
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

  const handleToggleSearch = () => {
    setSearchOpen(v => !v);
    setSearchQuery('');
  };

  const handleInlineSubmit = () => {
    if (!composerValue.trim()) return;
    setIsSubmitting(true);
    // Sau này có be thì try catch ở đây
    setTimeout(() => {
      addPost(createLocalPost(composerValue.trim(), '12H 00M REMAINING'));
      setComposerValue('');
      setComposerExpanded(false);
      setIsSubmitting(false);
    }, 400);
  };

  const handleModalSubmit = (content: string, durationMinutes: number) => {
    // Sau này có be thì try catch ở đây
    const hours = Math.floor(durationMinutes / 60);
    const timeLeft = `${String(hours).padStart(2, '0')}H 00M REMAINING`;
    addPost(createLocalPost(content, timeLeft));
    setModalVisible(false);
  };

  return (
    <View className="flex-1 bg-[#FDFDFD] dark:bg-[#0c1014] mt-10">
      <Search
        searchOpen={searchOpen}
        onToggleSearch={handleToggleSearch}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        searchResults={searchResults}
        isSearching={false}
        onSelectUser={() => handleToggleSearch()}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120, gap: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Sau này có be thì đổi mockOnlineUsers thành kết quả getOnlineUsers() (đã fetch) */}
          <OnlineUsers users={mockOnlineUsers} onSelectUser={() => {}} />

          <ComposerCard
            avatar={CURRENT_USER_AVATAR}
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

          <View className="flex-row items-center justify-between px-4">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              The Feed
            </Text>
            <Pressable className="flex-row items-center gap-1.5 bg-gray-100 dark:bg-[#1A1A27] px-3 py-1.5 rounded-lg">
              <Text className="text-xs font-semibold text-gray-500">
                Newest First
              </Text>
              <ChevronDownIcon />
            </Pressable>
          </View>

          <View style={{ gap: 16 }}>
            {posts.length > 0 ? (
              posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={deletePost}
                />
              ))
            ) : (
              <View className="mx-4 items-center py-16 bg-white/50 dark:bg-[#181825]/50 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                <Text className="text-lg font-medium text-gray-600 dark:text-gray-400">
                  No whispers yet
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Share your first thought before it fades away.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <FloatingTabBar
        activeTab={activeTab}
        onChangeTab={tab => {
          setActiveTab(tab);
          if (tab === 'messages') navigation.navigate('MessagesList');
          if (tab === 'profile') navigation.navigate('Profile');
        }}
        onPressCreate={() => setModalVisible(true)}
        // Sau này có be thì: gọi logout() (lib/auth) rồi router chuyển sang màn login
        onLogout={() =>
          Alert.alert(
            'Logged out',
            'This is a UI-only demo, no account was signed out.',
          )
        }
      />

      <CreateWhisperModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleModalSubmit}
      />
    </View>
  );
}
