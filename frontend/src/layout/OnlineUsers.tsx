import { ScrollView, Text, View } from 'react-native';
import Avatar from '../components/ui/Avatar';
import { PressableScale } from '../theme/motion';
import { OnlineUser } from '../types';

type OnlineUsersProps = {
  users: OnlineUser[];
  onSelectUser: (user: OnlineUser) => void;
};

export default function OnlineUsers({ users, onSelectUser }: OnlineUsersProps) {
  if (users.length === 0) return null;

  return (
    <View className="pt-4 pb-2">
      <Text className="text-xs font-bold text-content-faint dark:text-content-faint-dark tracking-wider px-5 mb-3">
        ONLINE NOW
      </Text>

      {/* horizontal ScrollView = giống <div className="flex overflow-x-auto"> bên web */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
      >
        {users.map(user => (
          <PressableScale
            key={user.id}
            onPress={() => onSelectUser(user)}
            className="items-center w-16"
          >
            <View className="relative">
              <Avatar uri={user.avatar} size={56} ring />
              {user.isOnline && (
                <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-spark border-2 border-paper-base dark:border-ink-base rounded-full" />
              )}
            </View>
            <Text
              numberOfLines={1}
              className="text-[11px] text-content-muted dark:text-content-muted-dark mt-1.5 w-16 text-center"
            >
              {user.name}
            </Text>
          </PressableScale>
        ))}
      </ScrollView>
    </View>
  );
}
