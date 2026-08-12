import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useActiveTab } from '../contexts/ActiveTabContext';
import { TabKey } from '../layout/FloatingTabBar';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Jumps to a tab inside MainTabs from anywhere in the app — sets the active
// tab (instant, no remount) and brings MainTabs to the front of the stack.
export function useGoToTab() {
  const navigation = useNavigation<Nav>();
  const { setActiveTab } = useActiveTab();

  return (tab: TabKey) => {
    setActiveTab(tab);
    navigation.navigate('MainTabs');
  };
}
