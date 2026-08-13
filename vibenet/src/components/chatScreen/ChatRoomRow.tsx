import { Text, View } from 'react-native';
import { useGoToProfile } from '../../hooks/useGoToProfile';
import { PressableScale } from '../../theme/motion';
import { ChatRoomData } from '../../types';
import { formatRelativeTime } from '../../utils/time';
import Avatar from '../ui/Avatar';

type ChatRoomRowProps = {
  room: ChatRoomData;
  isSelected: boolean;
  onPress: () => void;
};

export default function ChatRoomRow({
  room,
  isSelected,
  onPress,
}: ChatRoomRowProps) {
  const hasMessage = !!room.lastMessage;
  const goToProfile = useGoToProfile();

  return (
    <PressableScale
      onPress={onPress}
      className={`flex-row items-center gap-3 p-3 rounded-field ${
        isSelected
          ? 'bg-brand/10 border border-brand/20'
          : hasMessage
          ? 'bg-paper-raised dark:bg-ink-input'
          : ''
      }`}
    >
      <PressableScale onPress={() => goToProfile(room.friendId)} className="relative">
        <Avatar uri={room.friendAvatar} size={48} />
        {room.friendIsOnline && (
          <View className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-spark rounded-full border-2 border-paper-base dark:border-ink-base" />
        )}
      </PressableScale>

      <View className="flex-1 min-w-0">
        <View className="flex-row items-center justify-between mb-0.5">
          <Text
            numberOfLines={1}
            className="font-medium flex-1 pr-2 text-content-strong dark:text-content-strong-dark"
          >
            {room.friendName}
          </Text>
          {room.lastMessageTime && (
            <Text className="text-xs text-content-faint dark:text-content-faint-dark">
              {formatRelativeTime(room.lastMessageTime)}
            </Text>
          )}
        </View>
        <Text
          numberOfLines={1}
          className={`text-sm ${
            isSelected
              ? 'text-brand'
              : room.lastMessage
              ? 'text-content-muted dark:text-content-muted-dark'
              : 'text-content-faint dark:text-content-faint-dark italic'
          }`}
        >
          {room.lastMessage || 'Start a conversation...'}
        </Text>
      </View>
    </PressableScale>
  );
}
