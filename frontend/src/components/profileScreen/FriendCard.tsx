import { Text, View } from 'react-native';
import { ChevronLeftIcon } from '../../assets/Icon';
import { PressableScale } from '../../theme/motion';
import { OnlineUser } from '../../types';
import Avatar from '../ui/Avatar';
import Card from '../ui/Card';

type FriendCardProps = {
  friend: OnlineUser;
  onPress: () => void;
};

export default function FriendCard({ friend, onPress }: FriendCardProps) {
  return (
    <PressableScale onPress={onPress}>
      <Card className="flex-row items-center gap-3 p-3">
        <Avatar uri={friend.avatar} size={48} />
        <View className="flex-1">
          <Text className="text-content-strong dark:text-content-strong-dark font-medium">
            {friend.name}
          </Text>
          <Text className="text-content-muted dark:text-content-muted-dark text-sm">
            @{friend.handle}
          </Text>
        </View>
        <View
          className="w-8 h-8 rounded-full bg-paper-overlay dark:bg-ink-overlay items-center justify-center"
          style={{ transform: [{ rotate: '180deg' }] }}
        >
          <ChevronLeftIcon size={16} />
        </View>
      </Card>
    </PressableScale>
  );
}
