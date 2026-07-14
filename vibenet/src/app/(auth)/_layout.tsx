import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function AuthLayout() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (token) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
