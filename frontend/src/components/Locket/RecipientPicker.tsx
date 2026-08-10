import { Text, View } from 'react-native';
import { CheckIcon } from '../../assets/Icon';
import { C } from '../../theme/colors';
import { PressableScale } from '../../theme/motion';
import { CloseFriend } from '../../types';
import Avatar from '../ui/Avatar';

type RecipientPickerProps = {
  closeFriends: CloseFriend[];
  selectedIds: Set<string>;
  onToggle: (userId: string) => void;
};

export default function RecipientPicker({ closeFriends, selectedIds, onToggle }: RecipientPickerProps) {
  if (closeFriends.length === 0) {
    return (
      <Text className="text-content-muted dark:text-content-muted-dark text-sm px-5 py-2">
        You don't have any close friends yet — add some to send them moments.
      </Text>
    );
  }

  return (
    <View className="px-5" style={{ gap: 8 }}>
      {closeFriends.map(friend => {
        const selected = selectedIds.has(friend.userId);
        return (
          <PressableScale
            key={friend.userId}
            onPress={() => onToggle(friend.userId)}
            className="flex-row items-center gap-3 bg-paper-raised dark:bg-ink-raised rounded-card p-3 border border-hairline-light dark:border-hairline-dark"
          >
            <Avatar uri={friend.avatarUrl} size={44} />
            <Text className="text-content-strong dark:text-content-strong-dark font-medium flex-1">
              {friend.fullName}
            </Text>
            <View
              className={`w-7 h-7 rounded-full items-center justify-center border-2 ${
                selected ? 'bg-brand border-brand' : 'border-hairline-light dark:border-hairline-dark'
              }`}
            >
              {selected && <CheckIcon size={14} color={C.white} />}
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}
