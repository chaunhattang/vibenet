import { ReactNode } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { ArchiveIcon, CameraIcon, CheckIcon, UsersIcon } from '../../assets/Icon';

type ProfileHeaderProps = {
  coverImage: string;
  avatar: string;
  displayName: string;
  bio: string;
  postsCount: number;
  friendsCount: number;
  reactionsCount: number;
  showChangeCover?: boolean;
  onChangeCover?: () => void;
  actions?: ReactNode;
};

export default function ProfileHeader({
  coverImage,
  avatar,
  displayName,
  bio,
  postsCount,
  friendsCount,
  reactionsCount,
  showChangeCover,
  onChangeCover,
  actions,
}: ProfileHeaderProps) {
  return (
    <View>
      <View className="relative w-full h-40 bg-gray-200 dark:bg-gray-800">
        <Image source={{ uri: coverImage }} className="w-full h-full" resizeMode="cover" />

        {showChangeCover && (
          <Pressable
            onPress={onChangeCover}
            className="absolute top-4 right-4 flex-row items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg"
          >
            <CameraIcon size={14} color="#FFFFFF" />
            <Text className="text-white text-xs font-medium">Change Cover</Text>
          </Pressable>
        )}

        <View className="absolute -bottom-10 left-5">
          <View className="w-20 h-20 rounded-full border-4 border-white dark:border-[#0a0a0a] overflow-hidden bg-gray-200 dark:bg-gray-700">
            <Image source={{ uri: avatar }} className="w-full h-full" />
          </View>
        </View>
      </View>

      <View className="mt-12 px-5">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {displayName}
          </Text>
          <CheckIcon size={18} />
        </View>
        <Text className="text-gray-600 dark:text-gray-400 italic mt-1">"{bio}"</Text>

        <View className="flex-row items-center gap-5 mt-3">
          <View className="flex-row items-center gap-1.5">
            <ArchiveIcon size={14} />
            <Text className="text-xs font-medium text-gray-500">
              {postsCount} THOUGHTS
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <UsersIcon size={14} />
            <Text className="text-xs font-medium text-gray-500">
              {friendsCount} FRIENDS
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-gray-500">•</Text>
            <Text className="text-xs font-medium text-gray-500">
              {reactionsCount} REACTIONS
            </Text>
          </View>
        </View>
      </View>

      {actions}
    </View>
  );
}
