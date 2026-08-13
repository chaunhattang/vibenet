import { Pressable, Text, View } from 'react-native';
import { useGoToProfile } from '../../hooks/useGoToProfile';
import { formatClockTime } from '../../utils/time';
import Avatar from '../ui/Avatar';

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
          <Pressable onPress={() => goToProfile(senderId)} className="self-end">
            <Avatar uri={avatar ?? ''} size={32} />
          </Pressable>
        )}

        <View className={isMe ? 'items-end' : 'items-start'}>
          <View
            className={`px-4 py-2.5 rounded-hero ${
              isMe
                ? 'bg-brand rounded-br-md'
                : 'bg-paper-base dark:bg-ink-input border border-hairline-light dark:border-hairline-dark rounded-bl-md'
            }`}
          >
            <Text
              className={`text-sm leading-relaxed ${
                isMe ? 'text-white' : 'text-content-strong dark:text-content-strong-dark'
              }`}
            >
              {content}
            </Text>
          </View>
          <View className="flex-row items-center gap-1 mt-1 px-1">
            {sender && !isMe && (
              <Text className="text-xs font-medium text-content-faint dark:text-content-faint-dark">
                {sender}
              </Text>
            )}
            <Text className="text-xs text-content-muted dark:text-content-muted-dark">
              {formatClockTime(timestamp)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
