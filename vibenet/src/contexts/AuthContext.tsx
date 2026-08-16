import React, { createContext, useContext, useState } from 'react';
import { CURRENT_USER, MOCK_USERS, UserProfile } from '../data/mockData';

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { username: string; fullName: string; email: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
  quickDemoLogin: (userIndex?: number) => void;
  logout: () => void;
  updateCurrentUser: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Default to logged in as CURRENT_USER for instant interactive UI development,
  // but with full login / register capabilities.
  const [user, setUser] = useState<UserProfile | null>(CURRENT_USER);
  const [accessToken, setAccessToken] = useState<string | null>('mock-jwt-token-alexrivera');
  const [refreshToken, setRefreshToken] = useState<string | null>('mock-refresh-token-alexrivera');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (username: string, _password?: string) => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 600)); // Smooth UX delay
    
    // Find matching mock user or fallback
    const targetUser = MOCK_USERS.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() || u.email.toLowerCase() === username.trim().toLowerCase()
    ) || {
      ...CURRENT_USER,
      username: username.trim(),
      fullName: username.trim(),
    };

    setUser(targetUser);
    setAccessToken(`mock-jwt-token-${targetUser.id}`);
    setRefreshToken(`mock-refresh-token-${targetUser.id}`);
    setIsLoading(false);
    return { success: true };
  };

  const register = async (data: { username: string; fullName: string; email: string; password?: string }) => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 800));

    const newUser: UserProfile = {
      id: `u-${Date.now()}`,
      username: data.username.trim().toLowerCase(),
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      coverImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      bio: 'New explorer on VibeNet ✨',
      postsCount: 0,
      friendsCount: 0,
      momentsCount: 0,
      isOnline: true,
      lastActiveAt: 'Just now',
    };

    setUser(newUser);
    setAccessToken(`mock-jwt-token-${newUser.id}`);
    setRefreshToken(`mock-refresh-token-${newUser.id}`);
    setIsLoading(false);
    return { success: true };
  };

  const quickDemoLogin = (userIndex: number = 0) => {
    const selected = MOCK_USERS[userIndex % MOCK_USERS.length];
    setUser(selected);
    setAccessToken(`mock-jwt-token-${selected.id}`);
    setRefreshToken(`mock-refresh-token-${selected.id}`);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  };

  const updateCurrentUser = (updates: Partial<UserProfile>) => {
    if (!user) return;
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
        login,
        register,
        quickDemoLogin,
        logout,
        updateCurrentUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
