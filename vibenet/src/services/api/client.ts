import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config';
import { getItem, setItem, deleteItem } from '../storage';
import type { ApiResponse, TokenResponse } from './types';

const ACCESS_TOKEN_KEY = 'vibenet.accessToken';
const REFRESH_TOKEN_KEY = 'vibenet.refreshToken';

let accessTokenCache: string | null = null;
let refreshTokenCache: string | null = null;

export async function loadTokensFromStorage() {
  accessTokenCache = await getItem(ACCESS_TOKEN_KEY);
  refreshTokenCache = await getItem(REFRESH_TOKEN_KEY);
  return { accessToken: accessTokenCache, refreshToken: refreshTokenCache };
}

export async function persistTokens(tokens: TokenResponse) {
  accessTokenCache = tokens.accessToken;
  refreshTokenCache = tokens.refreshToken;
  await setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  await setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export async function clearTokens() {
  accessTokenCache = null;
  refreshTokenCache = null;
  await deleteItem(ACCESS_TOKEN_KEY);
  await deleteItem(REFRESH_TOKEN_KEY);
}

export function getAccessToken() {
  return accessTokenCache;
}

// Called by AuthContext when a refresh/re-login fails so the app can route back to /auth/login.
let onAuthExpired: (() => void) | null = null;
export function setOnAuthExpired(handler: () => void) {
  onAuthExpired = handler;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessTokenCache) {
    config.headers.set('Authorization', `Bearer ${accessTokenCache}`);
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshTokenCache) return null;
  try {
    const res = await axios.post<ApiResponse<TokenResponse>>(`${API_BASE_URL}/api/auth/refresh`, {
      refreshToken: refreshTokenCache,
    });
    await persistTokens(res.data.result);
    return res.data.result.accessToken;
  } catch {
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;

    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;

      if (newToken) {
        original.headers.set('Authorization', `Bearer ${newToken}`);
        return apiClient(original);
      }

      await clearTokens();
      onAuthExpired?.();
    }

    return Promise.reject(error);
  }
);

// Unwraps { code, message, result } into just `result`, and normalizes errors into a plain message.
export async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  try {
    const { data } = await promise;
    return data.result;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const apiMessage = (err.response?.data as ApiResponse<unknown> | undefined)?.message;
      throw new Error(apiMessage || err.message);
    }
    throw err;
  }
}
