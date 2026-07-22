import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { OnlineUser } from '../types';

type OnlineUsersProps = {
  users: OnlineUser[];
  onSelectUser: (user: OnlineUser) => void;
};

export default function OnlineUsers({ users, onSelectUser }: OnlineUsersProps) {
  if (users.length === 0) return null;

  return (
    <View className="pt-4 pb-2">
      <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider px-4 mb-3">
        ONLINE NOW
      </Text>

      {/* horizontal ScrollView = giống <div className="flex overflow-x-auto"> bên web */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
      >
        {users.map(user => (
          <Pressable
            key={user.id}
            onPress={() => onSelectUser(user)}
            className="items-center w-16"
          >
            <View className="relative">
              <View className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden border-2 border-indigo-100 dark:border-indigo-500/20">
                <Image
                  source={{ uri: user.avatar }}
                  className="w-full h-full"
                />
              </View>
              {user.isOnline && (
                <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#FDFDFD] dark:border-[#0c1014] rounded-full" />
              )}
            </View>
            <Text
              numberOfLines={1}
              className="text-[11px] text-gray-600 dark:text-gray-300 mt-1.5 w-16 text-center"
            >
              {user.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
