import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import ChatComposer from '../components/chatScreen/ChatComposer';
import ChatDetailHeader from '../components/chatScreen/ChatDetailHeader';
import MessageBubble from '../components/chatScreen/MessageBubble';
import { CURRENT_USER_ID } from '../constants';
import { useChat } from '../contexts/ChatContext';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ChatDetail'>;
type Route = { params: RootStackParamList['ChatDetail'] };

export default function ChatDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute() as Route;
  const { chatId } = route.params;
  const { rooms, getMessages, sendMessage } = useChat();

  const room = rooms.find(r => r.chatId === chatId);
  const messages = getMessages(chatId);

  if (!room) return null;

  return (
    <View className="flex-1 bg-white dark:bg-[#0a0a0a]">
      <ChatDetailHeader
        friendName={room.friendName}
        friendAvatar={room.friendAvatar}
        friendIsOnline={room.friendIsOnline}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View className="py-12 items-center">
              <Text className="text-sm text-gray-500 dark:text-gray-600 text-center">
                No messages yet. Say hello to {room.friendName}!
              </Text>
            </View>
          ) : (
            messages.map(msg => (
              <MessageBubble
                key={msg.id}
                content={msg.content}
                isMe={msg.senderId === CURRENT_USER_ID}
                avatar={msg.senderAvatar}
                sender={
                  msg.senderId !== CURRENT_USER_ID ? msg.senderName : undefined
                }
                timestamp={msg.timestamp}
              />
            ))
          )}
        </ScrollView>

        <ChatComposer onSend={content => sendMessage(chatId, content)} />
      </KeyboardAvoidingView>
    </View>
  );
}
