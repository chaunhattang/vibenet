import { Image, Pressable, Text, TextInput, View } from 'react-native';
import { ImageIcon, SmileIcon } from '../../assets/Icon';

type ComposerCardProps = {
  avatar: string;
  value: string;
  onChangeText: (value: string) => void;
  expanded: boolean;
  onFocus: () => void;
  onCancel: () => void;
  onSubmit: () => void;
  onOpenMedia: () => void;
  isSubmitting: boolean;
};

export default function ComposerCard({
  avatar,
  value,
  onChangeText,
  expanded,
  onFocus,
  onCancel,
  onSubmit,
  onOpenMedia,
  isSubmitting,
}: ComposerCardProps) {
  return (
    <View className="mx-4 bg-white dark:bg-[#181825] rounded-3xl p-4 border border-indigo-100 dark:border-indigo-500/10 shadow-sm">
      <View className="flex-row gap-3">
        <View className="w-11 h-11 rounded-full overflow-hidden border-2 border-indigo-100 dark:border-indigo-500/20">
          <Image source={{ uri: avatar }} className="w-full h-full" />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          placeholder="What's on your mind before it's gone?"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={expanded ? 3 : 1}
          textBreakStrategy="simple"
          className="flex-1 text-base text-gray-800 dark:text-gray-100 pt-2"
        />
      </View>

      {expanded && (
        <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
          <View className="flex-row items-center gap-1">
            <Pressable
              onPress={onOpenMedia}
              hitSlop={8}
              className="p-2 rounded-full active:bg-gray-100 dark:active:bg-white/5"
            >
              <ImageIcon size={20} />
            </Pressable>
            <Pressable
              hitSlop={8}
              className="p-2 rounded-full active:bg-gray-100 dark:active:bg-white/5"
            >
              <SmileIcon size={20} />
            </Pressable>
          </View>

          <View className="flex-row items-center gap-2">
            <Pressable onPress={onCancel} className="px-4 py-2">
              <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={onSubmit}
              disabled={!value.trim() || isSubmitting}
              className="px-5 py-2 bg-indigo-600 rounded-full disabled:opacity-50"
            >
              <Text className="text-sm font-medium text-white">
                {isSubmitting ? 'Whispering...' : 'Whisper'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
