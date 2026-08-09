import { Image, Pressable, Text, View } from 'react-native';
import { TrashIcon } from '../../assets/Icon';
import { CloseFriend } from '../../types';

type CloseFriendRowProps = {
  friend: CloseFriend;
  onRemove: () => void;
};

export default function CloseFriendRow({ friend, onRemove }: CloseFriendRowProps) {
  return (
    <View className="flex-row items-center gap-3 bg-gray-50 dark:bg-[#11131F] rounded-2xl p-3 border border-gray-200 dark:border-white/5">
      <View className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
        <Image source={{ uri: friend.avatarUrl }} className="w-full h-full" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 dark:text-white font-medium">{friend.fullName}</Text>
        <Text className="text-gray-500 text-sm">@{friend.userName}</Text>
      </View>
      <Pressable
        onPress={onRemove}
        hitSlop={8}
        className="w-9 h-9 rounded-full bg-red-50 dark:bg-red-500/10 items-center justify-center"
      >
        <TrashIcon size={16} />
      </Pressable>
    </View>
  );
}
