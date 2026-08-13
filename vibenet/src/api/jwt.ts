// Minimal JWT payload decoder — no dependency, since we only need the "sub" (userId)
// claim client-side (see backend JwtServiceImpl#createToken: subject = user id).
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  let buffer = 0;
  let bits = 0;
  let latin1 = '';
  for (const char of base64) {
    const value = BASE64_CHARS.indexOf(char);
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      latin1 += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }
  // Re-encode as UTF-8 in case the payload has non-ASCII (e.g. accented names).
  const percentEncoded = latin1
    .split('')
    .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
  return decodeURIComponent(percentEncoded);
}

export function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split('.')[1];
  if (!payload) throw new Error('Malformed token.');
  return JSON.parse(base64UrlDecode(payload));
}
