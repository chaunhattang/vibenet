import { Pressable, Text, View } from 'react-native';
import { TrashIcon } from '../../assets/Icon';
import { CloseFriend } from '../../types';
import Avatar from '../ui/Avatar';

type CloseFriendRowProps = {
  friend: CloseFriend;
  onRemove: () => void;
};

export default function CloseFriendRow({ friend, onRemove }: CloseFriendRowProps) {
  return (
    <View className="flex-row items-center gap-3 bg-paper-raised dark:bg-ink-raised rounded-card p-3 border border-hairline-light dark:border-hairline-dark">
      <Avatar uri={friend.avatarUrl} size={48} />
      <View className="flex-1">
        <Text className="text-content-strong dark:text-content-strong-dark font-medium">
          {friend.fullName}
        </Text>
        <Text className="text-content-muted dark:text-content-muted-dark text-sm">
          @{friend.userName}
        </Text>
      </View>
      <Pressable
        onPress={onRemove}
        hitSlop={8}
        className="w-9 h-9 rounded-full bg-danger/10 items-center justify-center"
      >
        <TrashIcon size={16} />
      </Pressable>
    </View>
  );
}
