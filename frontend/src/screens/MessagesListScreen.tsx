import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import ChatRoomRow from '../components/chatScreen/ChatRoomRow';
import FloatingTabBar from '../layout/FloatingTabBar';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { mockOnlineUsers } from '../data/mockData';
import { RootStackParamList } from '../navigation/types';
import OnlineUsers from '../layout/OnlineUsers';

type Nav = NativeStackNavigationProp<RootStackParamList, 'MessagesList'>;

export default function MessagesListScreen() {
  const navigation = useNavigation<Nav>();
  const { rooms } = useChat();
  const { logout } = useAuth();
  const [search, setSearch] = useState('');

  const filteredRooms = useMemo(
    () =>
      rooms.filter(room =>
        room.friendName.toLowerCase().includes(search.toLowerCase()),
      ),
    [rooms, search],
  );

  return (
    <View className="flex-1 bg-white dark:bg-[#0a0a0a] mt-10">
      <View className="px-4 pt-4">
        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Fade
        </Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search for a soul..."
          placeholderTextColor="#9CA3AF"
          textBreakStrategy="simple"
          className="bg-gray-100 dark:bg-[#171717] text-gray-900 dark:text-gray-300 rounded-xl px-4 py-2.5 text-sm"
        />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Sau này có be thì đổi mockOnlineUsers thành kết quả getOnlineUsers() (đã fetch) */}
        <OnlineUsers users={mockOnlineUsers} onSelectUser={() => {}} />

        <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
          Active Whispers
        </Text>

        <View className="px-2" style={{ gap: 4 }}>
          {filteredRooms.length === 0 ? (
            <Text className="text-center py-8 text-gray-500 text-sm">
              {rooms.length === 0
                ? 'Add friends to start whispering...'
                : 'No results found.'}
            </Text>
          ) : (
            filteredRooms.map(room => (
              <ChatRoomRow
                key={room.chatId}
                room={room}
                isSelected={false}
                onPress={() =>
                  navigation.navigate('ChatDetail', { chatId: room.chatId })
                }
              />
            ))
          )}
        </View>
      </ScrollView>

      <FloatingTabBar
        activeTab="messages"
        onChangeTab={tab => {
          if (tab === 'home') navigation.navigate('Home');
          else if (tab === 'profile') navigation.navigate('Profile');
        }}
        onPressCreate={() => navigation.navigate('Home')}
        onLogout={() => {
          logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }}
      />
    </View>
  );
}
