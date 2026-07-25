import { Image, Pressable, Text, View } from 'react-native';
import { PlusIcon } from '../../assets/Icon';
import { useGoToProfile } from '../../hooks/useGoToProfile';

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

  return (
    <View className="flex-row items-center gap-3 py-2 px-4">
      <Pressable
        onPress={() => goToProfile(userId)}
        className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-white/10"
      >
        {avatarUrl && <Image source={{ uri: avatarUrl }} className="w-full h-full" />}
      </Pressable>

      <View className="flex-1">
        <Text numberOfLines={1} className="text-sm font-semibold text-gray-900 dark:text-white">
          {name}
        </Text>
        <Text numberOfLines={1} className="text-xs text-gray-500">
          {reason}
        </Text>
      </View>

      <Pressable
        onPress={onConnect}
        hitSlop={8}
        className="w-8 h-8 rounded-full bg-indigo-600 items-center justify-center"
      >
        <PlusIcon size={16} />
      </Pressable>
    </View>
  );
}
