import { Pressable, Text, View } from 'react-native';
import { resolveMediaUrl } from '../../api/client';
import { UserIcon } from '../../assets/Icon';
import { useGoToProfile } from '../../hooks/useGoToProfile';
import { PressableScale } from '../../theme/motion';
import { formatRelativeTime } from '../../utils/time';
import { AppNotification, NotificationKind } from '../../types';
import Avatar from '../ui/Avatar';

// Map từng loại notification thật của backend → câu chữ + huy hiệu emoji/màu.
const KIND_CONFIG: Record<
  NotificationKind,
  { emoji: string; message: string; className: string; textClassName: string }
> = {
  FRIEND_REQUEST: { emoji: '👋', message: 'sent you a friend request.', className: 'bg-brand', textClassName: 'text-white' },
  FRIEND_ACCEPTED: { emoji: '🤝', message: 'accepted your friend request.', className: 'bg-brand', textClassName: 'text-white' },
  REACTION: { emoji: '❤️', message: 'reacted to your post.', className: 'bg-accent', textClassName: 'text-white' },
  COMMENT: { emoji: '💬', message: 'commented on your post.', className: 'bg-brand', textClassName: 'text-white' },
  MOMENT_REPLY: { emoji: '↩️', message: 'replied to your moment.', className: 'bg-spark', textClassName: 'text-ink-base' },
  LOCKET_MOMENT_RECEIVED: { emoji: '📸', message: 'sent you a moment.', className: 'bg-accent', textClassName: 'text-white' },
  LOCKET_REACTION: { emoji: '🔥', message: 'reacted to your moment.', className: 'bg-accent', textClassName: 'text-white' },
};

type NotificationItemProps = {
  notification: AppNotification;
  onPress?: () => void;
};

export default function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const { type, actorId, actorName, actorAvatar, read, createdAt } = notification;
  const badge = KIND_CONFIG[type];
  const goToProfile = useGoToProfile();
  const avatarUrl = resolveMediaUrl(actorAvatar);

  return (
    <PressableScale
      onPress={onPress}
      className={`flex-row items-center gap-3 py-3 px-4 rounded-field active:bg-paper-raised dark:active:bg-white/5 ${
        read ? '' : 'bg-brand/5'
      }`}
    >
      <Pressable onPress={() => actorId && goToProfile(actorId)} className="relative">
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
          <Text className="font-semibold">{actorName} </Text>
          {badge.message}
        </Text>
      </View>

      {!read && <View className="w-2 h-2 rounded-full bg-brand" />}
      <Text className="text-xs text-content-muted dark:text-content-muted-dark">
        {formatRelativeTime(createdAt)}
      </Text>
    </PressableScale>
  );
}
