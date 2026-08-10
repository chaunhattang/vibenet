/**
 * Auth screen — Glassmorphic "Babagang" design system applied to Vibenet.
 * Hosts both Sign In and Register forms in a single screen with a segmented
 * tab switcher, atmospheric image background, frosted-glass card, and
 * memoji brand badge.
 */
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../navigation/types';
import { C } from '../theme/colors';

// ── Icons (inline SVG via react-native-svg) ──────────────────────────────────
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

function IconUser({ color = '#9CA3AF' }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconLock({ color = '#9CA3AF' }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconMail({ color = '#9CA3AF' }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="22,6 12,13 2,6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconEye({ color = '#9CA3AF', off = false }: { color?: string; off?: boolean }) {
  if (off) {
    return (
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Line x1="1" y1="1" x2="23" y2="23" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconArrow({ color = '#fff' }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="12 5 19 12 12 19" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconGoogle() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </Svg>
  );
}
function IconApple({ color = '#0D0E11' }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill={color}>
      <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.68-.83 1.14-1.98.99-3.14-.98.04-2.19.65-2.88 1.47-.61.71-1.15 1.88-.98 3.02 1.1.08 2.23-.51 2.87-1.35z" />
    </Svg>
  );
}

// ── Design tokens (matching design.md / mockDashboard) ────────────────────────
const GLASS_DARK = 'rgba(20, 20, 22, 0.70)';
const GLASS_LIGHT = 'rgba(255, 255, 255, 0.68)';
const GLASS_BORDER = 'rgba(255, 255, 255, 0.60)';
const BG_MAIN = '#F6F6F8';
const TEXT_PRIMARY = '#0D0E11';
const TEXT_SECONDARY = '#6C727F';
const TEXT_TERTIARY = '#9CA3AF';
const TEXT_ON_DARK = '#FFFFFF';
const ACCENT_BLUE = '#0084FF';
const SURFACE_MUTED = '#F0F0F3';
const SURFACE_WHITE = '#FFFFFF';

// Randomly pick one of the real memoji PNGs bundled in the project.
// Memoji 15 is a vibrant, fun character — great for a social app branding badge.
const MEMOJI_SOURCE = require('../assets/memoji/15.png');

// Atmospheric background photo (same Unsplash gradient from the mock HTML)
const BG_IMAGE_URI =
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;
type Route = RouteProp<RootStackParamList, 'Login'>;
type AuthTab = 'login' | 'register';

const { height: SCREEN_H } = Dimensions.get('window');
const TTL_OPTIONS = [1, 6, 12, 24];

const notifyOAuthUnavailable = () =>
  Alert.alert('Not available', 'Social sign-in is not yet supported in this demo.');

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<AuthTab>(
    route.params?.registered ? 'login' : 'login',
  );

  // ── Login form ─────────────────────────────────────────────────────────────
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // ── Register form ──────────────────────────────────────────────────────────
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);
  const [regTtl, setRegTtl] = useState(12);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // ── Animated scale for submit buttons ─────────────────────────────────────
  const submitScale = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.spring(submitScale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const pressOut = () =>
    Animated.spring(submitScale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  // ── Animated sliding thumb for the Sign In / Register segmented switcher ───
  const [switcherWidth, setSwitcherWidth] = useState(0);
  const thumbAnim = useRef(new Animated.Value(activeTab === 'register' ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(thumbAnim, {
      toValue: activeTab === 'register' ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  }, [activeTab, thumbAnim]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!loginUsername.trim() || !loginPassword) {
      setLoginError('Please enter your username and password.');
      return;
    }
    setLoginError(null);
    setLoginLoading(true);
    try {
      await login({ userName: loginUsername, password: loginPassword });
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
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

  // ── Sub-components ─────────────────────────────────────────────────────────
  const InputField = ({
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
    icon: React.ReactNode;
    value: string;
    onChangeText: (t: string) => void;
    placeholder: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address';
    autoCapitalize?: 'none' | 'words';
    rightSlot?: React.ReactNode;
  }) => (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: TEXT_PRIMARY, marginLeft: 4 }}>
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: SURFACE_MUTED,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.04)',
          height: 48,
          paddingHorizontal: 14,
          gap: 10,
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
          style={{
            flex: 1,
            fontSize: 14,
            fontWeight: '500',
            color: TEXT_PRIMARY,
          }}
        />
        {rightSlot}
      </View>
    </View>
  );

  const EyeToggle = ({ show, onPress }: { show: boolean; onPress: () => void }) => (
    <Pressable onPress={onPress} hitSlop={8}>
      <IconEye color={TEXT_TERTIARY} off={!show} />
    </Pressable>
  );

  const SsoButton = ({
    icon,
    label,
  }: {
    icon: React.ReactNode;
    label: string;
  }) => (
    <Pressable
      onPress={notifyOAuthUnavailable}
      style={({ pressed }) => ({
        flex: 1,
        height: 44,
        backgroundColor: pressed ? SURFACE_MUTED : SURFACE_WHITE,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      })}
    >
      {icon}
      <Text style={{ fontSize: 13, fontWeight: '600', color: TEXT_PRIMARY }}>{label}</Text>
    </Pressable>
  );

  const SubmitButton = ({
    label,
    loading,
    onPress,
  }: {
    label: string;
    loading: boolean;
    onPress: () => void;
  }) => (
    <Animated.View style={{ transform: [{ scale: submitScale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={loading}
        style={{
          height: 50,
          borderRadius: 9999,
          backgroundColor: loading ? '#4A4A52' : TEXT_PRIMARY,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 6,
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '600', color: TEXT_ON_DARK }}>
          {loading ? 'Please wait…' : label}
        </Text>
        {!loading && <IconArrow color={TEXT_ON_DARK} />}
      </Pressable>
    </Animated.View>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Atmospheric image fills the top ~45% */}
      <View style={{ flex: 1, backgroundColor: BG_MAIN }}>
        <ImageBackground
          source={{ uri: BG_IMAGE_URI }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: SCREEN_H * 0.46,
          }}
          resizeMode="cover"
        >
          {/* Dark-to-transparent gradient overlay */}
          <View
            style={{
              ...{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
              backgroundColor: 'rgba(13, 14, 17, 0.28)',
            }}
          />
          {/* Light fade at the bottom of the image into BG_MAIN */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 120,
              backgroundColor: BG_MAIN,
              opacity: 0.95,
            }}
          />
        </ImageBackground>

        <ScrollView
          style={{ paddingTop: insets.top }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48, gap: 0 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Brand Header ──────────────────────────────────────────────── */}
          <View style={{ alignItems: 'center', marginTop: 28, marginBottom: 24 }}>
            {/* Memoji badge — dark glass pill */}
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 9999,
                backgroundColor: GLASS_DARK,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.25)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.18,
                shadowRadius: 16,
                elevation: 8,
                overflow: 'hidden',
              }}
            >
              <Image
                source={MEMOJI_SOURCE}
                style={{ width: 64, height: 64 }}
                resizeMode="contain"
              />
            </View>
            <Text
              style={{
                fontSize: 28,
                fontWeight: '700',
                letterSpacing: -0.5,
                color: TEXT_ON_DARK,
                textShadowColor: 'rgba(0,0,0,0.22)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 8,
              }}
            >
              Vibenet
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.85)',
                fontWeight: '500',
                marginTop: 4,
              }}
            >
              Where your vibe finds its tribe ✨
            </Text>
          </View>

          {/* ── Glass Auth Card ───────────────────────────────────────────── */}
          <View
            style={{
              backgroundColor: GLASS_LIGHT,
              borderRadius: 28,
              borderWidth: 1,
              borderColor: GLASS_BORDER,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.08,
              shadowRadius: 32,
              elevation: 6,
            }}
          >
            {/* ── Segmented Tab Switcher (animated sliding thumb) ─────────── */}
            <View
              onLayout={e => setSwitcherWidth(e.nativeEvent.layout.width)}
              style={{
                backgroundColor: SURFACE_MUTED,
                borderRadius: 9999,
                padding: 4,
                flexDirection: 'row',
                marginBottom: 24,
                position: 'relative',
              }}
            >
              {switcherWidth > 0 && (
                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 4,
                    bottom: 4,
                    left: 4,
                    width: (switcherWidth - 8) / 2,
                    borderRadius: 9999,
                    backgroundColor: SURFACE_WHITE,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 2,
                    transform: [
                      {
                        translateX: thumbAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, (switcherWidth - 8) / 2],
                        }),
                      },
                    ],
                  }}
                />
              )}
              {(['login', 'register'] as AuthTab[]).map(tab => {
                const active = activeTab === tab;
                return (
                  <Pressable
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={{
                      flex: 1,
                      height: 38,
                      borderRadius: 9999,
                      alignItems: 'center',
                      justifyContent: 'center',
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

            {/* ── SIGN IN FORM ─────────────────────────────────────────── */}
            {activeTab === 'login' && (
              <View style={{ gap: 16 }}>
                {loginError && (
                  <View
                    style={{
                      backgroundColor: 'rgba(255,59,48,0.1)',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: 'rgba(255,59,48,0.3)',
                      padding: 12,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: C.danger }}>{loginError}</Text>
                  </View>
                )}

                <InputField
                  label="Username"
                  icon={<IconUser />}
                  value={loginUsername}
                  onChangeText={setLoginUsername}
                  placeholder="alex@vibenet.app"
                  autoCapitalize="none"
                />

                <InputField
                  label="Password"
                  icon={<IconLock />}
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showLoginPw}
                  rightSlot={
                    <EyeToggle show={showLoginPw} onPress={() => setShowLoginPw(v => !v)} />
                  }
                />

                <Pressable
                  onPress={notifyOAuthUnavailable}
                  style={{ alignSelf: 'flex-end', marginTop: -4 }}
                  hitSlop={8}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: ACCENT_BLUE }}>
                    Forgot password?
                  </Text>
                </Pressable>

                <SubmitButton
                  label="Sign In"
                  loading={loginLoading}
                  onPress={handleLogin}
                />

                {/* Demo hint */}
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 11,
                    color: TEXT_TERTIARY,
                    marginTop: -4,
                  }}
                >
                  Demo: username{' '}
                  <Text style={{ fontWeight: '700', color: TEXT_SECONDARY }}>me</Text>
                  {' / password '}
                  <Text style={{ fontWeight: '700', color: TEXT_SECONDARY }}>123456</Text>
                </Text>
              </View>
            )}

            {/* ── REGISTER FORM ────────────────────────────────────────── */}
            {activeTab === 'register' && (
              <View style={{ gap: 16 }}>
                {regError && (
                  <View
                    style={{
                      backgroundColor: 'rgba(255,59,48,0.1)',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: 'rgba(255,59,48,0.3)',
                      padding: 12,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: C.danger }}>{regError}</Text>
                  </View>
                )}

                <InputField
                  label="Full Name"
                  icon={<IconUser />}
                  value={regName}
                  onChangeText={setRegName}
                  placeholder="Alex Morgan"
                  autoCapitalize="words"
                />

                <InputField
                  label="Email Address"
                  icon={<IconMail />}
                  value={regEmail}
                  onChangeText={setRegEmail}
                  placeholder="alex@vibenet.app"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <InputField
                  label="Create Password"
                  icon={<IconLock />}
                  value={regPassword}
                  onChangeText={setRegPassword}
                  placeholder="Min. 8 characters"
                  secureTextEntry={!showRegPw}
                  rightSlot={
                    <EyeToggle show={showRegPw} onPress={() => setShowRegPw(v => !v)} />
                  }
                />

                {/* Soul Sync TTL picker (Vibenet-specific feature) */}
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: TEXT_PRIMARY, marginLeft: 4 }}>
                      ⏳ Post TTL (Soul Sync)
                    </Text>
                    <View
                      style={{
                        backgroundColor: 'rgba(108,76,255,0.12)',
                        paddingHorizontal: 10,
                        paddingVertical: 3,
                        borderRadius: 9999,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: C.brand }}>
                        {regTtl}h
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 11, color: TEXT_SECONDARY, marginBottom: 8, marginLeft: 4 }}>
                    How long your posts survive before fading away.
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {TTL_OPTIONS.map(h => {
                      const active = regTtl === h;
                      return (
                        <Pressable
                          key={h}
                          onPress={() => setRegTtl(h)}
                          style={{
                            flex: 1,
                            height: 36,
                            borderRadius: 9999,
                            borderWidth: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: active ? TEXT_PRIMARY : 'transparent',
                            borderColor: active ? TEXT_PRIMARY : 'rgba(0,0,0,0.1)',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: '600',
                              color: active ? SURFACE_WHITE : TEXT_SECONDARY,
                            }}
                          >
                            {h}h
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Terms */}
                <Text style={{ fontSize: 11, color: TEXT_SECONDARY, textAlign: 'center' }}>
                  By registering you agree to our{' '}
                  <Text style={{ fontWeight: '700', color: TEXT_PRIMARY }}>Terms & Privacy</Text>
                </Text>

                <SubmitButton
                  label="Create Account"
                  loading={regLoading}
                  onPress={handleRegister}
                />
              </View>
            )}

            {/* ── Divider ──────────────────────────────────────────────── */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                marginTop: 20,
                marginBottom: 16,
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.08)' }} />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  color: TEXT_TERTIARY,
                  letterSpacing: 0.5,
                }}
              >
                Or continue with
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.08)' }} />
            </View>

            {/* ── Social SSO Buttons ───────────────────────────────────── */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <SsoButton icon={<IconGoogle />} label="Google" />
              <SsoButton icon={<IconApple color={TEXT_PRIMARY} />} label="Apple" />
            </View>
          </View>

          {/* ── Footer ───────────────────────────────────────────────────── */}
          <Text
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: TEXT_SECONDARY,
              marginTop: 20,
            }}
          >
            By signing up, you agree to Vibenet's{' '}
            <Text style={{ fontWeight: '700', color: TEXT_PRIMARY }}>Community Guidelines</Text>.
          </Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
