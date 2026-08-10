import { Image, Pressable, Text, View } from 'react-native';
import { MessageIcon, PlayIcon } from '../../assets/Icon';
import { formatRelativeTime } from '../../utils/time';
import { MomentFeedItem } from '../../types';
import Avatar from '../ui/Avatar';
import ReactionBar from './ReactionBar';

type MomentCardProps = {
  moment: MomentFeedItem;
  onReact: (emoji: string) => void;
  onReply: () => void;
};

export default function MomentCard({ moment, onReact, onReply }: MomentCardProps) {
  const isUnread = moment.viewedAt === null;

  return (
    <View className="mx-5 rounded-hero overflow-hidden bg-paper-raised dark:bg-ink-raised border border-hairline-light dark:border-hairline-dark">
      <View className="flex-row items-center gap-3 p-4">
        <Avatar uri={moment.senderAvatarUrl} size={40} />
        <View className="flex-1">
          <Text className="text-content-strong dark:text-content-strong-dark font-semibold">
            {moment.senderName}
          </Text>
          <Text className="text-content-faint dark:text-content-faint-dark text-xs">
            {formatRelativeTime(moment.createdAt)}
          </Text>
        </View>
        {isUnread && <View className="w-2.5 h-2.5 rounded-full bg-accent" />}
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
          <View className="absolute bottom-3 left-3 right-3 bg-black/40 rounded-field px-3 py-2">
            <Text className="text-white text-sm">{moment.caption}</Text>
          </View>
        )}
      </View>

      <View className="p-4 flex-row items-center gap-3">
        <ReactionBar myReaction={moment.myReaction} onReact={onReact} onMedia={false} />
        <Pressable
          onPress={onReply}
          hitSlop={8}
          className="w-9 h-9 rounded-full bg-paper-overlay dark:bg-white/5 items-center justify-center"
        >
          <MessageIcon size={16} />
        </Pressable>
      </View>
    </View>
  );
}
