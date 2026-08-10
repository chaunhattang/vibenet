/**
 * RegisterScreen — thin redirect wrapper.
 * The full registration form now lives inside LoginScreen as the "Register" tab
 * of the unified glassmorphic auth card. This screen simply navigates there so
 * any external link / deep link to "Register" still works.
 */
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { View } from 'react-native';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    // Replace so the back-stack doesn't include this intermediate screen.
    navigation.replace('Login');
  }, [navigation]);

  return <View style={{ flex: 1, backgroundColor: '#F6F6F8' }} />;
}
