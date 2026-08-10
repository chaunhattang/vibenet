import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { StarIcon, TrashIcon } from '../assets/Icon';
import { ApiError, resolveMediaUrl } from '../api/client';
import { getFriends } from '../api/friends';
import ConfirmModal from '../components/HomeScreen/ConfirmModal';
import AddCloseFriendSheet, { AddCloseFriendCandidate } from '../components/Locket/AddCloseFriendSheet';
import CloseFriendRow from '../components/Locket/CloseFriendRow';
import CloseFriendsLimitBanner from '../components/Locket/CloseFriendsLimitBanner';
import EmptyState from '../components/ui/EmptyState';
import GradientButton from '../components/ui/GradientButton';
import ScreenHeader from '../components/ui/ScreenHeader';
import { useAuth } from '../contexts/AuthContext';
import { useLocket } from '../contexts/LocketContext';
import { C } from '../theme/colors';

export default function CloseFriendsScreen() {
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
    <View className="flex-1 bg-paper-base dark:bg-ink-base">
      <ScreenHeader
        title="Close Friends"
        right={
          <Pressable
            onPress={handleOpenAddSheet}
            disabled={limitReached}
            className="w-9 h-9 rounded-full bg-brand items-center justify-center disabled:opacity-40"
          >
            <StarIcon size={16} color={C.white} filled />
          </Pressable>
        }
      />

      {closeFriendsError && closeFriends.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <EmptyState icon={<StarIcon size={26} color={C.danger} />} title={closeFriendsError} />
          <GradientButton onPress={() => loadCloseFriends()} label="Try Again" className="mt-4" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 12 }}
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
            <EmptyState
              icon={<StarIcon size={26} color={C.brand} />}
              title="No close friends yet"
              subtitle="Add friends here to control who sees your Locket moments."
            />
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
        icon={<TrashIcon size={28} color={C.danger} />}
        title="Remove Close Friend"
        message={
          pendingRemoveFriend
            ? `Remove ${pendingRemoveFriend.fullName} from your close friends?`
            : ''
        }
        confirmLabel="Remove"
        confirmColor={C.danger}
        onCancel={() => setPendingRemoveId(null)}
        onConfirm={() => {
          if (pendingRemoveId) removeCloseFriend(pendingRemoveId);
          setPendingRemoveId(null);
        }}
      />
    </View>
  );
}
