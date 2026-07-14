import React from 'react';
import { Text, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Button from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';

const { height } = Dimensions.get('window');

export default function ProfileScreen() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <LinearGradient colors={['#1e3a8a', '#0f172a']} style={{ flex: 1, height }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140, paddingTop: 100 }} className="px-6">
        <Text className="text-white text-3xl font-bold text-center mb-8">Profile</Text>
        <Button label="Log Out" variant="secondary" onPress={handleLogout} />
      </ScrollView>
    </LinearGradient>
  );
}
