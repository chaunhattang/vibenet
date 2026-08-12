/**
 * MainTabBar — wires the existing FloatingTabBar to ActiveTabContext so
 * it drives MainTabs' local tab state instead of the navigator.
 */
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useActiveTab } from '../contexts/ActiveTabContext';
import FloatingTabBar from '../layout/FloatingTabBar';
import { RootStackParamList } from './types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function MainTabBar() {
  const navigation = useNavigation<Nav>();
  const { logout } = useAuth();
  const { activeTab, setActiveTab } = useActiveTab();

  return (
    <FloatingTabBar
      activeTab={activeTab}
      onChangeTab={setActiveTab}
      onLogout={() => {
        logout();
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      }}
    />
  );
}
