import { apiPost } from './client';

export type LoginPayload = { username: string; password: string };
export type RegisterPayload = { username: string; email: string; password: string };
export type TokenResponse = { accessToken: string; refreshToken: string };

export const loginRequest = (payload: LoginPayload) =>
  apiPost<TokenResponse>('/api/auth/login', payload);

export const registerRequest = (payload: RegisterPayload) =>
  apiPost<RegisterPayload>('/api/auth/register', payload);
