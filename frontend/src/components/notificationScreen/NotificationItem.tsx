import { Image, Pressable, Text, View } from 'react-native';
import { UserIcon } from '../../assets/Icon';
import { useGoToProfile } from '../../hooks/useGoToProfile';
import { NotificationData, NotificationType } from '../../types';

const BADGE_CONFIG: Record<NotificationType, { emoji: string; className: string }> = {
  like: { emoji: '❤️', className: 'bg-pink-500' },
  reply: { emoji: '💬', className: 'bg-blue-500' },
  mention: { emoji: '@', className: 'bg-purple-500' },
  faded: { emoji: '👤', className: 'bg-gray-500' },
};

type NotificationItemProps = {
  notification: NotificationData;
  onPress?: () => void;
};

export default function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const { type, userId, userName, message, timeAgo, avatarUrl } = notification;
  const badge = BADGE_CONFIG[type];
  const isFaded = type === 'faded';
  const goToProfile = useGoToProfile();

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-3 py-3 px-4 rounded-xl active:bg-gray-50 dark:active:bg-white/5 ${
        isFaded ? 'opacity-60' : ''
      }`}
    >
      <Pressable onPress={() => userId && goToProfile(userId)} className="relative">
        <View className="w-11 h-11 rounded-full overflow-hidden bg-gray-200 dark:bg-[#2A2A3E] border border-gray-200 dark:border-white/10">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} className="w-full h-full" />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <UserIcon size={20} />
            </View>
          )}
        </View>
        <View
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full items-center justify-center border-2 border-white dark:border-[#0a0a0a] ${badge.className}`}
        >
          <Text className="text-[10px] text-white font-bold">{badge.emoji}</Text>
        </View>
      </Pressable>

      <View className="flex-1">
        <Text className="text-sm text-gray-800 dark:text-gray-200">
          <Text className="font-semibold text-gray-900 dark:text-white">{userName} </Text>
          {message}
        </Text>
      </View>

      <Text className="text-xs text-gray-500">{timeAgo}</Text>
    </Pressable>
  );
}
