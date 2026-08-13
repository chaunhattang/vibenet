import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActiveTabProvider } from '../contexts/ActiveTabContext';
import { AuthProvider } from '../contexts/AuthContext';
import { ChatProvider } from '../contexts/ChatContext';
import { FriendsProvider } from '../contexts/FriendsContext';
import { LocketProvider } from '../contexts/LocketContext';
import { LikedProvider } from '../contexts/LikedContext';
import { NotificationsProvider } from '../contexts/NotificationsContext';
import { PostsProvider } from '../contexts/PostsContext';
import { SavedProvider } from '../contexts/SavedContext';
import { StoriesProvider } from '../contexts/StoriesContext';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import CloseFriendsScreen from '../screens/CloseFriendsScreen';
import LocketCaptureScreen from '../screens/LocketCaptureScreen';
import LocketComposeScreen from '../screens/LocketComposeScreen';
import LocketFeedScreen from '../screens/LocketFeedScreen';
import LoginScreen from '../screens/LoginScreen';
import MessagesListScreen from '../screens/MessagesListScreen';
import MomentViewersScreen from '../screens/MomentViewersScreen';
import OtherProfileScreen from '../screens/OtherProfileScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MainTabs from './MainTabs';
import SentMomentsScreen from '../screens/SentMomentsScreen';
import SetupProfileScreen from '../screens/SetupProfileScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <AuthProvider>
      <FriendsProvider>
        <LocketProvider>
          <PostsProvider>
            <StoriesProvider>
            <SavedProvider>
            <LikedProvider>
            <NotificationsProvider>
            <ChatProvider>
            <ActiveTabProvider>
              <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                  headerShown: false,
                  animation: 'fade',
                  animationDuration: 180,
                  freezeOnBlur: true,
                }}
              >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen name="MessagesList" component={MessagesListScreen} />
                <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
                <Stack.Screen name="OtherProfile" component={OtherProfileScreen} />
                <Stack.Screen name="SetupProfile" component={SetupProfileScreen} />
                <Stack.Screen name="CloseFriends" component={CloseFriendsScreen} />
                <Stack.Screen name="LocketFeed" component={LocketFeedScreen} />
                <Stack.Screen name="SentMoments" component={SentMomentsScreen} />
                <Stack.Screen name="MomentViewers" component={MomentViewersScreen} />
                <Stack.Screen name="LocketCapture" component={LocketCaptureScreen} />
                <Stack.Screen name="LocketCompose" component={LocketComposeScreen} />
              </Stack.Navigator>
            </ActiveTabProvider>
            </ChatProvider>
            </NotificationsProvider>
            </LikedProvider>
            </SavedProvider>
            </StoriesProvider>
          </PostsProvider>
        </LocketProvider>
      </FriendsProvider>
    </AuthProvider>
  );
}
