import { createContext, ReactNode, useContext, useState } from 'react';
import { CURRENT_USER_AVATAR } from '../constants';
import { DEFAULT_COVER, mockProfiles } from '../data/mockData';
import { mockAccounts, MockAccount } from '../data/mockAccounts';
import { ProfileDetails } from '../types';

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

let nextMockUserId = 1;

// Data giả cho đăng ký/đăng nhập (chưa có backend) — sau này có be thì bỏ accounts/profiles ở
// đây, gọi login()/register()/logout() (lib/auth) thật rồi lấy currentUser từ getCurrentUser().
export function AuthProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<MockAccount[]>(mockAccounts);
  const [profiles, setProfiles] = useState<Record<string, ProfileDetails>>(mockProfiles);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const currentUser = currentUserId ? profiles[currentUserId] ?? null : null;

  const login = async ({ userName, password }: LoginInput) => {
    const account = accounts.find(
      a => a.userName.toLowerCase() === userName.trim().toLowerCase(),
    );
    if (!account || account.password !== password) {
      throw new Error('Invalid username or password.');
    }
    setCurrentUserId(account.userId);
  };

  const register = async ({ userName, email, password }: RegisterInput) => {
    const isTaken = accounts.some(
      a =>
        a.userName.toLowerCase() === userName.trim().toLowerCase() ||
        a.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (isTaken) {
      throw new Error('Username or email is already taken.');
    }

    const userId = `mock-${nextMockUserId++}`;
    setAccounts(prev => [
      ...prev,
      { userId, userName: userName.trim(), email: email.trim(), password },
    ]);
    setProfiles(prev => ({
      ...prev,
      [userId]: {
        userId,
        fullName: userName.trim(),
        handle: userName.trim().toLowerCase().replace(/\s+/g, ''),
        bio: '',
        avatar: CURRENT_USER_AVATAR,
        coverImage: DEFAULT_COVER,
        email: email.trim(),
      },
    }));
  };

  const logout = () => setCurrentUserId(null);

  const updateCurrentUser = (updated: ProfileDetails) => {
    if (!currentUserId) return;
    setProfiles(prev => ({ ...prev, [currentUserId]: updated }));
  };

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
