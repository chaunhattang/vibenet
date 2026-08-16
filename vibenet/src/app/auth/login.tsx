import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useAuth } from '../../contexts/AuthContext';
import { GlassInput } from '../../components/ui/GlassInput';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { GlassCard } from '../../components/ui/GlassCard';
import {
  Colors,
  Radii,
  Spacing,
  Typography,
  MaxContentWidth,
} from '../../constants/theme';
import { MOCK_USERS } from '../../data/mockData';

export default function LoginScreen() {
  const router = useRouter();
  const { login, quickDemoLogin, isLoading } = useAuth();

  const [username, setUsername] = useState('alexrivera');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username.trim()) {
      setError('Please enter your username or email');
      return;
    }
    setError('');
    const res = await login(username, password);
    if (res.success) {
      router.replace('/(tabs)');
    } else {
      setError(res.error || 'Failed to sign in. Please try again.');
    }
  };

  const handleQuickDemo = (index: number) => {
    quickDemoLogin(index);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.contentWrapper}>
            {/* Branding Header */}
            <View style={styles.header}>
              <LinearGradient
                colors={['#0D0E11', '#2C303B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoBadge}>
                <Ionicons name="sparkles" size={28} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.appTitle}>VibeNet</Text>
              <Text style={styles.appSubtitle}>
                Experience moments, stories & close connections in real-time.
              </Text>
            </View>

            {/* Form Card */}
            <GlassCard style={styles.formCard}>
              <Text style={styles.cardHeading}>Sign In</Text>

              {error ? (
                <View style={styles.errorBanner}>
                  <Ionicons
                    name="alert-circle"
                    size={18}
                    color={Colors.statusLive}
                  />
                  <Text style={styles.errorBannerText}>{error}</Text>
                </View>
              ) : null}

              <GlassInput
                label="Username or Email"
                iconName="person-outline"
                placeholder="alexrivera"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setError('');
                }}
                autoCapitalize="none"
              />

              <GlassInput
                label="Password"
                iconName="lock-closed-outline"
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                isPassword
              />

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.forgotPasswordButton}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>

              <PrimaryButton
                title="Continue"
                onPress={handleLogin}
                loading={isLoading}
                style={styles.signInButton}
              />

              {/* Quick Demo Switcher Section */}
              <View style={styles.demoSection}>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>QUICK DEMO ACCESS</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Text style={styles.demoHint}>
                  Tap any profile to log in instantly:
                </Text>

                <View style={styles.demoAvatarsRow}>
                  {MOCK_USERS.slice(0, 4).map((mockUser, idx) => (
                    <TouchableOpacity
                      key={mockUser.id}
                      activeOpacity={0.8}
                      onPress={() => handleQuickDemo(idx)}
                      style={styles.demoAvatarItem}>
                      <Image
                        source={{ uri: mockUser.avatarUrl }}
                        style={styles.demoAvatarImg}
                      />
                      <Text
                        numberOfLines={1}
                        style={styles.demoAvatarName}>
                        {mockUser.fullName.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </GlassCard>

            {/* Footer switch */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account? </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/auth/register')}>
                <Text style={styles.footerLink}>Create one</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgMain,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  appTitle: {
    ...Typography.titleLarge,
    fontSize: 30,
    letterSpacing: -0.8,
    marginBottom: Spacing.one,
  },
  appSubtitle: {
    ...Typography.bodySmall,
    textAlign: 'center',
    color: Colors.textSecondary,
    maxWidth: 290,
  },
  formCard: {
    width: '100%',
    padding: Spacing.six,
  },
  cardHeading: {
    ...Typography.titleMedium,
    marginBottom: Spacing.five,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: Spacing.three,
    borderRadius: Radii.md,
    marginBottom: Spacing.four,
    gap: Spacing.two,
  },
  errorBannerText: {
    ...Typography.bodySmall,
    color: Colors.statusLive,
    fontWeight: '500',
    flex: 1,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.five,
    marginTop: -Spacing.two,
  },
  forgotPasswordText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  signInButton: {
    width: '100%',
  },
  demoSection: {
    marginTop: Spacing.six,
    width: '100%',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textTertiary,
    marginHorizontal: Spacing.three,
  },
  demoHint: {
    ...Typography.caption,
    textAlign: 'center',
    color: Colors.textSecondary,
    marginBottom: Spacing.three,
  },
  demoAvatarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  demoAvatarItem: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  demoAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: Colors.surfaceMuted,
  },
  demoAvatarName: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '600',
    maxWidth: 55,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.six,
  },
  footerText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  footerLink: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});
