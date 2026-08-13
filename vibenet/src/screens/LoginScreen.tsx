/**
 * Auth screen — Sign In / Register, styled directly from docs/design.md's
 * token system (bg-main / surface-white / surface-muted / text-primary /
 * accent-blue, soft card elevation, pill geometry). No brand gradient —
 * primary actions are solid dark-charcoal pills per the doc's "Primary
 * Dark" button spec.
 */
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EyeIcon, EyeOffIcon, GoogleIcon, LockIcon, MailIcon, UserIcon } from '../assets/Icon';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { PressableScale } from '../theme/motion';

// ── docs/design.md §2 — Color Palette & Palette Tokens ───────────────────────
const BG_MAIN = '#F6F6F8';
const SURFACE_WHITE = '#FFFFFF';
const SURFACE_MUTED = '#F0F0F3';
const TEXT_PRIMARY = '#0D0E11';
const TEXT_SECONDARY = '#6C727F';
const TEXT_TERTIARY = '#9CA3AF';
const ACCENT_BLUE = '#0084FF';
const STATUS_DANGER = '#FF3B30';

// docs/design.md §4 — Border Radius Tokens (card 28px, pill 9999px, medium 20px)
const RADIUS_CARD = 28;
const RADIUS_PILL = 9999;
const RADIUS_INPUT = 20;

// docs/design.md §4 — Card Soft Elevation
const SHADOW_CARD = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.04,
  shadowRadius: 20,
  elevation: 2,
};

// Memoji 15 — small brand badge, kept modest rather than a hero.
const MEMOJI_SOURCE = require('../assets/memoji/15.png');

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;
type Route = RouteProp<RootStackParamList, 'Login'>;
type AuthTab = 'login' | 'register';

const notifyOAuthUnavailable = () =>
  Alert.alert('Not available', 'Social sign-in is not yet supported in this demo.');

// ── Sub-components (defined outside LoginScreen so they aren't recreated,
// and TextInput doesn't lose focus, on every keystroke) ─────────────────────
const Field = ({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  rightSlot,
}: {
  label: string;
  icon: ReactNode;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words';
  rightSlot?: ReactNode;
}) => (
  <View style={{ gap: 6 }}>
    <Text style={{ fontSize: 12, fontWeight: '600', color: TEXT_PRIMARY, marginLeft: 4 }}>
      {label}
    </Text>
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: SURFACE_MUTED,
        borderRadius: RADIUS_INPUT,
        height: 48,
        paddingHorizontal: 14,
      }}
    >
      {icon}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={TEXT_TERTIARY}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'none'}
        textBreakStrategy="simple"
        style={{ flex: 1, fontSize: 14, fontWeight: '500', color: TEXT_PRIMARY }}
      />
      {rightSlot}
    </View>
  </View>
);

const ErrorBanner = ({ message }: { message: string }) => (
  <View
    style={{
      backgroundColor: 'rgba(255,59,48,0.08)',
      borderRadius: 14,
      padding: 12,
    }}
  >
    <Text style={{ fontSize: 13, color: STATUS_DANGER }}>{message}</Text>
  </View>
);

// Primary CTA — solid dark-charcoal pill, per design.md's "Primary Dark" button
// spec (§5.D). No gradient.
const PrimaryButton = ({
  label,
  loading,
  onPress,
}: {
  label: string;
  loading: boolean;
  onPress: () => void;
}) => (
  <PressableScale onPress={onPress} disabled={loading}>
    <View
      style={{
        height: 50,
        borderRadius: RADIUS_PILL,
        backgroundColor: TEXT_PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={SURFACE_WHITE} />
      ) : (
        <Text style={{ fontSize: 14, fontWeight: '700', color: SURFACE_WHITE }}>{label}</Text>
      )}
    </View>
  </PressableScale>
);

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>(
    route.params?.registered ? 'login' : 'login',
  );

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!loginUsername.trim() || !loginPassword) {
      setLoginError('Please enter your username and password.');
      return;
    }
    setLoginError(null);
    setLoginLoading(true);
    try {
      await login({ userName: loginUsername, password: loginPassword });
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setRegError('Please fill in all fields.');
      return;
    }
    setRegError(null);
    setRegLoading(true);
    try {
      await register({ userName: regName, email: regEmail, password: regPassword });
      navigation.reset({ index: 0, routes: [{ name: 'SetupProfile' }] });
    } catch (err) {
      setRegError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG_MAIN }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ paddingTop: insets.top }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Brand ─────────────────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, marginBottom: 24 }}>
          <Image
            source={MEMOJI_SOURCE}
            style={{ width: 44, height: 44, borderRadius: 22 }}
            resizeMode="cover"
          />
          <View>
            <Text style={{ fontSize: 22, fontWeight: '700', letterSpacing: -0.3, color: TEXT_PRIMARY }}>
              Vibenet
            </Text>
            <Text style={{ fontSize: 13, color: TEXT_SECONDARY, marginTop: 1 }}>
              {activeTab === 'login' ? 'Sign in to keep up with your people.' : 'Create your account.'}
            </Text>
          </View>
        </View>

        {/* ── Auth card (surface-white, radius-card, shadow-card) ─────────── */}
        <View
          style={{
            backgroundColor: SURFACE_WHITE,
            borderRadius: RADIUS_CARD,
            padding: 20,
            ...SHADOW_CARD,
          }}
        >
          {/* ── Segmented switcher (surface-muted track, white active pill) ── */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: SURFACE_MUTED,
              borderRadius: RADIUS_PILL,
              padding: 4,
              marginBottom: 20,
            }}
          >
            {(['login', 'register'] as AuthTab[]).map(tab => {
              const active = activeTab === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    height: 38,
                    borderRadius: RADIUS_PILL,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: active ? SURFACE_WHITE : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: active ? TEXT_PRIMARY : TEXT_SECONDARY,
                    }}
                  >
                    {tab === 'login' ? 'Sign In' : 'Register'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* ── SIGN IN FORM ────────────────────────────────────────────── */}
          {activeTab === 'login' && (
            <View style={{ gap: 16 }}>
              {loginError && <ErrorBanner message={loginError} />}

              <Field
                label="Username"
                icon={<UserIcon size={18} color={TEXT_TERTIARY} />}
                value={loginUsername}
                onChangeText={setLoginUsername}
                placeholder="alex@vibenet.app"
                autoCapitalize="none"
              />

              <Field
                label="Password"
                icon={<LockIcon size={18} color={TEXT_TERTIARY} />}
                value={loginPassword}
                onChangeText={setLoginPassword}
                placeholder="••••••••"
                secureTextEntry={!showLoginPw}
                rightSlot={
                  <Pressable onPress={() => setShowLoginPw(v => !v)} hitSlop={8}>
                    {showLoginPw ? (
                      <EyeOffIcon size={18} color={TEXT_TERTIARY} />
                    ) : (
                      <EyeIcon size={18} color={TEXT_TERTIARY} />
                    )}
                  </Pressable>
                }
              />

              <Pressable onPress={notifyOAuthUnavailable} style={{ alignSelf: 'flex-end' }} hitSlop={8}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: ACCENT_BLUE }}>
                  Forgot password?
                </Text>
              </Pressable>

              <PrimaryButton
                label={loginLoading ? 'Please wait…' : 'Sign In'}
                loading={loginLoading}
                onPress={handleLogin}
              />

              <Text style={{ textAlign: 'center', fontSize: 11, color: TEXT_TERTIARY }}>
                Demo: username <Text style={{ fontWeight: '700', color: TEXT_SECONDARY }}>me</Text>
                {' / password '}
                <Text style={{ fontWeight: '700', color: TEXT_SECONDARY }}>123456</Text>
              </Text>
            </View>
          )}

          {/* ── REGISTER FORM ───────────────────────────────────────────── */}
          {activeTab === 'register' && (
            <View style={{ gap: 16 }}>
              {regError && <ErrorBanner message={regError} />}

              <Field
                label="Full Name"
                icon={<UserIcon size={18} color={TEXT_TERTIARY} />}
                value={regName}
                onChangeText={setRegName}
                placeholder="Alex Morgan"
                autoCapitalize="words"
              />

              <Field
                label="Email Address"
                icon={<MailIcon size={18} color={TEXT_TERTIARY} />}
                value={regEmail}
                onChangeText={setRegEmail}
                placeholder="alex@vibenet.app"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Field
                label="Create Password"
                icon={<LockIcon size={18} color={TEXT_TERTIARY} />}
                value={regPassword}
                onChangeText={setRegPassword}
                placeholder="Min. 8 characters"
                secureTextEntry={!showRegPw}
                rightSlot={
                  <Pressable onPress={() => setShowRegPw(v => !v)} hitSlop={8}>
                    {showRegPw ? (
                      <EyeOffIcon size={18} color={TEXT_TERTIARY} />
                    ) : (
                      <EyeIcon size={18} color={TEXT_TERTIARY} />
                    )}
                  </Pressable>
                }
              />

              <Text style={{ fontSize: 11, color: TEXT_SECONDARY, textAlign: 'center' }}>
                By registering you agree to our{' '}
                <Text style={{ fontWeight: '700', color: TEXT_PRIMARY }}>Terms & Privacy</Text>
              </Text>

              <PrimaryButton
                label={regLoading ? 'Please wait…' : 'Create Account'}
                loading={regLoading}
                onPress={handleRegister}
              />
            </View>
          )}

          {/* ── Social sign-in ──────────────────────────────────────────── */}
          <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: SURFACE_MUTED }} />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  color: TEXT_TERTIARY,
                }}
              >
                Or continue with
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: SURFACE_MUTED }} />
            </View>

            <PressableScale onPress={notifyOAuthUnavailable}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  height: 48,
                  borderRadius: RADIUS_INPUT,
                  backgroundColor: SURFACE_MUTED,
                }}
              >
                <GoogleIcon size={18} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: TEXT_PRIMARY }}>
                  Continue with Google
                </Text>
              </View>
            </PressableScale>
          </View>
        </View>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <Text style={{ textAlign: 'center', fontSize: 12, color: TEXT_SECONDARY, marginTop: 20 }}>
          By signing up, you agree to Vibenet's{' '}
          <Text style={{ fontWeight: '700', color: TEXT_PRIMARY }}>Community Guidelines</Text>.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
