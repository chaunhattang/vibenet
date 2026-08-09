import { Text, View } from 'react-native';
import { CameraIcon } from '../../assets/Icon';

export default function MomentFeedEmptyState() {
  return (
    <View className="mx-4 items-center py-16 bg-white/50 dark:bg-[#181825]/50 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
      <CameraIcon size={28} />
      <Text className="text-lg font-medium text-gray-600 dark:text-gray-400 mt-3">
        No moments yet
      </Text>
      <Text className="text-sm text-gray-500 mt-1 text-center px-8">
        When your friends share a Locket moment, it'll show up here.
      </Text>
    </View>
  );
}
