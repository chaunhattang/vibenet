import { Text, View } from 'react-native';
import { StarIcon } from '../../assets/Icon';
import { C } from '../../theme/colors';

type CloseFriendsLimitBannerProps = {
  count: number;
  limit: number;
};

export default function CloseFriendsLimitBanner({ count, limit }: CloseFriendsLimitBannerProps) {
  const isFull = count >= limit;

  return (
    <View className="flex-row items-center gap-3 bg-warning/10 rounded-card p-4 border border-warning/30">
      <StarIcon size={18} color={C.warning} filled />
      <View className="flex-1">
        <Text className="text-content-strong dark:text-content-strong-dark font-medium text-sm">
          {count} of {limit} close friends
        </Text>
        <Text className="text-content-muted dark:text-content-muted-dark text-xs mt-0.5">
          {isFull
            ? 'Limit reached — remove someone to add another.'
            : 'Only close friends see your Locket moments by default.'}
        </Text>
      </View>
    </View>
  );
}
