import { Image, Pressable, Text, View } from 'react-native';
import { CheckIcon, CloseIcon } from '../../assets/Icon';
import { useGoToProfile } from '../../hooks/useGoToProfile';

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
    <View className="bg-gray-50 dark:bg-[#1A1A2E] rounded-2xl p-4 border border-gray-200 dark:border-white/5 flex-row items-center gap-3">
      <Pressable
        onPress={() => goToProfile(userId)}
        className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700"
      >
        {avatarUrl && <Image source={{ uri: avatarUrl }} className="w-full h-full" />}
      </Pressable>

      <View className="flex-1">
        <View className="flex-row items-center gap-1.5 mb-0.5">
          <Text>💜</Text>
          <Text className="font-semibold text-gray-900 dark:text-white text-sm">
            New Soul Connection
          </Text>
        </View>
        <Text className="text-gray-500 dark:text-gray-400 text-xs mb-3">
          {name} {message}
        </Text>
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={onAccept}
            className="flex-row items-center gap-1.5 bg-indigo-600 px-4 py-2 rounded-full"
          >
            <CheckIcon size={14} color="#FFFFFF" />
            <Text className="text-white text-xs font-medium">Accept</Text>
          </Pressable>
          <Pressable
            onPress={onDrift}
            className="flex-row items-center gap-1.5 px-3 py-2 rounded-full border border-gray-300 dark:border-white/10"
          >
            <CloseIcon size={14} />
            <Text className="text-gray-500 dark:text-gray-400 text-xs font-medium">
              Drift Away
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
