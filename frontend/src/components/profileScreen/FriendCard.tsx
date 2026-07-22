import { Image, Pressable, Text, View } from 'react-native';
import { ChevronLeftIcon } from '../../assets/Icon';
import { OnlineUser } from '../../types';

type FriendCardProps = {
  friend: OnlineUser;
  onPress: () => void;
};

export default function FriendCard({ friend, onPress }: FriendCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 bg-gray-50 dark:bg-[#11131F] rounded-2xl p-3 border border-gray-200 dark:border-white/5"
    >
      <View className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
        <Image source={{ uri: friend.avatar }} className="w-full h-full" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 dark:text-white font-medium">{friend.name}</Text>
        <Text className="text-gray-500 text-sm">@{friend.handle}</Text>
      </View>
      <View
        className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/5 items-center justify-center"
        style={{ transform: [{ rotate: '180deg' }] }}
      >
        <ChevronLeftIcon size={16} />
      </View>
    </Pressable>
  );
}
