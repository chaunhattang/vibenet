import { Image, Text, View } from 'react-native';
import { EyeIcon, PlayIcon } from '../../assets/Icon';
import { PressableScale } from '../../theme/motion';
import { formatRelativeTime } from '../../utils/time';
import { SentMoment } from '../../types';

type SentMomentCardProps = {
  moment: SentMoment;
  onPress: () => void;
};

export default function SentMomentCard({ moment, onPress }: SentMomentCardProps) {
  return (
    <PressableScale
      onPress={onPress}
      className="mx-5 flex-row items-center gap-3 p-3 rounded-card bg-paper-raised dark:bg-ink-raised border border-hairline-light dark:border-hairline-dark"
    >
      <View className="w-16 h-16 rounded-field overflow-hidden bg-black">
        {moment.mediaType === 'PHOTO' ? (
          <Image source={{ uri: moment.mediaUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full items-center justify-center bg-gray-900">
            <PlayIcon size={20} />
          </View>
        )}
      </View>

      <View className="flex-1">
        {moment.caption ? (
          <Text
            className="text-content-strong dark:text-content-strong-dark font-medium"
            numberOfLines={1}
          >
            {moment.caption}
          </Text>
        ) : (
          <Text className="text-content-muted dark:text-content-muted-dark italic">
            No caption
          </Text>
        )}
        <Text className="text-content-faint dark:text-content-faint-dark text-xs mt-1">
          {formatRelativeTime(moment.createdAt)}
        </Text>
      </View>

      <View className="items-end gap-1">
        <View className="flex-row items-center gap-1.5">
          <EyeIcon size={16} />
          <Text className="text-content-strong dark:text-content-strong-dark text-sm font-medium">
            {moment.viewedCount}/{moment.recipientCount}
          </Text>
        </View>
      </View>
    </PressableScale>
  );
}
