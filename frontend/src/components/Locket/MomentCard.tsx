import { Image, Text, View } from 'react-native';
import { PlayIcon } from '../../assets/Icon';
import { formatRelativeTime } from '../../utils/time';
import { MomentFeedItem } from '../../types';
import ReactionBar from './ReactionBar';

type MomentCardProps = {
  moment: MomentFeedItem;
  onReact: (emoji: string) => void;
};

export default function MomentCard({ moment, onReact }: MomentCardProps) {
  const isUnread = moment.viewedAt === null;

  return (
    <View className="mx-4 rounded-3xl overflow-hidden bg-gray-100 dark:bg-[#11131F] border border-gray-200 dark:border-white/5">
      <View className="flex-row items-center gap-3 p-4">
        <View className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
          <Image source={{ uri: moment.senderAvatarUrl }} className="w-full h-full" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 dark:text-white font-semibold">
            {moment.senderName}
          </Text>
          <Text className="text-gray-500 text-xs">{formatRelativeTime(moment.createdAt)}</Text>
        </View>
        {isUnread && <View className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
      </View>

      <View className="w-full aspect-square bg-black">
        {moment.mediaType === 'PHOTO' ? (
          <Image source={{ uri: moment.mediaUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          // No video player lib installed yet (see LOCKET_FEATURE_PLAN.md §8) — placeholder only.
          <View className="w-full h-full items-center justify-center bg-gray-900">
            <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center">
              <PlayIcon size={28} />
            </View>
            <Text className="text-white/70 text-xs mt-2">Video playback coming soon</Text>
          </View>
        )}

        {moment.caption && (
          <View className="absolute bottom-3 left-3 right-3 bg-black/40 rounded-xl px-3 py-2">
            <Text className="text-white text-sm">{moment.caption}</Text>
          </View>
        )}
      </View>

      <View className="p-4">
        <ReactionBar myReaction={moment.myReaction} onReact={onReact} />
      </View>
    </View>
  );
}
