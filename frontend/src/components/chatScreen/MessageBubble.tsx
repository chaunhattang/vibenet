import { Image, Pressable, Text, View } from 'react-native';
import { useGoToProfile } from '../../hooks/useGoToProfile';
import { formatClockTime } from '../../utils/time';

type MessageBubbleProps = {
  content: string;
  isMe: boolean;
  senderId: string;
  avatar?: string;
  sender?: string;
  timestamp: string;
};

export default function MessageBubble({
  content,
  isMe,
  senderId,
  avatar,
  sender,
  timestamp,
}: MessageBubbleProps) {
  const goToProfile = useGoToProfile();

  return (
    <View className={`flex-row mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
      <View className={`flex-row max-w-[75%] ${isMe ? '' : 'gap-2'}`}>
        {!isMe && (
          <Pressable
            onPress={() => goToProfile(senderId)}
            className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 self-end"
          >
            {avatar && (
              <Image source={{ uri: avatar }} className="w-full h-full" />
            )}
          </Pressable>
        )}

        <View className={isMe ? 'items-end' : 'items-start'}>
          <View
            className={`px-4 py-2.5 rounded-2xl ${
              isMe
                ? 'bg-indigo-600 rounded-br-sm'
                : 'bg-white dark:bg-[#1f1f22] border border-gray-100 dark:border-white/5 rounded-bl-sm'
            }`}
          >
            <Text
              className={`text-sm leading-relaxed ${
                isMe ? 'text-white' : 'text-gray-900 dark:text-gray-200'
              }`}
            >
              {content}
            </Text>
          </View>
          <View className="flex-row items-center gap-1 mt-1 px-1">
            {sender && !isMe && (
              <Text className="text-xs font-medium text-gray-400">
                {sender}
              </Text>
            )}
            <Text className="text-xs text-gray-500">
              {formatClockTime(timestamp)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
