import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Dùng ở mọi nơi có avatar (post, comment, chat, notification...) để bấm vào là
// nhảy sang đúng trang Profile của người đó — Profile của mình nếu là chính mình,
// OtherProfile nếu là người khác.
export function useGoToProfile() {
  const navigation = useNavigation<Nav>();
  const { currentUserId } = useAuth();

  return (userId: string) => {
    if (userId === currentUserId) {
      navigation.navigate('Profile');
    } else {
      navigation.push('OtherProfile', { userId });
    }
  };
}
