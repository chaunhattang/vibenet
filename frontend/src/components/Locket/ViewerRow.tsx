import { Text, View } from 'react-native';
import { formatRelativeTime } from '../../utils/time';
import { MomentViewer } from '../../types';
import Avatar from '../ui/Avatar';

type ViewerRowProps = {
  viewer: MomentViewer;
};

export default function ViewerRow({ viewer }: ViewerRowProps) {
  return (
    <View className="flex-row items-center gap-3 px-5 py-2.5">
      <Avatar uri={viewer.avatarUrl} size={40} />
      <Text className="text-content-strong dark:text-content-strong-dark font-medium flex-1">
        {viewer.userName}
      </Text>
      <Text className="text-content-faint dark:text-content-faint-dark text-xs">
        {formatRelativeTime(viewer.viewedAt)}
      </Text>
    </View>
  );
}
