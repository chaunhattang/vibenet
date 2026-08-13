import { Animated, Pressable, Text, View } from 'react-native';
import { PlusIcon } from '../../assets/Icon';
import { useGoToProfile } from '../../hooks/useGoToProfile';
import { usePop } from '../../theme/motion';
import Avatar from '../ui/Avatar';

type SuggestedConnectionItemProps = {
  userId: string;
  name: string;
  reason: string;
  avatarUrl?: string;
  onConnect?: () => void;
};

export default function SuggestedConnectionItem({
  userId,
  name,
  reason,
  avatarUrl,
  onConnect,
}: SuggestedConnectionItemProps) {
  const goToProfile = useGoToProfile();
  const { scale, pop } = usePop();

  return (
    <View className="flex-row items-center gap-3 py-2 px-4">
      <Pressable onPress={() => goToProfile(userId)}>
        <Avatar uri={avatarUrl ?? ''} size={40} />
      </Pressable>

      <View className="flex-1">
        <Text
          numberOfLines={1}
          className="text-sm font-semibold text-content-strong dark:text-content-strong-dark"
        >
          {name}
        </Text>
        <Text numberOfLines={1} className="text-xs text-content-muted dark:text-content-muted-dark">
          {reason}
        </Text>
      </View>

      <Pressable
        onPress={() => {
          pop();
          onConnect?.();
        }}
        hitSlop={8}
      >
        <Animated.View
          style={{ transform: [{ scale }] }}
          className="w-8 h-8 rounded-full bg-brand items-center justify-center"
        >
          <PlusIcon size={16} />
        </Animated.View>
      </Pressable>
    </View>
  );
}
