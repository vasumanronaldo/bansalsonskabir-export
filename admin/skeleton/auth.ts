/**
 * Auth primitives for the Bansal Sons admin portal.
 * Cloudflare Workers — WebCrypto only, no native dependencies.
 *
 * Rules that must not be relaxed:
 *   - Only sha256(token) is ever stored. A DB leak must not yield live sessions.
 *   - Comparisons are constant-time.
 *   - Unknown user and wrong password return the same message and same timing.
 */

const PBKDF2_ITERATIONS = 600_000;
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const enc = new TextEncoder();

// ---------- encoding ----------

function b64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}
function unb64(s: string): Uint8Array {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}
function b64url(bytes: Uint8Array): string {
  return b64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ---------- passwords ----------

export async function hashPassword(
  password: string,
  saltB64?: string
): Promise<{ hash: string; salt: string }> {
  const salt = saltB64 ? unb64(saltB64) : crypto.getRandomValues(new Uint8Array(16));

  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    key,
    256
  );

  return { hash: b64(new Uint8Array(bits)), salt: b64(salt) };
}

/** Constant-time. Never use === on a hash. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string
): Promise<boolean> {
  const { hash } = await hashPassword(password, storedSalt);
  return timingSafeEqual(hash, storedHash);
}

/**
 * Burn equivalent CPU when the user does not exist, so response time does not
 * reveal whether an email is registered.
 */
export async function dummyVerify(): Promise<void> {
  await hashPassword('dummy-password-for-timing', b64(new Uint8Array(16)));
}

// ---------- sessions ----------

export async function sha256(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(input));
  return b64(new Uint8Array(digest));
}

export function newToken(): string {
  return b64url(crypto.getRandomValues(new Uint8Array(32)));
}

export async function createSession(
  env: { DB: D1Database; SESSION_PEPPER: string },
  userId: string,
  req: Request
): Promise<{ token: string; csrf: string; cookie: string }> {
  const token = newToken();
  const id = await sha256(token + env.SESSION_PEPPER);
  const csrf = newToken();
  const expires = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  await env.DB.prepare(
    `INSERT INTO sessions (id, user_id, csrf, expires_at, ip, user_agent)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      userId,
      csrf,
      expires,
      req.headers.get('CF-Connecting-IP') ?? '',
      (req.headers.get('User-Agent') ?? '').slice(0, 255)
    )
    .run();

  const cookie =
    `bsj_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; ` +
    `Max-Age=${SESSION_TTL_MS / 1000}`;

  return { token, csrf, cookie };
}

export async function getSession(
  env: { DB: D1Database; SESSION_PEPPER: string },
  req: Request
) {
  const cookie = req.headers.get('Cookie') ?? '';
  const token = /(?:^|;\s*)bsj_session=([A-Za-z0-9_-]+)/.exec(cookie)?.[1];
  if (!token) return null;

  const id = await sha256(token + env.SESSION_PEPPER);

  const row = await env.DB.prepare(
    `SELECT s.csrf, s.expires_at, u.id, u.email, u.name, u.role, u.disabled
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.id = ?`
  )
    .bind(id)
    .first<any>();

  if (!row || row.disabled) return null;

  if (new Date(row.expires_at) < new Date()) {
    await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(id).run();
    return null;
  }

  return {
    sessionId: id,
    csrf: row.csrf as string,
    user: { id: row.id, email: row.email, name: row.name, role: row.role },
  };
}

export const clearCookie =
  'bsj_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0';

// ---------- rate limiting ----------

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export async function isRateLimited(
  env: { DB: D1Database },
  identifier: string,
  ip: string
): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();
  const row = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM login_attempts
      WHERE ok = 0 AND at > ? AND (identifier = ? OR ip = ?)`
  )
    .bind(since, identifier.toLowerCase(), ip)
    .first<{ n: number }>();

  return (row?.n ?? 0) >= MAX_ATTEMPTS;
}

export async function recordAttempt(
  env: { DB: D1Database },
  identifier: string,
  ip: string,
  ok: boolean
): Promise<void> {
  await env.DB.prepare(
    'INSERT INTO login_attempts (identifier, ip, ok) VALUES (?, ?, ?)'
  )
    .bind(identifier.toLowerCase(), ip, ok ? 1 : 0)
    .run();
}

// ---------- csrf ----------

export function checkCsrf(req: Request, sessionCsrf: string): boolean {
  const sent = req.headers.get('X-CSRF-Token');
  return !!sent && timingSafeEqual(sent, sessionCsrf);
}

// ---------- response headers ----------

export const ADMIN_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'X-Robots-Tag': 'noindex, nofollow',
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' blob: data:; object-src 'none'; base-uri 'none'",
};
