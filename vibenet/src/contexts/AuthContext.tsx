import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as authApi from '../services/api/auth';
import * as usersApi from '../services/api/users';
import { clearTokens, getAccessToken, loadTokensFromStorage, persistTokens, setOnAuthExpired } from '../services/api/client';
import { connectWebSocket, disconnectWebSocket } from '../services/websocket';
import type { UserResponse } from '../services/api/types';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { username: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshCurrentUser: () => Promise<void>;
  updateCurrentUser: (updates: Partial<UserResponse>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// react-native's JS engine (Hermes) has no built-in atob/Buffer, so decode base64 by hand.
function base64Decode(input: string): string {
  const clean = input.replace(/-/g, '+').replace(/_/g, '/').replace(/[^A-Za-z0-9+/]/g, '');
  let output = '';
  for (let i = 0; i < clean.length; i += 4) {
    const enc1 = BASE64_CHARS.indexOf(clean[i]);
    const enc2 = BASE64_CHARS.indexOf(clean[i + 1]);
    const enc3 = BASE64_CHARS.indexOf(clean[i + 2]);
    const enc4 = BASE64_CHARS.indexOf(clean[i + 3]);

    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;

    output += String.fromCharCode(chr1);
    if (enc3 !== -1 && clean[i + 2] !== undefined) output += String.fromCharCode(chr2);
    if (enc4 !== -1 && clean[i + 3] !== undefined) output += String.fromCharCode(chr3);
  }
  return output;
}

// Backend returns raw error-code messages (see UserErrorCode.java); translate the
// ones surfaced on the login/register screens into copy a user should actually read.
const FRIENDLY_AUTH_ERRORS: Record<string, string> = {
  'User not found': 'No account found with that username or email.',
  'User wrong password': 'Incorrect password. Please try again.',
  'User account banned': 'This account has been suspended. Contact support for help.',
  'User existed': 'That username is already taken.',
  'Email already registered': 'An account with that email already exists.',
};

function friendlyAuthError(message: string): string {
  return FRIENDLY_AUTH_ERRORS[message] ?? message;
}

function decodeUserId(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    const json = JSON.parse(base64Decode(payload));
    return json.sub ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadUserFromToken = useCallback(async (accessToken: string) => {
    const userId = decodeUserId(accessToken);
    if (!userId) return null;
    const fetched = await usersApi.getUserById(userId);
    setUser(fetched);
    return fetched;
  }, []);

  useEffect(() => {
    (async () => {
      const { accessToken } = await loadTokensFromStorage();
      if (accessToken) {
        try {
          await loadUserFromToken(accessToken);
          connectWebSocket();
        } catch {
          await clearTokens();
          setUser(null);
        }
      }
      setIsLoading(false);
    })();

    setOnAuthExpired(() => {
      setUser(null);
      disconnectWebSocket();
    });
  }, [loadUserFromToken]);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const tokens = await authApi.login(username, password);
      await persistTokens(tokens);
      await loadUserFromToken(tokens.accessToken);
      connectWebSocket();
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? friendlyAuthError(err.message) : 'Login failed';
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [loadUserFromToken]);

  const register = useCallback(async (data: { username: string; email: string; password: string }) => {
    setIsLoading(true);
    try {
      await authApi.register(data.username, data.email, data.password);
      return await login(data.username, data.password);
    } catch (err) {
      const message = err instanceof Error ? friendlyAuthError(err.message) : 'Registration failed';
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const logout = useCallback(() => {
    clearTokens();
    disconnectWebSocket();
    setUser(null);
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    await loadUserFromToken(token);
  }, [loadUserFromToken]);

  const updateCurrentUser = useCallback((updates: Partial<UserResponse>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      refreshCurrentUser,
      updateCurrentUser,
    }),
    [user, isLoading, login, register, logout, refreshCurrentUser, updateCurrentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
