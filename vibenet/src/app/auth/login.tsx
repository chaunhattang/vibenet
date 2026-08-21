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
import { useAuth } from '../../contexts/AuthContext';
import { VibenetMark } from '../../components/common/VibenetMark';
import { Typography, Spacing } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const handleLogin = async () => {
    if (!username.trim()) {
      setError('Please enter your username or email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }
    setError('');
    const res = await login(username, password);
    if (res.success) {
      router.replace('/(tabs)');
    } else {
      setError(res.error || 'Invalid credentials. Please try again.');
    }
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
            {/* Top Language Selector */}
            <View style={styles.appHeader}>
              <TouchableOpacity activeOpacity={0.7} style={styles.langSelector}>
                <Text style={styles.langText}>English (US)</Text>
                <Ionicons name="chevron-down" size={13} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Brand Logo & Tagline */}
            <View style={styles.brandSection}>
              <View style={styles.brandIcon}>
                <VibenetMark size={60} />
              </View>
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
                  focusedField === 'username' && styles.inputFieldFocused,
                ]}>
                <TextInput
                  style={styles.input}
                  placeholder="Phone number, username, or email"
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
                  focusedField === 'password' && styles.inputFieldFocused,
                ]}>
                <TextInput
                  style={[styles.input, { paddingRight: 44 }]}
                  placeholder="Password"
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

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.forgotPassButton}
                onPress={() => showToast('Password reset link sent')}>
                <Text style={styles.forgotPassText}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Primary Action Button */}
              <TouchableOpacity
                activeOpacity={0.88}
                style={[styles.btnLogin, isLoading && styles.btnLoading]}
                onPress={handleLogin}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnText}>Log In</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.appFooter}>
              <Text style={styles.signupCta}>
                Don&apos;t have an account?{' '}
                <Text
                  style={styles.signupLink}
                  onPress={() => router.push('/auth/register')}>
                  Sign up
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
    paddingTop: 16,
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
  appHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
    marginBottom: 32,
  },
  brandIcon: {
    marginBottom: 12,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#111827',
  },
  brandTagline: {
    fontSize: 13.5,
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
    marginBottom: 16,
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
  forgotPassButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 2,
    marginTop: 2,
  },
  forgotPassText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0095F6',
  },
  btnLogin: {
    width: '100%',
    height: 48,
    backgroundColor: '#0095F6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
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
  appFooter: {
    alignItems: 'center',
    gap: 14,
    paddingTop: 24,
    marginTop: 24,
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
