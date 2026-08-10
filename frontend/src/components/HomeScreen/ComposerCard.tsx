import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ImageIcon, SmileIcon } from '../../assets/Icon';
import { RootStackParamList } from '../../navigation/types';
import { PLACEHOLDER } from '../../theme/colors';
import { PressableScale } from '../../theme/motion';
import Avatar from '../ui/Avatar';
import GradientButton from '../ui/GradientButton';

type Nav = NativeStackNavigationProp<RootStackParamList>;

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
  const navigation = useNavigation<Nav>();

  return (
    <View className="mx-5 bg-paper-base dark:bg-ink-raised rounded-hero p-4 border border-brand/10 shadow-sm">
      <View className="flex-row gap-3">
        <Pressable onPress={() => navigation.navigate('Profile')}>
          <Avatar uri={avatar} size={44} shape="squircle" ring />
        </Pressable>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          placeholder="What's on your mind before it's gone?"
          placeholderTextColor={PLACEHOLDER}
          multiline
          numberOfLines={expanded ? 3 : 1}
          textBreakStrategy="simple"
          className="flex-1 text-base text-content-strong dark:text-content-strong-dark pt-2"
        />
      </View>

      {expanded && (
        <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-hairline-light dark:border-hairline-dark">
          <View className="flex-row items-center gap-1">
            <PressableScale
              onPress={onOpenMedia}
              hitSlop={8}
              className="p-2 rounded-full active:bg-paper-raised dark:active:bg-white/5"
            >
              <ImageIcon size={20} />
            </PressableScale>
            <PressableScale
              hitSlop={8}
              className="p-2 rounded-full active:bg-paper-raised dark:active:bg-white/5"
            >
              <SmileIcon size={20} />
            </PressableScale>
          </View>

          <View className="flex-row items-center gap-2">
            <Pressable onPress={onCancel} className="px-4 py-2">
              <Text className="text-sm font-semibold text-content-muted dark:text-content-muted-dark">
                Cancel
              </Text>
            </Pressable>
            <GradientButton
              onPress={onSubmit}
              disabled={!value.trim() || isSubmitting}
              loading={isSubmitting}
              label={isSubmitting ? 'Whispering...' : 'Whisper'}
            />
          </View>
        </View>
      )}
    </View>
  );
}
