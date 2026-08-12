import { Pressable, Text, View } from 'react-native';
import { ImageIcon } from '../../assets/Icon';
import { useGoToTab } from '../../hooks/useGoToTab';
import { PressableScale } from '../../theme/motion';
import Avatar from '../ui/Avatar';

type ComposerCardProps = {
  avatar: string;
  // Mở CreatePostModal (create flow thật, POST /api/posts).
  onOpenComposer: () => void;
};

export default function ComposerCard({ avatar, onOpenComposer }: ComposerCardProps) {
  const goToTab = useGoToTab();

  return (
    <View className="mx-5 bg-paper-base dark:bg-ink-raised rounded-hero p-4 border border-brand/10 shadow-sm">
      <View className="flex-row items-center gap-3">
        <Pressable onPress={() => goToTab('profile')}>
          <Avatar uri={avatar} size={44} shape="squircle" ring />
        </Pressable>
        <Pressable
          onPress={onOpenComposer}
          className="flex-1 bg-paper-raised dark:bg-black/20 rounded-full px-4 py-3"
        >
          <Text className="text-base text-content-faint dark:text-content-faint-dark">
            What's on your mind?
          </Text>
        </Pressable>
        <PressableScale
          onPress={onOpenComposer}
          hitSlop={8}
          className="p-2 rounded-full active:bg-paper-raised dark:active:bg-white/5"
        >
          <ImageIcon size={22} />
        </PressableScale>
      </View>
    </View>
  );
}
