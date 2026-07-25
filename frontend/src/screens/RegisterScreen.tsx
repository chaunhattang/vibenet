import { useNavigation } from '@react-navigation/native';
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
  ClockIcon,
  EyeIcon,
  EyeOffIcon,
  GithubIcon,
  GoogleIcon,
  LockIcon,
  MailIcon,
  UserIcon,
} from '../assets/Icon';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const TTL_OPTIONS = [1, 6, 12, 24];

const notifyOAuthUnavailable = () =>
  Alert.alert('Chưa hỗ trợ', 'Đăng ký bằng mạng xã hội chưa được hỗ trợ trong bản demo này.');

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [ttlHours, setTtlHours] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!displayName.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // ttlHours chưa có chỗ lưu ở backend giả, giữ lại state để dùng khi có be thật
      await register({ userName: displayName, email, password });
      navigation.navigate('Login', { registered: true });
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
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">Join Vibenet</Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">
            Sign up to share the fleeting thoughts of the night.
          </Text>
        </View>

        <View className="flex-row gap-4">
          <Pressable
            onPress={notifyOAuthUnavailable}
            className="flex-1 flex-row items-center justify-center gap-2 py-3.5 bg-white dark:bg-transparent border border-gray-300 dark:border-white/10 rounded-lg"
          >
            <GoogleIcon size={18} />
            <Text className="text-gray-700 dark:text-gray-300 font-medium">Google</Text>
          </Pressable>
          <Pressable
            onPress={notifyOAuthUnavailable}
            className="flex-1 flex-row items-center justify-center gap-2 py-3.5 bg-white dark:bg-transparent border border-gray-300 dark:border-white/10 rounded-lg"
          >
            <GithubIcon size={18} color="#111827" />
            <Text className="text-gray-700 dark:text-gray-300 font-medium">GitHub</Text>
          </Pressable>
        </View>

        <View className="flex-row items-center gap-3">
          <View className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
          <Text className="text-xs text-gray-400 uppercase tracking-wider">
            Or continue with email
          </Text>
          <View className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
        </View>

        {error && (
          <View className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
            <Text className="text-sm text-red-700 dark:text-red-400">{error}</Text>
          </View>
        )}

        <Field label="Display Name">
          <View className="flex-row items-center border border-gray-300 dark:border-white/10 rounded-lg px-4">
            <UserIcon size={18} />
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="e.g. MidnightWalker"
              placeholderTextColor="#9CA3AF"
              textBreakStrategy="simple"
              className="flex-1 py-3 ml-3 text-gray-900 dark:text-white"
            />
          </View>
        </Field>

        <Field label="Email Address">
          <View className="flex-row items-center border border-gray-300 dark:border-white/10 rounded-lg px-4">
            <MailIcon size={18} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              textBreakStrategy="simple"
              className="flex-1 py-3 ml-3 text-gray-900 dark:text-white"
            />
          </View>
        </Field>

        <Field label="Password">
          <View className="flex-row items-center border border-gray-300 dark:border-white/10 rounded-lg px-4">
            <LockIcon size={18} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              textBreakStrategy="simple"
              className="flex-1 py-3 ml-3 text-gray-900 dark:text-white"
            />
            <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={8}>
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </Pressable>
          </View>
        </Field>

        <View>
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center gap-2">
              <ClockIcon size={18} color="#6366F1" />
              <Text className="text-sm font-semibold text-gray-900 dark:text-white">
                Soul Sync TTL
              </Text>
            </View>
            <Text className="text-sm font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full">
              {ttlHours} Hours
            </Text>
          </View>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            How long your posts survive before fading away forever.
          </Text>
          <View className="flex-row gap-2">
            {TTL_OPTIONS.map(hours => (
              <Pressable
                key={hours}
                onPress={() => setTtlHours(hours)}
                className={`flex-1 py-2.5 rounded-full border items-center ${
                  ttlHours === hours
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-gray-300 dark:border-white/10'
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    ttlHours === hours ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {hours}h
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          className="bg-slate-900 rounded-xl py-3.5 items-center flex-row justify-center gap-2 disabled:opacity-60"
        >
          {loading && <ActivityIndicator size="small" color="#FFFFFF" />}
          <Text className="text-white font-semibold text-base">
            {loading ? 'Creating account…' : 'Vibe In'}
          </Text>
        </Pressable>

        <View className="flex-row justify-center">
          <Text className="text-gray-600 dark:text-gray-400">Already have an account? </Text>
          <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
            <Text className="text-indigo-600 font-semibold">Log in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{label}</Text>
      {children}
    </View>
  );
}
