import { useNavigation } from '@react-navigation/native';
import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeftIcon } from '../../assets/Icon';

type ScreenHeaderProps = {
  title: string;
  right?: ReactNode;
  onBack?: () => void;
};

// Standard stack-screen header — replaces the 8 near-identical hand-rolled headers across
// the Locket/OtherProfile/CloseFriends screens. `header` type scale (text-xl font-bold)
// per UI_REDESIGN_PLAN.md §2.3, bumped up from the previous text-base.
export default function ScreenHeader({ title, right, onBack }: ScreenHeaderProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top + 10 }}
      className="flex-row items-center gap-3 px-5 pb-3 border-b border-hairline-light dark:border-hairline-dark"
    >
      <Pressable onPress={onBack ?? (() => navigation.goBack())} hitSlop={8}>
        <ChevronLeftIcon />
      </Pressable>
      <Text className="text-xl font-bold text-content-strong dark:text-content-strong-dark flex-1">
        {title}
      </Text>
      {right}
    </View>
  );
}
