import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloseIcon, PlusIcon, SearchIcon } from '../../assets/Icon';
import { C, PLACEHOLDER } from '../../theme/colors';
import { PressableScale } from '../../theme/motion';
import Avatar from '../ui/Avatar';

export type AddCloseFriendCandidate = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
};

type AddCloseFriendSheetProps = {
  visible: boolean;
  candidates: AddCloseFriendCandidate[];
  candidatesLoading: boolean;
  limitReached: boolean;
  onClose: () => void;
  onAdd: (friend: AddCloseFriendCandidate) => void;
};

export default function AddCloseFriendSheet({
  visible,
  candidates,
  candidatesLoading,
  limitReached,
  onClose,
  onAdd,
}: AddCloseFriendSheetProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(
      c => c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q),
    );
  }, [candidates, query]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
        <View
          style={{ paddingBottom: insets.bottom + 16, maxHeight: '75%' }}
          className="bg-paper-base dark:bg-ink-overlay rounded-t-hero p-5"
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-headline text-content-strong dark:text-content-strong-dark">
              Add Close Friend
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <CloseIcon />
            </Pressable>
          </View>

          <View className="flex-row items-center gap-2 bg-paper-raised dark:bg-ink-input px-3 py-2.5 rounded-full mb-4">
            <SearchIcon size={18} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Search friends"
              placeholderTextColor={PLACEHOLDER}
              className="flex-1 text-content-strong dark:text-content-strong-dark"
            />
          </View>

          {limitReached && (
            <Text className="text-warning text-xs mb-3">
              You've reached the close friends limit — remove someone first.
            </Text>
          )}

          {candidatesLoading ? (
            <ActivityIndicator size="small" color={C.brand} style={{ marginTop: 16 }} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {filtered.length > 0 ? (
                <View style={{ gap: 10 }}>
                  {filtered.map(friend => (
                    <PressableScale
                      key={friend.id}
                      disabled={limitReached}
                      onPress={() => onAdd(friend)}
                      className="flex-row items-center gap-3 py-2 disabled:opacity-40"
                    >
                      <Avatar uri={friend.avatar} size={44} />
                      <View className="flex-1">
                        <Text className="text-content-strong dark:text-content-strong-dark font-medium">
                          {friend.name}
                        </Text>
                        <Text className="text-content-muted dark:text-content-muted-dark text-sm">
                          @{friend.handle}
                        </Text>
                      </View>
                      <View className="w-8 h-8 rounded-full bg-brand items-center justify-center">
                        <PlusIcon size={16} />
                      </View>
                    </PressableScale>
                  ))}
                </View>
              ) : (
                <Text className="text-content-muted dark:text-content-muted-dark text-center py-8">
                  No friends to add.
                </Text>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
