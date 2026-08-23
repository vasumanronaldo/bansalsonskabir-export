import 'server-only'
// Two-factor (TOTP) enrolment + the short-lived "password OK, awaiting code"
// handoff between the two login steps. Strictly opt-in: a fresh secret is stored
// disabled and only flips to enabled once the user proves a working code, so 2FA
// can never lock anyone out by half-configuring.
import { adminEnv } from './session'
import { sha256, timingSafeEqual } from './auth'
import { audit } from './db'
import { generateTotpSecret, verifyTotp, totpUri } from './totp'

export interface TwoFAStatus {
  enabled: boolean
  pending: boolean // secret generated but not yet confirmed
  secret: string | null
  uri: string | null
}

export async function getTwoFAStatus(userId: string, account: string): Promise<TwoFAStatus> {
  const row = await adminEnv().DB.prepare('SELECT totp_secret, totp_enabled FROM users WHERE id = ?').bind(userId).first<{ totp_secret: string | null; totp_enabled: number }>()
  const enabled = row?.totp_enabled === 1
  const secret = row?.totp_secret ?? null
  return {
    enabled,
    pending: !enabled && !!secret,
    secret: enabled ? null : secret,
    uri: !enabled && secret ? totpUri(secret, account) : null,
  }
}

/** Generate + store a fresh secret (disabled). Replaces any un-confirmed one. */
export async function beginEnrollment(userId: string): Promise<void> {
  const secret = generateTotpSecret()
  await adminEnv().DB.prepare('UPDATE users SET totp_secret = ?, totp_enabled = 0 WHERE id = ?').bind(secret, userId).run()
}

/** Verify a code against the pending secret; on success, enable 2FA. */
export async function confirmEnrollment(userId: string, code: string): Promise<boolean> {
  const row = await adminEnv().DB.prepare('SELECT totp_secret FROM users WHERE id = ?').bind(userId).first<{ totp_secret: string | null }>()
  if (!row?.totp_secret) return false
  if (!(await verifyTotp(row.totp_secret, code))) return false
  await adminEnv().DB.prepare('UPDATE users SET totp_enabled = 1 WHERE id = ?').bind(userId).run()
  await audit(userId, 'update', 'user', userId, { twofa: 'enabled' })
  return true
}

export async function disableTwoFA(userId: string): Promise<void> {
  await adminEnv().DB.prepare('UPDATE users SET totp_secret = NULL, totp_enabled = 0 WHERE id = ?').bind(userId).run()
  await audit(userId, 'update', 'user', userId, { twofa: 'disabled' })
}

/** True if the account has 2FA active (checked during login). */
export async function isTwoFAEnabled(env: { DB: D1Database }, userId: string): Promise<boolean> {
  const row = await env.DB.prepare('SELECT totp_enabled FROM users WHERE id = ?').bind(userId).first<{ totp_enabled: number }>()
  return row?.totp_enabled === 1
}

export async function verifyUserTotp(env: { DB: D1Database }, userId: string, code: string): Promise<boolean> {
  const row = await env.DB.prepare('SELECT totp_secret, totp_enabled FROM users WHERE id = ?').bind(userId).first<{ totp_secret: string | null; totp_enabled: number }>()
  if (!row || row.totp_enabled !== 1 || !row.totp_secret) return false
  return verifyTotp(row.totp_secret, code)
}

// ---------- pending-2FA handoff cookie (stateless, signed, 5-minute TTL) ----------
const PENDING_TTL_MS = 5 * 60 * 1000
const b64url = (s: string) => btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const unb64url = (s: string) => atob(s.replace(/-/g, '+').replace(/_/g, '/'))

export async function makePendingCookie(env: { SESSION_PEPPER: string }, userId: string): Promise<string> {
  const payload = b64url(JSON.stringify({ uid: userId, exp: Date.now() + PENDING_TTL_MS }))
  const sig = await sha256(payload + env.SESSION_PEPPER)
  return `bsj_2fa=${payload}.${b64url(sig)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${PENDING_TTL_MS / 1000}`
}

export const clearPendingCookie = 'bsj_2fa=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'

export async function readPendingCookie(env: { SESSION_PEPPER: string }, req: Request): Promise<string | null> {
  const raw = /(?:^|;\s*)bsj_2fa=([^;]+)/.exec(req.headers.get('Cookie') ?? '')?.[1]
  if (!raw) return null
  const dot = raw.lastIndexOf('.')
  if (dot === -1) return null
  const payload = raw.slice(0, dot)
  const sig = raw.slice(dot + 1)
  const expected = b64url(await sha256(payload + env.SESSION_PEPPER))
  if (!timingSafeEqual(sig, expected)) return null
  try {
    const { uid, exp } = JSON.parse(unb64url(payload)) as { uid: string; exp: number }
    if (typeof uid !== 'string' || typeof exp !== 'number' || Date.now() > exp) return null
    return uid
  } catch {
    return null
  }
}
