import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import {
  ArchiveIcon,
  EditIcon,
  SettingsIcon,
  ShareIcon,
  UsersIcon,
} from '../assets/Icon';
import AboutCard from '../components/profileScreen/AboutCard';
import EditProfileModal from '../components/profileScreen/EditProfileModal';
import FriendCard from '../components/profileScreen/FriendCard';
import ProfileHeader from '../components/profileScreen/ProfileHeader';
import ProfileTabs from '../components/profileScreen/ProfileTabs';
import CreateWhisperModal from '../components/HomeScreen/CreateWhisperModal';
import PostCard from '../components/HomeScreen/PostCard';
import { CURRENT_USER_ID } from '../constants';
import { usePosts } from '../contexts/PostsContext';
import { mockFriendsByUser, mockProfiles } from '../data/mockData';
import FloatingTabBar, { TabKey } from '../layout/FloatingTabBar';
import { RootStackParamList } from '../navigation/types';
import { PostData, ProfileDetails } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Profile'>;
type ProfileTab = 'thoughts' | 'friends' | 'settings';

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { posts, addPost, deletePost } = usePosts();

  const [profile, setProfile] = useState<ProfileDetails>(
    mockProfiles[CURRENT_USER_ID],
  );
  const [friends] = useState(mockFriendsByUser[CURRENT_USER_ID] ?? []);
  const [activeTab, setActiveTab] = useState<ProfileTab>('thoughts');
  const [tabBarActive, setTabBarActive] = useState<TabKey>('profile');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [whisperModalVisible, setWhisperModalVisible] = useState(false);

  const myPosts = posts.filter(p => p.ownerId === CURRENT_USER_ID);
  const totalReactions = myPosts.reduce((sum, p) => sum + p.likes, 0);

  const handleWhisperSubmit = (content: string, durationMinutes: number) => {
    const hours = Math.floor(durationMinutes / 60);
    const newPost: PostData = {
      id: `local-${Date.now()}`,
      author: profile.fullName,
      handle: `@${profile.handle}`,
      avatar: profile.avatar,
      content,
      type: 'thought',
      likes: 0,
      comments: 0,
      timestamp: 'JUST NOW',
      timeLeft: `${String(hours).padStart(2, '0')}H 00M REMAINING`,
      isNew: true,
      ownerId: CURRENT_USER_ID,
    };
    addPost(newPost);
    setWhisperModalVisible(false);
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0a0a0a] mt-10">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          coverImage={profile.coverImage}
          avatar={profile.avatar}
          displayName={profile.fullName}
          bio={profile.bio}
          postsCount={myPosts.length}
          friendsCount={friends.length}
          reactionsCount={totalReactions}
          showChangeCover
          onChangeCover={() =>
            Alert.alert(
              'Change Cover',
              'Chưa hỗ trợ chọn ảnh trong bản demo này.',
            )
          }
          actions={
            <View className="flex-row gap-3 px-5 mt-4">
              <Pressable
                onPress={() => setEditModalVisible(true)}
                className="flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 dark:bg-[#1A1D2D] border border-gray-200 dark:border-white/5"
              >
                <EditIcon size={16} />
                <Text className="text-gray-900 dark:text-white font-medium text-sm">
                  Edit
                </Text>
              </Pressable>
              <Pressable className="flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600">
                <ShareIcon size={16} color="#FFFFFF" />
                <Text className="text-white font-medium text-sm">
                  Share Profile
                </Text>
              </Pressable>
            </View>
          }
        />

        <ProfileTabs<ProfileTab>
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          tabs={[
            { key: 'thoughts', label: 'Current Thoughts', Icon: ArchiveIcon },
            { key: 'friends', label: 'Friends', Icon: UsersIcon },
            { key: 'settings', label: 'Soul Settings', Icon: SettingsIcon },
          ]}
        />

        <View className="px-5 mt-5" style={{ gap: 16 }}>
          {activeTab === 'thoughts' && (
            <>
              <Pressable
                onPress={() => setWhisperModalVisible(true)}
                className="bg-gray-50 dark:bg-[#11131F] rounded-2xl p-4 border border-gray-200 dark:border-white/5 flex-row items-center gap-3"
              >
                <View className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <Image
                    source={{ uri: profile.avatar }}
                    className="w-full h-full"
                  />
                </View>
                <Text className="text-gray-500 dark:text-gray-400 flex-1">
                  What will fade away next?
                </Text>
              </Pressable>

              {myPosts.length > 0 ? (
                <View style={{ gap: 16 }}>
                  {myPosts.map(post => (
                    <PostCard key={post.id} post={post} onDelete={deletePost} />
                  ))}
                </View>
              ) : (
                <View className="items-center py-16">
                  <Text className="text-lg font-medium text-gray-400">
                    No thoughts yet
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    Your first whisper awaits...
                  </Text>
                </View>
              )}
            </>
          )}

          {activeTab === 'friends' &&
            (friends.length > 0 ? (
              <View style={{ gap: 12 }}>
                {friends.map(friend => (
                  <FriendCard
                    key={friend.id}
                    friend={friend}
                    onPress={() =>
                      navigation.push('OtherProfile', { userId: friend.id })
                    }
                  />
                ))}
              </View>
            ) : (
              <View className="items-center py-16">
                <Text className="text-lg font-medium text-gray-400">
                  No friends yet
                </Text>
              </View>
            ))}

          {activeTab === 'settings' && (
            <View className="items-center py-16">
              <Text className="text-gray-500">Coming soon</Text>
            </View>
          )}

          <AboutCard profile={profile} />
        </View>
      </ScrollView>

      <FloatingTabBar
        activeTab={tabBarActive}
        onChangeTab={tab => {
          setTabBarActive(tab);
          if (tab === 'home') navigation.navigate('Home');
          else if (tab === 'messages') navigation.navigate('MessagesList');
        }}
        onPressCreate={() => setWhisperModalVisible(true)}
        onLogout={() =>
          Alert.alert(
            'Logged out',
            'This is a UI-only demo, no account was signed out.',
          )
        }
      />

      <EditProfileModal
        visible={editModalVisible}
        profile={profile}
        onClose={() => setEditModalVisible(false)}
        onSave={updated => {
          setProfile(updated);
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
