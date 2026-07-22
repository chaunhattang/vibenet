import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatProvider } from '../contexts/ChatContext';
import { PostsProvider } from '../contexts/PostsContext';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import MessagesListScreen from '../screens/MessagesListScreen';
import NewsfeedScreen from '../screens/NewsfeedScreen';
import OtherProfileScreen from '../screens/OtherProfileScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SetupProfileScreen from '../screens/SetupProfileScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <PostsProvider>
      <ChatProvider>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={NewsfeedScreen} />
          <Stack.Screen name="MessagesList" component={MessagesListScreen} />
          <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="OtherProfile" component={OtherProfileScreen} />
          <Stack.Screen name="SetupProfile" component={SetupProfileScreen} />
        </Stack.Navigator>
      </ChatProvider>
    </PostsProvider>
  );
}
