import { Platform } from 'react-native';

// Android emulator can't reach the host machine via "localhost" — 10.0.2.2 aliases it.
// iOS simulator and Metro's own host both resolve "localhost" fine. Physical devices need
// the machine's LAN IP instead; swap this constant manually until env-based config exists.
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8080',
  default: 'http://localhost:8080',
});

type Tokens = { accessToken: string; refreshToken: string };

// Session-only (no persistence lib installed yet) — tokens are lost on app restart,
// same as every other piece of state in this mock-first codebase. Add AsyncStorage-backed
// persistence as a follow-up once this pattern is validated end to end.
let tokens: Tokens | null = null;

export function setTokens(next: Tokens | null) {
  tokens = next;
}

export function getTokens() {
  return tokens;
}

export class ApiError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

type ApiEnvelope<T> = { code: number; message?: string; result?: T };

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  isMultipart?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T | undefined> {
  const { method = 'GET', body, isMultipart, query } = options;

  let url = `${API_BASE_URL}${path}`;
  if (query) {
    const params = Object.entries(query)
      .filter((entry): entry is [string, string | number | boolean] => entry[1] !== undefined)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
    if (params) url += `?${params}`;
  }

  const headers: Record<string, string> = {};
  if (tokens?.accessToken) headers.Authorization = `Bearer ${tokens.accessToken}`;
  if (!isMultipart && body !== undefined) headers['Content-Type'] = 'application/json';

  // Without a timeout, an unreachable host (e.g. 10.0.2.2 from a physical device) hangs
  // indefinitely instead of failing — callers rely on this rejecting promptly to fall
  // back to mock data.
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 8000);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: isMultipart ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
      signal: abortController.signal,
    });
  } catch {
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0);
  } finally {
    clearTimeout(timeoutId);
  }

  const envelope: ApiEnvelope<T> = await response
    .json()
    .catch(() => ({ code: response.status }) as ApiEnvelope<T>);

  if (!response.ok) {
    throw new ApiError(envelope.message ?? 'Something went wrong. Please try again.', envelope.code);
  }

  return envelope.result;
}

export const apiGet = <T>(path: string, query?: RequestOptions['query']) =>
  request<T>(path, { method: 'GET', query });

export const apiPost = <T>(path: string, body?: unknown, query?: RequestOptions['query']) =>
  request<T>(path, { method: 'POST', body, query });

export const apiPostMultipart = <T>(path: string, formData: FormData) =>
  request<T>(path, { method: 'POST', body: formData, isMultipart: true });

export const apiPut = <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body });

export const apiDelete = <T>(path: string) => request<T>(path, { method: 'DELETE' });

// Media URLs come back as "/uploads/..." paths — resolve against the API base to get
// something an <Image>/<Video> can actually load.
export function resolveMediaUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
}
