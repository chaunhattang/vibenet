import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  AddFriendIcon,
  ArchiveIcon,
  CheckIcon,
  ClockIcon,
  UsersIcon,
} from '../assets/Icon';
import AboutCard from '../components/profileScreen/AboutCard';
import FriendCard from '../components/profileScreen/FriendCard';
import ProfileHeader from '../components/profileScreen/ProfileHeader';
import ProfileTabs from '../components/profileScreen/ProfileTabs';
import ConfirmModal from '../components/HomeScreen/ConfirmModal';
import PostCard from '../components/HomeScreen/PostCard';
import EmptyState from '../components/ui/EmptyState';
import ScreenHeader from '../components/ui/ScreenHeader';
import { useFriends } from '../contexts/FriendsContext';
import { usePosts } from '../contexts/PostsContext';
import { mockFriendsByUser, mockProfiles } from '../data/mockData';
import { RootStackParamList } from '../navigation/types';
import { C } from '../theme/colors';

type Nav = NativeStackNavigationProp<RootStackParamList, 'OtherProfile'>;
type Route = { params: RootStackParamList['OtherProfile'] };
type OtherProfileTab = 'thoughts' | 'friends';

export default function OtherProfileScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute() as Route;
  const { userId } = route.params;

  const { posts } = usePosts();
  const { getFriendStatus, sendRequest, cancelRequest, unfriend } = useFriends();
  const profile = mockProfiles[userId];
  const [friends] = useState(mockFriendsByUser[userId] ?? []);
  const friendStatus = getFriendStatus(userId);
  const [confirmAction, setConfirmAction] = useState<'cancel' | 'unfriend' | null>(null);
  const [activeTab, setActiveTab] = useState<OtherProfileTab>('thoughts');

  if (!profile) return null;

  const userPosts = posts.filter(p => p.ownerId === userId);
  // followersCount / followingCount are mocked — replace with real API data when backend lands
  const followersCount = friends.length * 12;
  const followingCount = friends.length * 8;

  const handleFriendPress = () => {
    if (friendStatus === 'NONE') {
      sendRequest(userId);
    } else if (friendStatus === 'PENDING_SENT') {
      setConfirmAction('cancel');
    } else if (friendStatus === 'FRIENDS') {
      setConfirmAction('unfriend');
    }
  };

  const confirmFriendAction = () => {
    if (confirmAction === 'cancel') cancelRequest(userId);
    else if (confirmAction === 'unfriend') unfriend(userId);
    setConfirmAction(null);
  };

  return (
    <View className="flex-1 bg-paper-base dark:bg-ink-base">
      <ScreenHeader title={profile.fullName} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          coverImage={profile.coverImage}
          avatar={profile.avatar}
          displayName={profile.fullName}
          handle={profile.handle}
          bio={profile.bio}
          postsCount={userPosts.length}
          followersCount={followersCount}
          followingCount={followingCount}
          actions={
            <View style={{ paddingHorizontal: 20, marginBottom: 20, marginTop: 4 }}>
              {friendStatus === 'NONE' && (
                <Pressable
                  onPress={handleFriendPress}
                  className="flex-row items-center justify-center gap-2 py-2.5 rounded-full bg-brand"
                >
                  <AddFriendIcon size={16} />
                  <Text className="text-white font-medium text-sm">Add Friend</Text>
                </Pressable>
              )}
              {friendStatus === 'PENDING_SENT' && (
                <Pressable
                  onPress={handleFriendPress}
                  className="flex-row items-center justify-center gap-2 py-2.5 rounded-full bg-paper-overlay dark:bg-ink-overlay"
                >
                  <ClockIcon size={16} />
                  <Text className="text-content-strong dark:text-content-strong-dark font-medium text-sm">
                    Pending
                  </Text>
                </Pressable>
              )}
              {friendStatus === 'PENDING_RECEIVED' && (
                <View className="flex-row items-center justify-center gap-2 py-2.5 rounded-full bg-brand/10">
                  <Text className="text-brand font-medium text-sm">
                    Review Request in Messages
                  </Text>
                </View>
              )}
              {friendStatus === 'FRIENDS' && (
                <Pressable
                  onPress={handleFriendPress}
                  className="flex-row items-center justify-center gap-2 py-2.5 rounded-full bg-paper-raised dark:bg-ink-overlay border border-hairline-light dark:border-hairline-dark"
                >
                  <CheckIcon size={16} color={C.success} />
                  <Text className="text-content-strong dark:text-content-strong-dark font-medium text-sm">
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
          iconOnly={false}
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
              <EmptyState icon={<ArchiveIcon size={26} color={C.brand} />} title="No thoughts yet" />
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
              <EmptyState icon={<UsersIcon size={26} color={C.brand} />} title="No friends yet" />
            ))}

          <AboutCard profile={profile} />
        </View>
      </ScrollView>

      <ConfirmModal
        visible={confirmAction !== null}
        icon={
          <ClockIcon size={28} color={confirmAction === 'cancel' ? C.brand : C.danger} />
        }
        title={confirmAction === 'cancel' ? 'Cancel Request' : 'Unfriend'}
        message={
          confirmAction === 'cancel'
            ? `Cancel your friend request to ${profile.fullName}?`
            : `Are you sure you want to unfriend ${profile.fullName}?`
        }
        confirmLabel={confirmAction === 'cancel' ? 'Cancel Request' : 'Unfriend'}
        confirmColor={confirmAction === 'cancel' ? C.brand : C.danger}
        tone={confirmAction === 'cancel' ? 'neutral' : 'danger'}
        onCancel={() => setConfirmAction(null)}
        onConfirm={confirmFriendAction}
      />
    </View>
  );
}
