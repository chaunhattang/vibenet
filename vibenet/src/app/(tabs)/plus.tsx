import React from 'react';
import { Text, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

export default function PlusScreen() {
  return (
    <LinearGradient colors={['#1e3a8a', '#0f172a']} style={{ flex: 1, height }}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-white text-3xl font-bold text-center">Capture a Moment</Text>
        <Text className="text-white/60 text-base mt-3 text-center">
          Camera/upload UI goes here.
        </Text>
      </View>
    </LinearGradient>
  );
}
