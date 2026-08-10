import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatRoomRow from '../components/chatScreen/ChatRoomRow';
import FloatingTabBar from '../layout/FloatingTabBar';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { useFriends } from '../contexts/FriendsContext';
import { mockOnlineUsers } from '../data/mockData';
import { RootStackParamList } from '../navigation/types';
import { PLACEHOLDER } from '../theme/colors';
import OnlineUsers from '../layout/OnlineUsers';

type Nav = NativeStackNavigationProp<RootStackParamList, 'MessagesList'>;

export default function MessagesListScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { rooms, getOrCreateRoomByFriend } = useChat();
  const { logout } = useAuth();
  const { getFriendStatus } = useFriends();
  const [search, setSearch] = useState('');

  const filteredRooms = useMemo(
    () =>
      rooms.filter(room =>
        room.friendName.toLowerCase().includes(search.toLowerCase()),
      ),
    [rooms, search],
  );

  // "Online Now" chỉ hiện bạn bè thật sự (đã FRIENDS) đang online, không hiện người lạ
  const onlineFriends = mockOnlineUsers.filter(
    u => u.isOnline && getFriendStatus(u.id) === 'FRIENDS',
  );

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="flex-1 bg-paper-base dark:bg-ink-base"
    >
      <View className="px-5 pt-4">
        <Text className="text-title text-content-strong dark:text-content-strong-dark mb-4">
          Vibenet
        </Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search for a soul..."
          placeholderTextColor={PLACEHOLDER}
          textBreakStrategy="simple"
          className="bg-paper-raised dark:bg-ink-input text-content-strong dark:text-content-strong-dark rounded-field px-4 py-2.5 text-sm"
        />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Sau này có be thì đổi mockOnlineUsers thành kết quả getOnlineUsers() (đã fetch) */}
        <OnlineUsers
          users={onlineFriends}
          onSelectUser={user =>
            navigation.navigate('ChatDetail', {
              chatId: getOrCreateRoomByFriend(user),
            })
          }
        />

        <Text className="text-xs font-semibold text-content-faint dark:text-content-faint-dark uppercase tracking-wider px-5 mb-2">
          Active Whispers
        </Text>

        <View className="px-3" style={{ gap: 4 }}>
          {filteredRooms.length === 0 ? (
            <Text className="text-center py-8 text-content-muted dark:text-content-muted-dark text-sm">
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
        activeTab={null}
        onChangeTab={tab => {
          if (tab === 'home') navigation.navigate('Home');
          else if (tab === 'explore') navigation.navigate('Home');
          else if (tab === 'notifications')
            navigation.navigate('Notifications');
          else if (tab === 'profile') navigation.navigate('Profile');
        }}
        onLogout={() => {
          logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }}
      />
    </View>
  );
}
