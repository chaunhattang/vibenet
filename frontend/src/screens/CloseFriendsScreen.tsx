import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon, PlusIcon, TrashIcon } from '../assets/Icon';
import { ApiError, resolveMediaUrl } from '../api/client';
import { getFriends } from '../api/friends';
import ConfirmModal from '../components/HomeScreen/ConfirmModal';
import AddCloseFriendSheet, { AddCloseFriendCandidate } from '../components/Locket/AddCloseFriendSheet';
import CloseFriendRow from '../components/Locket/CloseFriendRow';
import CloseFriendsLimitBanner from '../components/Locket/CloseFriendsLimitBanner';
import { useAuth } from '../contexts/AuthContext';
import { useLocket } from '../contexts/LocketContext';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CloseFriends'>;

export default function CloseFriendsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { currentUserId } = useAuth();
  const {
    closeFriends,
    closeFriendsLimit,
    closeFriendsLoading,
    closeFriendsError,
    loadCloseFriends,
    addCloseFriend,
    removeCloseFriend,
  } = useLocket();

  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<AddCloseFriendCandidate[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  const limitReached = closeFriends.length >= closeFriendsLimit;

  useEffect(() => {
    loadCloseFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeFriendIds = useMemo(() => new Set(closeFriends.map(f => f.userId)), [closeFriends]);

  const handleOpenAddSheet = async () => {
    setAddSheetVisible(true);
    if (!currentUserId) return;
    setCandidatesLoading(true);
    try {
      const friends = await getFriends(currentUserId);
      setCandidates(
        (friends ?? [])
          .filter(f => !closeFriendIds.has(f.id))
          .map(f => ({
            id: f.id,
            name: f.profileResponse?.fullName || f.username,
            handle: f.username,
            avatar: resolveMediaUrl(f.profileResponse?.avatarUrl),
          })),
      );
    } catch (err) {
      Alert.alert(
        'Could not load friends',
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setCandidatesLoading(false);
    }
  };

  const pendingRemoveFriend = closeFriends.find(f => f.userId === pendingRemoveId) ?? null;

  const handleAdd = useCallback(
    async (friend: AddCloseFriendCandidate) => {
      if (limitReached) return;
      try {
        await addCloseFriend({
          userId: friend.id,
          userName: friend.handle,
          fullName: friend.name,
          avatarUrl: friend.avatar,
        });
        setCandidates(prev => prev.filter(c => c.id !== friend.id));
        setAddSheetVisible(false);
      } catch (err) {
        Alert.alert(
          'Could not add close friend',
          err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
        );
      }
    },
    [addCloseFriend, limitReached],
  );

  return (
    <View className="flex-1 bg-white dark:bg-[#0a0a0a]">
      <View
        style={{ paddingTop: insets.top + 10 }}
        className="flex-row items-center gap-3 px-4 pb-3 border-b border-gray-200 dark:border-white/5"
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <ChevronLeftIcon />
        </Pressable>
        <Text className="text-base font-bold text-gray-900 dark:text-white flex-1">
          Close Friends
        </Text>
        <Pressable
          onPress={handleOpenAddSheet}
          disabled={limitReached}
          className="w-9 h-9 rounded-full bg-indigo-600 items-center justify-center disabled:opacity-40"
        >
          <PlusIcon size={18} />
        </Pressable>
      </View>

      {closeFriendsError && closeFriends.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-gray-600 dark:text-gray-400 text-center">
            {closeFriendsError}
          </Text>
          <Pressable
            onPress={() => loadCloseFriends()}
            className="mt-4 bg-indigo-600 rounded-xl px-5 py-2.5"
          >
            <Text className="text-white font-medium">Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }}
          showsVerticalScrollIndicator={false}
        >
          <CloseFriendsLimitBanner count={closeFriends.length} limit={closeFriendsLimit} />

          {closeFriends.length > 0 ? (
            closeFriends.map(friend => (
              <CloseFriendRow
                key={friend.userId}
                friend={friend}
                onRemove={() => setPendingRemoveId(friend.userId)}
              />
            ))
          ) : !closeFriendsLoading ? (
            <View className="items-center py-16">
              <Text className="text-lg font-medium text-gray-400">No close friends yet</Text>
              <Text className="text-sm text-gray-500 mt-1 text-center px-8">
                Add friends here to control who sees your Locket moments.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      )}

      <AddCloseFriendSheet
        visible={addSheetVisible}
        candidates={candidates}
        candidatesLoading={candidatesLoading}
        limitReached={limitReached}
        onClose={() => setAddSheetVisible(false)}
        onAdd={handleAdd}
      />

      <ConfirmModal
        visible={pendingRemoveFriend !== null}
        icon={<TrashIcon size={28} color="#EF4444" />}
        title="Remove Close Friend"
        message={
          pendingRemoveFriend
            ? `Remove ${pendingRemoveFriend.fullName} from your close friends?`
            : ''
        }
        confirmLabel="Remove"
        onCancel={() => setPendingRemoveId(null)}
        onConfirm={() => {
          if (pendingRemoveId) removeCloseFriend(pendingRemoveId);
          setPendingRemoveId(null);
        }}
      />
    </View>
  );
}
