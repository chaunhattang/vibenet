import React from 'react';
import { View, Text } from 'react-native';
import { Link, Stack } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center bg-slate-900 px-6">
        <Text className="text-white text-xl font-bold mb-4">This screen doesn't exist.</Text>
        <Link href="/" className="text-blue-400">
          Go to home screen
        </Link>
      </View>
    </>
  );
}
