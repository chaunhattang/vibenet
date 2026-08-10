import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { MessageIcon } from '../assets/Icon';
import ChatComposer from '../components/chatScreen/ChatComposer';
import ChatDetailHeader from '../components/chatScreen/ChatDetailHeader';
import MessageBubble from '../components/chatScreen/MessageBubble';
import EmptyState from '../components/ui/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { RootStackParamList } from '../navigation/types';
import { animateNextLayout } from '../theme/motion';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ChatDetail'>;
type Route = { params: RootStackParamList['ChatDetail'] };

export default function ChatDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute() as Route;
  const { chatId } = route.params;
  const { rooms, getMessages, sendMessage } = useChat();
  const { currentUserId } = useAuth();

  const room = rooms.find(r => r.chatId === chatId);
  const messages = getMessages(chatId);

  if (!room) return null;

  const handleSend = (content: string) => {
    animateNextLayout();
    sendMessage(chatId, content);
  };

  return (
    <View className="flex-1 bg-paper-base dark:bg-ink-base">
      <ChatDetailHeader
        friendId={room.friendId}
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
            <EmptyState
              icon={<MessageIcon size={26} />}
              title="No messages yet"
              subtitle={`Say hello to ${room.friendName}!`}
            />
          ) : (
            messages.map(msg => (
              <MessageBubble
                key={msg.id}
                content={msg.content}
                isMe={msg.senderId === currentUserId}
                senderId={msg.senderId}
                avatar={msg.senderAvatar}
                sender={
                  msg.senderId !== currentUserId ? msg.senderName : undefined
                }
                timestamp={msg.timestamp}
              />
            ))
          )}
        </ScrollView>

        <ChatComposer onSend={handleSend} />
      </KeyboardAvoidingView>
    </View>
  );
}
