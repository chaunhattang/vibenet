import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  GithubIcon,
  GoogleIcon,
  LockIcon,
  UserIcon,
} from '../assets/Icon';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;
type Route = RouteProp<RootStackParamList, 'Login'>;

const notifyOAuthUnavailable = () =>
  Alert.alert('Chưa hỗ trợ', 'Đăng nhập bằng mạng xã hội chưa được hỗ trợ trong bản demo này.');

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const isNewUser = route.params?.registered === true;
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!username.trim() || !password) {
      setError('Please enter your username and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login({ userName: username, password });
      navigation.reset({
        index: 0,
        routes: [{ name: isNewUser ? 'SetupProfile' : 'Home' }],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ paddingTop: insets.top }}
        contentContainerStyle={{ padding: 24, paddingBottom: 40, gap: 20 }}
        keyboardShouldPersistTaps="handled"
        className="flex-1 bg-white dark:bg-[#0a0a0a]"
      >
        <View className="mt-4">
          <View className="flex-row items-center gap-2">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back
            </Text>
            <Text className="text-2xl">👻</Text>
          </View>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            Continue your session in the mist.
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            Demo account: me / 123456
          </Text>
        </View>

        {error && (
          <View className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 flex-row items-center gap-3">
            <Text className="text-sm text-red-700 dark:text-red-400 flex-1">{error}</Text>
          </View>
        )}

        <Field label="Username">
          <View className="flex-row items-center border border-gray-300 dark:border-white/10 rounded-xl px-4">
            <UserIcon size={18} />
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              textBreakStrategy="simple"
              className="flex-1 py-3.5 ml-3 text-gray-900 dark:text-white"
            />
          </View>
        </Field>

        <Field label="Password">
          <View className="flex-row items-center border border-gray-300 dark:border-white/10 rounded-xl px-4">
            <LockIcon size={18} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              textBreakStrategy="simple"
              className="flex-1 py-3.5 ml-3 text-gray-900 dark:text-white"
            />
            <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={8}>
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </Pressable>
          </View>
        </Field>

        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => setRememberMe(v => !v)}
            className="flex-row items-center gap-2"
            hitSlop={8}
          >
            <View
              className={`w-5 h-5 rounded-md border items-center justify-center ${
                rememberMe
                  ? 'bg-slate-900 border-slate-900'
                  : 'border-gray-300 dark:border-white/20'
              }`}
            >
              {rememberMe && <CheckIcon size={14} color="#FFFFFF" />}
            </View>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Remember for a while
            </Text>
          </Pressable>
          <Pressable onPress={notifyOAuthUnavailable} hitSlop={8}>
            <Text className="text-sm text-indigo-600 font-medium">Forgot password?</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          className="bg-slate-900 rounded-xl py-3.5 items-center flex-row justify-center gap-2 disabled:opacity-60"
        >
          {loading && <ActivityIndicator size="small" color="#FFFFFF" />}
          <Text className="text-white font-semibold text-base">
            {loading ? 'Signing in…' : 'Sign In'}
          </Text>
        </Pressable>

        <View className="flex-row items-center gap-3">
          <View className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
          <Text className="text-xs text-gray-400 uppercase tracking-wider">Or sign in with</Text>
          <View className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
        </View>

        <View className="flex-row gap-4">
          <Pressable
            onPress={notifyOAuthUnavailable}
            className="flex-1 flex-row items-center justify-center gap-2 py-3.5 bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 rounded-xl"
          >
            <GithubIcon size={18} color="#111827" />
            <Text className="text-gray-700 dark:text-gray-300 font-medium">Github</Text>
          </Pressable>
          <Pressable
            onPress={notifyOAuthUnavailable}
            className="flex-1 flex-row items-center justify-center gap-2 py-3.5 bg-white dark:bg-transparent border border-gray-200 dark:border-white/10 rounded-xl"
          >
            <GoogleIcon size={18} />
            <Text className="text-gray-700 dark:text-gray-300 font-medium">Google</Text>
          </Pressable>
        </View>

        <View className="flex-row justify-center mt-4">
          <Text className="text-gray-600 dark:text-gray-400">New to Fade? </Text>
          <Pressable onPress={() => navigation.navigate('Register')} hitSlop={8}>
            <Text className="text-indigo-600 font-semibold">Create an account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</Text>
      {children}
    </View>
  );
}
