/**
 * Authentication helpers for Cloudflare Workers.
 * Uses Web Crypto API (PBKDF2 for passwords, HMAC-SHA256 for JWT).
 */

const PBKDF2_ITERATIONS = 100_000;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;

// ──────────────────────────────────────────────
// Password hashing (PBKDF2)
// ──────────────────────────────────────────────

/**
 * Hash a password using PBKDF2-SHA256.
 * Returns a string in the format: base64(salt):base64(derivedKey)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  const saltB64 = uint8ToBase64(salt);
  const hashB64 = uint8ToBase64(new Uint8Array(derivedBits));

  return `${saltB64}:${hashB64}`;
}

/**
 * Verify a password against a stored hash.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [saltB64, hashB64] = storedHash.split(':');
  if (!saltB64 || !hashB64) return false;

  const salt = base64ToUint8(saltB64);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  const derivedB64 = uint8ToBase64(new Uint8Array(derivedBits));

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(hashB64, derivedB64);
}

// ──────────────────────────────────────────────
// JWT (HMAC-SHA256)
// ──────────────────────────────────────────────

/**
 * Create a JWT token with the given userId.
 * Token format: base64url(header).base64url(payload).base64url(signature)
 * Expires in 7 days.
 */
export async function createToken(
  userId: string,
  secret: string
): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(signingInput)
  );

  const signatureB64 = uint8ToBase64Url(new Uint8Array(signature));

  return `${signingInput}.${signatureB64}`;
}

/**
 * Verify a JWT token and return the payload if valid.
 * Returns null if the token is invalid or expired.
 */
export async function verifyToken(
  token: string,
  secret: string
): Promise<{ userId: string } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const signingInput = `${headerB64}.${payloadB64}`;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signature = base64UrlToUint8(signatureB64);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      new TextEncoder().encode(signingInput)
    );

    if (!isValid) return null;

    const payload = JSON.parse(base64UrlDecode(payloadB64));

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;

    return { userId: payload.sub };
  } catch {
    return null;
  }
}

// ──────────────────────────────────────────────
// Utility functions
// ──────────────────────────────────────────────

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToUint8(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  // Restore base64 padding
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) {
    b64 += '=';
  }
  return atob(b64);
}

function uint8ToBase64Url(bytes: Uint8Array): string {
  return uint8ToBase64(bytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlToUint8(b64url: string): Uint8Array {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) {
    b64 += '=';
  }
  return base64ToUint8(b64);
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
