import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from '../contexts/AuthContext';
import { ChatProvider } from '../contexts/ChatContext';
import { FriendsProvider } from '../contexts/FriendsContext';
import { PostsProvider } from '../contexts/PostsContext';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import MessagesListScreen from '../screens/MessagesListScreen';
import NewsfeedScreen from '../screens/NewsfeedScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import OtherProfileScreen from '../screens/OtherProfileScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SetupProfileScreen from '../screens/SetupProfileScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <AuthProvider>
      <FriendsProvider>
        <PostsProvider>
          <ChatProvider>
            <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Home" component={NewsfeedScreen} />
              <Stack.Screen name="MessagesList" component={MessagesListScreen} />
              <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="OtherProfile" component={OtherProfileScreen} />
              <Stack.Screen name="SetupProfile" component={SetupProfileScreen} />
            </Stack.Navigator>
          </ChatProvider>
        </PostsProvider>
      </FriendsProvider>
    </AuthProvider>
  );
}
