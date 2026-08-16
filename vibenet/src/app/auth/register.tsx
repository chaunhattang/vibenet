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

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    const res = await register({
      fullName,
      username,
      email,
      password,
    });

    if (res.success) {
      router.replace('/(tabs)');
    } else {
      setError(res.error || 'Registration failed. Please try again.');
    }
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
            {/* Header back button & branding */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.header}>
              <LinearGradient
                colors={['#0D0E11', '#2C303B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoBadge}>
                <Ionicons name="person-add" size={26} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.appTitle}>Create Account</Text>
              <Text style={styles.appSubtitle}>
                Join VibeNet to share moments and stay close to your favorite people.
              </Text>
            </View>

            {/* Registration Form Card */}
            <GlassCard style={styles.formCard}>
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
                label="Full Name"
                iconName="person-outline"
                placeholder="e.g. Elena Vance"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  setError('');
                }}
              />

              <GlassInput
                label="Username"
                iconName="at-outline"
                placeholder="e.g. elena_v"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setError('');
                }}
                autoCapitalize="none"
              />

              <GlassInput
                label="Email"
                iconName="mail-outline"
                placeholder="elena@vibenet.io"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <GlassInput
                label="Password"
                iconName="lock-closed-outline"
                placeholder="At least 6 characters"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                isPassword
              />

              <PrimaryButton
                title="Create Account"
                onPress={handleRegister}
                loading={isLoading}
                style={styles.createButton}
              />
            </GlassCard>

            {/* Switch to login */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.replace('/auth/login')}>
                <Text style={styles.footerLink}>Sign in</Text>
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
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: -10,
    width: 40,
    height: 40,
    borderRadius: Radii.pill,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.five,
    marginTop: Spacing.four,
  },
  logoBadge: {
    width: 60,
    height: 60,
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
    fontSize: 26,
    letterSpacing: -0.6,
    marginBottom: Spacing.one,
  },
  appSubtitle: {
    ...Typography.bodySmall,
    textAlign: 'center',
    color: Colors.textSecondary,
    maxWidth: 300,
  },
  formCard: {
    width: '100%',
    padding: Spacing.six,
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
  createButton: {
    width: '100%',
    marginTop: Spacing.two,
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
