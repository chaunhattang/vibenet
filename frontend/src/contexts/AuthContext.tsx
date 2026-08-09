import { createContext, ReactNode, useContext, useState } from 'react';
import { loginRequest, registerRequest } from '../api/auth';
import { resolveMediaUrl, setTokens } from '../api/client';
import { decodeJwtPayload } from '../api/jwt';
import { getUserById } from '../api/users';
import { CURRENT_USER_AVATAR } from '../constants';
import { DEFAULT_COVER } from '../data/mockData';
import { ProfileDetails, UserResponse } from '../types';

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

  const login = async ({ userName, password }: LoginInput) => {
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
  };

  const register = async ({ userName, email, password }: RegisterInput) => {
    await registerRequest({ username: userName.trim(), email: email.trim(), password });
  };

  const logout = () => {
    setTokens(null);
    setCurrentUserId(null);
    setCurrentUser(null);
  };

  const updateCurrentUser = (updated: ProfileDetails) => setCurrentUser(updated);

  return (
    <AuthContext.Provider
      value={{ currentUserId, currentUser, login, register, logout, updateCurrentUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
