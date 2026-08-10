import { Pressable, Text, View } from 'react-native';
import { UserIcon } from '../../assets/Icon';
import { useGoToProfile } from '../../hooks/useGoToProfile';
import { PressableScale } from '../../theme/motion';
import { NotificationData, NotificationType } from '../../types';
import Avatar from '../ui/Avatar';

// Retokenized from an unrelated pink/blue/purple/gray palette to the app's actual
// semantic colors: like -> accent (energy), reply -> brand (primary), mention -> spark
// (acid-lime highlight, dark text for contrast), faded -> muted content tone.
const BADGE_CONFIG: Record<NotificationType, { emoji: string; className: string; textClassName: string }> = {
  like: { emoji: '❤️', className: 'bg-accent', textClassName: 'text-white' },
  reply: { emoji: '💬', className: 'bg-brand', textClassName: 'text-white' },
  mention: { emoji: '@', className: 'bg-spark', textClassName: 'text-ink-base' },
  faded: { emoji: '👤', className: 'bg-content-faint dark:bg-content-faint-dark', textClassName: 'text-white' },
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
    <PressableScale
      onPress={onPress}
      className={`flex-row items-center gap-3 py-3 px-4 rounded-field active:bg-paper-raised dark:active:bg-white/5 ${
        isFaded ? 'opacity-60' : ''
      }`}
    >
      <Pressable onPress={() => userId && goToProfile(userId)} className="relative">
        {avatarUrl ? (
          <Avatar uri={avatarUrl} size={44} />
        ) : (
          <View className="w-11 h-11 rounded-full items-center justify-center bg-paper-overlay dark:bg-ink-overlay border border-hairline-light dark:border-hairline-dark">
            <UserIcon size={20} />
          </View>
        )}
        <View
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full items-center justify-center border-2 border-paper-base dark:border-ink-base ${badge.className}`}
        >
          <Text className={`text-[10px] font-bold ${badge.textClassName}`}>{badge.emoji}</Text>
        </View>
      </Pressable>

      <View className="flex-1">
        <Text className="text-sm text-content-strong dark:text-content-strong-dark">
          <Text className="font-semibold">{userName} </Text>
          {message}
        </Text>
      </View>

      <Text className="text-xs text-content-muted dark:text-content-muted-dark">{timeAgo}</Text>
    </PressableScale>
  );
}
