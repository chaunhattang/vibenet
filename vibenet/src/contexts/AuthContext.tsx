import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { loginRequest, registerRequest } from '../api/auth';
import { resolveMediaUrl, setTokens } from '../api/client';
import { decodeJwtPayload } from '../api/jwt';
import { getUserById } from '../api/users';
import { CURRENT_USER_AVATAR, CURRENT_USER_ID } from '../constants';
import { DEFAULT_COVER, mockProfiles } from '../data/mockData';
import { ProfileDetails, UserResponse } from '../types';

// Lets the login screen work with no backend running — bypasses the real API entirely
// and logs in as the pre-existing mock user ('me', keyed throughout mockData.ts) so the
// rest of the still-mock screens (friends, chat, notifications, whispers) stay usable
// for local UI testing. Not a security boundary — this is a demo/dev convenience only.
const DEMO_USERNAME = CURRENT_USER_ID;
const DEMO_PASSWORD = '123456';

type LoginInput = { userName: string; password: string };
type RegisterInput = { userName: string; email: string; password: string };

type AuthContextValue = {
  currentUserId: string | null;
  currentUser: ProfileDetails | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (updated: ProfileDetails) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Backend users may not have set up a ProfileResponse yet (POST /api/profile is a
// separate step) — fall back to sensible defaults rather than showing blanks.
function toProfileDetails(user: UserResponse): ProfileDetails {
  const profile = user.profileResponse;
  return {
    userId: user.id,
    fullName: profile?.fullName || user.username,
    handle: user.username,
    bio: profile?.bio ?? '',
    avatar: profile?.avatarUrl ? resolveMediaUrl(profile.avatarUrl) : CURRENT_USER_AVATAR,
    coverImage: profile?.coverImageUrl ? resolveMediaUrl(profile.coverImageUrl) : DEFAULT_COVER,
    phoneNumber: profile?.phoneNumber || undefined,
    email: user.email,
    dateOfBirth: profile?.dateOfBirth || undefined,
    gender: profile?.gender,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<ProfileDetails | null>(null);

  const login = useCallback(async ({ userName, password }: LoginInput) => {
    if (userName.trim() === DEMO_USERNAME && password === DEMO_PASSWORD) {
      setTokens(null);
      setCurrentUserId(CURRENT_USER_ID);
      setCurrentUser(mockProfiles[CURRENT_USER_ID]);
      return;
    }

    const tokenResponse = await loginRequest({ username: userName.trim(), password });
    if (!tokenResponse) throw new Error('Invalid username or password.');
    setTokens(tokenResponse);

    const { sub: userId } = decodeJwtPayload(tokenResponse.accessToken) as { sub: string };
    const user = await getUserById(userId);
    if (!user) {
      setTokens(null);
      throw new Error('Could not load your account.');
    }

    setCurrentUserId(user.id);
    setCurrentUser(toProfileDetails(user));
  }, []);

  const register = useCallback(async ({ userName, email, password }: RegisterInput) => {
    await registerRequest({ username: userName.trim(), email: email.trim(), password });
  }, []);

  const logout = useCallback(() => {
    setTokens(null);
    setCurrentUserId(null);
    setCurrentUser(null);
  }, []);

  const updateCurrentUser = useCallback((updated: ProfileDetails) => setCurrentUser(updated), []);

  const value = useMemo(
    () => ({ currentUserId, currentUser, login, register, logout, updateCurrentUser }),
    [currentUserId, currentUser, login, register, logout, updateCurrentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
