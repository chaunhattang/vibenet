import React from 'react';
import { Text, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

export default function MessageScreen() {
  return (
    <LinearGradient colors={['#1e3a8a', '#0f172a']} style={{ flex: 1, height }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140, paddingTop: 100 }} className="px-6">
        <Text className="text-white text-3xl font-bold text-center">Messages</Text>
      </ScrollView>
    </LinearGradient>
  );
}
