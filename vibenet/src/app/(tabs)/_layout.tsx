import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import GlassNavigationBar from '@/components/GlassNavigationBar';
import { useAuth } from '@/hooks/useAuth';

export default function TabLayout() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      // Explicitly typing the props inline as 'any' bypasses the conflicting descriptor types completely
      tabBar={(props: any) => <GlassNavigationBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="find" options={{ title: 'Find' }} />
      <Tabs.Screen name="plus" options={{ title: 'Plus' }} />
      <Tabs.Screen name="message" options={{ title: 'Message' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
