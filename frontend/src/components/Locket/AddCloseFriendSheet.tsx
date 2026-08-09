import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloseIcon, PlusIcon, SearchIcon } from '../../assets/Icon';

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
          className="bg-white dark:bg-[#181825] rounded-t-3xl p-5"
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              Add Close Friend
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <CloseIcon />
            </Pressable>
          </View>

          <View className="flex-row items-center gap-2 bg-gray-100 dark:bg-[#1A1A27] px-3 py-2.5 rounded-full mb-4">
            <SearchIcon size={18} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Search friends"
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-gray-900 dark:text-white"
            />
          </View>

          {limitReached && (
            <Text className="text-amber-600 dark:text-amber-400 text-xs mb-3">
              You've reached the close friends limit — remove someone first.
            </Text>
          )}

          {candidatesLoading ? (
            <ActivityIndicator size="small" color="#6366F1" style={{ marginTop: 16 }} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {filtered.length > 0 ? (
                <View style={{ gap: 10 }}>
                  {filtered.map(friend => (
                    <Pressable
                      key={friend.id}
                      disabled={limitReached}
                      onPress={() => onAdd(friend)}
                      className="flex-row items-center gap-3 py-2 disabled:opacity-40"
                    >
                      <View className="w-11 h-11 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                        <Image source={{ uri: friend.avatar }} className="w-full h-full" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 dark:text-white font-medium">
                          {friend.name}
                        </Text>
                        <Text className="text-gray-500 text-sm">@{friend.handle}</Text>
                      </View>
                      <View className="w-8 h-8 rounded-full bg-indigo-600 items-center justify-center">
                        <PlusIcon size={16} />
                      </View>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text className="text-gray-500 text-center py-8">No friends to add.</Text>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
