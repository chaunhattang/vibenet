import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AddFriendIcon,
  ArchiveIcon,
  CheckIcon,
  ChevronLeftIcon,
  ClockIcon,
  UsersIcon,
} from '../assets/Icon';
import AboutCard from '../components/profileScreen/AboutCard';
import FriendCard from '../components/profileScreen/FriendCard';
import ProfileHeader from '../components/profileScreen/ProfileHeader';
import ProfileTabs from '../components/profileScreen/ProfileTabs';
import ConfirmModal from '../components/HomeScreen/ConfirmModal';
import PostCard from '../components/HomeScreen/PostCard';
import { usePosts } from '../contexts/PostsContext';
import { mockFriendStatusByUser, mockFriendsByUser, mockProfiles } from '../data/mockData';
import { RootStackParamList } from '../navigation/types';
import { FriendStatus } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'OtherProfile'>;
type Route = { params: RootStackParamList['OtherProfile'] };
type OtherProfileTab = 'thoughts' | 'friends';

export default function OtherProfileScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute() as Route;
  const insets = useSafeAreaInsets();
  const { userId } = route.params;

  const { posts } = usePosts();
  const profile = mockProfiles[userId];
  const [friends] = useState(mockFriendsByUser[userId] ?? []);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>(
    mockFriendStatusByUser[userId] ?? 'NONE',
  );
  const [confirmAction, setConfirmAction] = useState<'cancel' | 'unfriend' | null>(null);
  const [activeTab, setActiveTab] = useState<OtherProfileTab>('thoughts');

  if (!profile) return null;

  const userPosts = posts.filter(p => p.ownerId === userId);
  const totalReactions = userPosts.reduce((sum, p) => sum + p.likes, 0);

  const handleFriendPress = () => {
    if (friendStatus === 'NONE') {
      // Sau này có be thì: await sendFriendRequest(userId)
      setFriendStatus('PENDING_SENT');
    } else if (friendStatus === 'PENDING_SENT') {
      setConfirmAction('cancel');
    } else if (friendStatus === 'FRIENDS') {
      setConfirmAction('unfriend');
    }
  };

  const confirmFriendAction = () => {
    // Sau này có be thì: await unfriend(userId)
    setFriendStatus('NONE');
    setConfirmAction(null);
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#0a0a0a]">
      <View
        style={{ paddingTop: insets.top + 10 }}
        className="flex-row items-center gap-3 px-4 pb-3 border-b border-gray-200 dark:border-white/5"
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <ChevronLeftIcon />
        </Pressable>
        <Text className="text-base font-bold text-gray-900 dark:text-white">
          {profile.fullName}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          coverImage={profile.coverImage}
          avatar={profile.avatar}
          displayName={profile.fullName}
          bio={profile.bio}
          postsCount={userPosts.length}
          friendsCount={friends.length}
          reactionsCount={totalReactions}
          actions={
            <View className="px-5 mt-4">
              {friendStatus === 'NONE' && (
                <Pressable
                  onPress={handleFriendPress}
                  className="flex-row items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600"
                >
                  <AddFriendIcon size={16} />
                  <Text className="text-white font-medium text-sm">Add Friend</Text>
                </Pressable>
              )}
              {friendStatus === 'PENDING_SENT' && (
                <Pressable
                  onPress={handleFriendPress}
                  className="flex-row items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-200 dark:bg-white/10"
                >
                  <ClockIcon size={16} />
                  <Text className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                    Pending
                  </Text>
                </Pressable>
              )}
              {friendStatus === 'PENDING_RECEIVED' && (
                <View className="flex-row items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500/10">
                  <Text className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                    Review Request in Messages
                  </Text>
                </View>
              )}
              {friendStatus === 'FRIENDS' && (
                <Pressable
                  onPress={handleFriendPress}
                  className="flex-row items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 dark:bg-[#1A1D2D] border border-gray-200 dark:border-white/5"
                >
                  <CheckIcon size={16} color="#22C55E" />
                  <Text className="text-gray-900 dark:text-white font-medium text-sm">
                    Friends
                  </Text>
                </Pressable>
              )}
            </View>
          }
        />

        <ProfileTabs<OtherProfileTab>
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          tabs={[
            { key: 'thoughts', label: 'Current Thoughts', Icon: ArchiveIcon },
            { key: 'friends', label: 'Friends', Icon: UsersIcon },
          ]}
        />

        <View className="px-5 mt-5" style={{ gap: 16 }}>
          {activeTab === 'thoughts' &&
            (userPosts.length > 0 ? (
              <View style={{ gap: 16 }}>
                {userPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </View>
            ) : (
              <View className="items-center py-16">
                <Text className="text-lg font-medium text-gray-400">No thoughts yet</Text>
              </View>
            ))}

          {activeTab === 'friends' &&
            (friends.length > 0 ? (
              <View style={{ gap: 12 }}>
                {friends.map(friend => (
                  <FriendCard
                    key={friend.id}
                    friend={friend}
                    onPress={() => navigation.push('OtherProfile', { userId: friend.id })}
                  />
                ))}
              </View>
            ) : (
              <View className="items-center py-16">
                <Text className="text-lg font-medium text-gray-400">No friends yet</Text>
              </View>
            ))}

          <AboutCard profile={profile} />
        </View>
      </ScrollView>

      <ConfirmModal
        visible={confirmAction !== null}
        icon={<ClockIcon size={28} color="#EF4444" />}
        title={confirmAction === 'cancel' ? 'Cancel Request' : 'Unfriend'}
        message={
          confirmAction === 'cancel'
            ? `Cancel your friend request to ${profile.fullName}?`
            : `Are you sure you want to unfriend ${profile.fullName}?`
        }
        confirmLabel={confirmAction === 'cancel' ? 'Cancel Request' : 'Unfriend'}
        onCancel={() => setConfirmAction(null)}
        onConfirm={confirmFriendAction}
      />
    </View>
  );
}
