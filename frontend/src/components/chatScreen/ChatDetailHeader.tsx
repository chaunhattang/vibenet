import { Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeftIcon,
  MoreVerticalIcon,
  PhoneIcon,
  VideoCameraIcon,
} from '../../assets/Icon';

type ChatDetailHeaderProps = {
  friendName: string;
  friendAvatar: string;
  friendIsOnline: boolean;
  onBack: () => void;
};

export default function ChatDetailHeader({
  friendName,
  friendAvatar,
  friendIsOnline,
  onBack,
}: ChatDetailHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top + 10 }}
      className="flex-row items-center justify-between px-4 pb-3 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a]"
    >
      <View className="flex-row items-center gap-3 flex-1">
        <Pressable onPress={onBack} hitSlop={8}>
          <ChevronLeftIcon />
        </Pressable>

        <View className="relative">
          <View className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <Image source={{ uri: friendAvatar }} className="w-full h-full" />
          </View>
          {friendIsOnline && (
            <View className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#0a0a0a]" />
          )}
        </View>

        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="text-base font-bold text-gray-900 dark:text-white"
          >
            {friendName}
          </Text>
          <Text
            className={`text-xs ${
              friendIsOnline
                ? 'text-green-500'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {friendIsOnline ? 'Active now' : 'Offline'}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-4">
        <PhoneIcon />
        <VideoCameraIcon />
        <MoreVerticalIcon />
      </View>
    </View>
  );
}
