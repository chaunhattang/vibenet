import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../../contexts/AuthContext';
import { VibeNetLogo } from '../../components/ui/VibeNetLogo';
import { createProfile } from '../../services/api/users';
import { Typography, Spacing } from '../../constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, refreshCurrentUser, isLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

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
    const res = await register({ username, email, password });

    if (!res.success) {
      setError(res.error || 'Registration failed. Please try again.');
      return;
    }

    try {
      const form = new FormData();
      form.append('fullName', fullName);
      await createProfile(form);
      await refreshCurrentUser();
    } catch {
      // Profile creation failure shouldn't block entry
    }

    router.replace('/(tabs)');
  };

  const handleSocialAuth = (provider: string) => {
    showToast(`Connecting to ${provider}...`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        
        {/* Floating Toast Notification */}
        {toastMessage ? (
          <View style={styles.toast}>
            <Ionicons name="checkmark-circle" size={17} color="#22C55E" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        ) : null}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.contentWrapper}>
            {/* Top Navigation Row with Back button & Language Selector */}
            <View style={styles.topNavRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.back()}
                style={styles.backButton}>
                <Ionicons name="chevron-back" size={20} color="#111827" />
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.7} style={styles.langSelector}>
                <Text style={styles.langText}>English (US)</Text>
                <Ionicons name="chevron-down" size={13} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Brand Logo & Tagline */}
            <View style={styles.brandSection}>
              <VibeNetLogo size={60} variant="vibe" style={styles.brandIcon} />
              <Text style={styles.brandName}>VibeNet</Text>
              <Text style={styles.brandTagline}>Capture and connect with friends</Text>
            </View>

            {/* Error Banner */}
            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={17} color="#EF4444" />
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            ) : null}

            {/* Form Fields */}
            <View style={styles.form}>
              <View
                style={[
                  styles.inputField,
                  focusedField === 'fullName' && styles.inputFieldFocused,
                ]}>
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  placeholderTextColor="#9CA3AF"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    setError('');
                  }}
                  onFocus={() => setFocusedField('fullName')}
                  onBlur={() => setFocusedField(null)}
                  autoCorrect={false}
                />
              </View>

              <View
                style={[
                  styles.inputField,
                  focusedField === 'username' && styles.inputFieldFocused,
                ]}>
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#9CA3AF"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    setError('');
                  }}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View
                style={[
                  styles.inputField,
                  focusedField === 'email' && styles.inputFieldFocused,
                ]}>
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError('');
                  }}
                  keyboardType="email-address"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View
                style={[
                  styles.inputField,
                  focusedField === 'password' && styles.inputFieldFocused,
                ]}>
                <TextInput
                  style={[styles.input, { paddingRight: 44 }]}
                  placeholder="Password (min 6 characters)"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError('');
                  }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.fieldIcon}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <Ionicons
                    name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={19}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>

              {/* Primary Action Button */}
              <TouchableOpacity
                activeOpacity={0.88}
                style={[styles.btnLogin, isLoading && styles.btnLoading]}
                onPress={handleRegister}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              {/* OR Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Stack */}
              <View style={styles.socialStack}>
                {/* Apple Sign In */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.btnSocial}
                  onPress={() => handleSocialAuth('Apple')}>
                  <Ionicons name="logo-apple" size={18} color="#000000" />
                  <Text style={styles.btnSocialText}>Continue with Apple</Text>
                </TouchableOpacity>

                {/* Google Sign In */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.btnSocial}
                  onPress={() => handleSocialAuth('Google')}>
                  <Svg width="17" height="17" viewBox="0 0 24 24">
                    <Path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <Path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <Path
                      fill="#FBBC05"
                      d="M5.28 14.27a7.195 7.195 0 0 1 0-4.54V6.58H1.25a11.97 11.97 0 0 0 0 10.84l4.03-3.15z"
                    />
                    <Path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </Svg>
                  <Text style={styles.btnSocialText}>Continue with Google</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.appFooter}>
              <Text style={styles.signupCta}>
                Already have an account?{' '}
                <Text
                  style={styles.signupLink}
                  onPress={() => router.replace('/auth/login')}>
                  Log in
                </Text>
              </Text>
              <View style={styles.metaBadge}>
                <Text style={styles.metaFrom}>from </Text>
                <Text style={styles.metaBrand}>VIBENET LABS</Text>
              </View>
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
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 24,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 390,
    flex: 1,
    justifyContent: 'space-between',
  },
  toast: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.92)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 99,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    width: '100%',
  },
  backButton: {
    padding: 6,
    marginLeft: -6,
  },
  langSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  langText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandIcon: {
    marginBottom: 12,
  },
  brandName: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#111827',
  },
  brandTagline: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    padding: Spacing.three,
    borderRadius: 12,
    marginBottom: 14,
    gap: Spacing.two,
  },
  errorBannerText: {
    ...Typography.bodySmall,
    color: '#EF4444',
    fontWeight: '500',
    flex: 1,
    fontSize: 12.5,
  },
  form: {
    width: '100%',
    gap: 12,
  },
  inputField: {
    width: '100%',
    height: 52,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    position: 'relative',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        transition: 'all 0.2s ease',
      },
    }),
  },
  inputFieldFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0095F6',
    ...Platform.select({
      web: {
        boxShadow: '0 0 0 3px rgba(0, 149, 246, 0.12)',
      },
    }),
  },
  input: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 14.5,
    color: '#111827',
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      },
    }),
  },
  fieldIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnLogin: {
    width: '100%',
    height: 48,
    backgroundColor: '#0095F6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#0095F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 149, 246, 0.25)',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    }),
  },
  btnLoading: {
    opacity: 0.85,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  socialStack: {
    gap: 10,
  },
  btnSocial: {
    width: '100%',
    height: 46,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s',
      },
    }),
  },
  btnSocialText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#111827',
  },
  appFooter: {
    alignItems: 'center',
    gap: 14,
    paddingTop: 20,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  signupCta: {
    fontSize: 13.5,
    color: '#6B7280',
  },
  signupLink: {
    color: '#0095F6',
    fontWeight: '600',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaFrom: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metaBrand: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: -0.3,
  },
});
