import { Platform } from 'react-native';

// Android emulator can't reach the host machine via localhost — it maps 10.0.2.2 to the host.
// iOS simulator and web both work with localhost directly. Override via EXPO_PUBLIC_API_URL
// when testing on a physical device (use your machine's LAN IP).
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_HOST;
// Spring registers /ws as a SockJS endpoint; /ws/websocket is SockJS's raw-WebSocket
// fallback path, which lets a plain (non-SockJS) STOMP client connect directly.
export const WS_URL = `${API_BASE_URL.replace(/^http/, 'ws')}/ws/websocket`;

// Backend returns media/avatar URLs as host-relative paths (e.g. "/uploads/media/posts/x.jpg"),
// so they need the API origin prefixed before an <Image>/<Video> can load them. Absolute URLs
// (e.g. seed data or third-party avatars) pass through untouched.
export function resolveMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}
