import { Pressable, Text, View } from 'react-native';
import { CloseIcon } from '../../assets/Icon';
import { useGoToProfile } from '../../hooks/useGoToProfile';
import Avatar from '../ui/Avatar';
import GradientButton from '../ui/GradientButton';

type FriendRequestCardProps = {
  userId: string;
  name: string;
  message: string;
  avatarUrl?: string;
  onAccept?: () => void;
  onDrift?: () => void;
};

export default function FriendRequestCard({
  userId,
  name,
  message,
  avatarUrl,
  onAccept,
  onDrift,
}: FriendRequestCardProps) {
  const goToProfile = useGoToProfile();

  return (
    <View className="bg-paper-raised dark:bg-ink-raised rounded-card p-4 border border-hairline-light dark:border-hairline-dark flex-row items-center gap-3">
      <Pressable onPress={() => goToProfile(userId)}>
        <Avatar uri={avatarUrl ?? ''} size={48} />
      </Pressable>

      <View className="flex-1">
        <View className="flex-row items-center gap-1.5 mb-0.5">
          <Text>💜</Text>
          <Text className="font-semibold text-content-strong dark:text-content-strong-dark text-sm">
            New Soul Connection
          </Text>
        </View>
        <Text className="text-content-muted dark:text-content-muted-dark text-xs mb-3">
          {name} {message}
        </Text>
        <View className="flex-row items-center gap-2">
          <GradientButton onPress={() => onAccept?.()} label="Accept" />
          <Pressable
            onPress={onDrift}
            className="flex-row items-center gap-1.5 px-3 py-2 rounded-full border border-hairline-light dark:border-hairline-dark"
          >
            <CloseIcon size={14} />
            <Text className="text-content-muted dark:text-content-muted-dark text-xs font-medium">
              Drift Away
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
