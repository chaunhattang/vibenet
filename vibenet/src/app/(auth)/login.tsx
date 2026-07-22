import React, { useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import Button from '@/components/Button';
import InputField from '@/components/InputField';
import { useAuth } from '@/hooks/useAuth';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setIsSubmitting(true);
    try {
      // TODO: replace with a real call to services/api.ts
      await login('placeholder-token');
      router.replace('/(tabs)');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={['#1e3a8a', '#0f172a']} style={{ flex: 1, height }}>
      <View className="flex-1 justify-center px-6">
        <Text className="text-white text-3xl font-bold text-center mb-8">Welcome Back</Text>
        <InputField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <InputField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button label="Log In" loading={isSubmitting} onPress={handleLogin} />
        <Link href="/(auth)/signup" className="text-white/60 text-center mt-6">
          Don't have an account? Sign up
        </Link>
      </View>
    </LinearGradient>
  );
}
