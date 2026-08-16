import { apiClient, unwrap } from './client';
import type { TokenResponse } from './types';

export function login(username: string, password: string) {
  return unwrap<TokenResponse>(apiClient.post('/api/auth/login', { username, password }));
}

export function register(username: string, email: string, password: string) {
  return unwrap<{ username: string; email: string }>(
    apiClient.post('/api/auth/register', { username, email, password })
  );
}

export function refresh(refreshToken: string) {
  return unwrap<TokenResponse>(apiClient.post('/api/auth/refresh', { refreshToken }));
}
