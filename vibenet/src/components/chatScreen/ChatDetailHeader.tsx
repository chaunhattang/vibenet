import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeftIcon,
  MoreVerticalIcon,
  PhoneIcon,
  VideoCameraIcon,
} from '../../assets/Icon';
import { useGoToProfile } from '../../hooks/useGoToProfile';
import Avatar from '../ui/Avatar';

type ChatDetailHeaderProps = {
  friendId: string;
  friendName: string;
  friendAvatar: string;
  friendIsOnline: boolean;
  onBack: () => void;
};

export default function ChatDetailHeader({
  friendId,
  friendName,
  friendAvatar,
  friendIsOnline,
  onBack,
}: ChatDetailHeaderProps) {
  const insets = useSafeAreaInsets();
  const goToProfile = useGoToProfile();

  return (
    <View
      style={{ paddingTop: insets.top + 10 }}
      className="flex-row items-center justify-between px-5 pb-3 border-b border-hairline-light dark:border-hairline-dark bg-paper-base dark:bg-ink-base"
    >
      <View className="flex-row items-center gap-3 flex-1">
        <Pressable onPress={onBack} hitSlop={8}>
          <ChevronLeftIcon />
        </Pressable>

        <Pressable
          onPress={() => goToProfile(friendId)}
          className="flex-row items-center gap-3 flex-1"
        >
          <View className="relative">
            <Avatar uri={friendAvatar} size={36} />
            {friendIsOnline && (
              <View className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-spark rounded-full border-2 border-paper-base dark:border-ink-base" />
            )}
          </View>

          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="text-base font-bold text-content-strong dark:text-content-strong-dark"
            >
              {friendName}
            </Text>
            <Text
              className={`text-xs ${
                friendIsOnline
                  ? 'text-success'
                  : 'text-content-faint dark:text-content-faint-dark'
              }`}
            >
              {friendIsOnline ? 'Active now' : 'Offline'}
            </Text>
          </View>
        </Pressable>
      </View>

      <View className="flex-row items-center gap-4">
        <PhoneIcon />
        <VideoCameraIcon />
        <MoreVerticalIcon />
      </View>
    </View>
  );
}
