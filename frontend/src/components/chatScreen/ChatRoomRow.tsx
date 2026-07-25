import { Image, Pressable, Text, View } from 'react-native';
import { useGoToProfile } from '../../hooks/useGoToProfile';
import { ChatRoomData } from '../../types';
import { formatRelativeTime } from '../../utils/time';

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
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-3 p-3 rounded-xl ${
        isSelected
          ? 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20'
          : hasMessage
          ? 'bg-gray-50 dark:bg-[#1f1f22]'
          : ''
      }`}
    >
      <Pressable onPress={() => goToProfile(room.friendId)} className="relative">
        <View className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
          <Image
            source={{ uri: room.friendAvatar }}
            className="w-full h-full"
          />
        </View>
        {room.friendIsOnline && (
          <View className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-[#0a0a0a]" />
        )}
      </Pressable>

      <View className="flex-1 min-w-0">
        <View className="flex-row items-center justify-between mb-0.5">
          <Text
            numberOfLines={1}
            className={`font-medium flex-1 pr-2 ${
              isSelected
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {room.friendName}
          </Text>
          {room.lastMessageTime && (
            <Text className="text-xs text-gray-400 dark:text-gray-500">
              {formatRelativeTime(room.lastMessageTime)}
            </Text>
          )}
        </View>
        <Text
          numberOfLines={1}
          className={`text-sm ${
            isSelected
              ? 'text-indigo-600 dark:text-indigo-400'
              : room.lastMessage
              ? 'text-gray-500'
              : 'text-gray-400 dark:text-gray-600 italic'
          }`}
        >
          {room.lastMessage || 'Start a conversation...'}
        </Text>
      </View>
    </Pressable>
  );
}
