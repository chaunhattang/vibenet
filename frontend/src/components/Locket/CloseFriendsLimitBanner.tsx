import { Text, View } from 'react-native';
import { StarIcon } from '../../assets/Icon';

type CloseFriendsLimitBannerProps = {
  count: number;
  limit: number;
};

export default function CloseFriendsLimitBanner({ count, limit }: CloseFriendsLimitBannerProps) {
  const isFull = count >= limit;

  return (
    <View className="flex-row items-center gap-3 bg-amber-50 dark:bg-amber-500/10 rounded-2xl p-4 border border-amber-200 dark:border-amber-500/20">
      <StarIcon size={18} color="#F59E0B" filled />
      <View className="flex-1">
        <Text className="text-gray-900 dark:text-white font-medium text-sm">
          {count} of {limit} close friends
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
          {isFull
            ? 'Limit reached — remove someone to add another.'
            : 'Only close friends see your Locket moments by default.'}
        </Text>
      </View>
    </View>
  );
}
