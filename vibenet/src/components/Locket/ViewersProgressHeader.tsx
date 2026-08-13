import { Image, Text, View } from 'react-native';
import { PlayIcon } from '../../assets/Icon';
import { SentMoment } from '../../types';

type ViewersProgressHeaderProps = {
  moment: SentMoment;
  viewedCount: number;
  totalRecipients: number;
};

export default function ViewersProgressHeader({
  moment,
  viewedCount,
  totalRecipients,
}: ViewersProgressHeaderProps) {
  const progress = totalRecipients > 0 ? viewedCount / totalRecipients : 0;

  return (
    <View className="items-center px-5 pt-4 pb-2">
      <View className="w-24 h-24 rounded-card overflow-hidden bg-black">
        {moment.mediaType === 'PHOTO' ? (
          <Image source={{ uri: moment.mediaUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full items-center justify-center bg-gray-900">
            <PlayIcon size={24} />
          </View>
        )}
      </View>

      {moment.caption && (
        <Text className="text-content-strong dark:text-content-strong-dark text-sm mt-3 text-center px-8">
          {moment.caption}
        </Text>
      )}

      <Text className="text-content-muted dark:text-content-muted-dark text-sm mt-3">
        Seen by {viewedCount} of {totalRecipients}
      </Text>

      <View className="w-full h-1.5 bg-hairline-light dark:bg-hairline-dark rounded-full mt-2 overflow-hidden">
        <View
          className="h-full bg-brand rounded-full"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </View>
    </View>
  );
}
