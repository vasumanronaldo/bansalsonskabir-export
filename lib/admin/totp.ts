// TOTP (RFC 6238) for admin two-factor auth. WebCrypto only, no dependencies.
// Works with any standard authenticator (Google Authenticator, 1Password, etc.).
const B32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const STEP_SECONDS = 30
const DIGITS = 6

export function base32Encode(bytes: Uint8Array): string {
  let bits = 0
  let value = 0
  let out = ''
  for (const b of bytes) {
    value = (value << 8) | b
    bits += 8
    while (bits >= 5) {
      out += B32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += B32_ALPHABET[(value << (5 - bits)) & 31]
  return out
}

export function base32Decode(input: string): Uint8Array {
  const clean = input.toUpperCase().replace(/=+$/, '').replace(/\s/g, '')
  let bits = 0
  let value = 0
  const out: number[] = []
  for (const ch of clean) {
    const idx = B32_ALPHABET.indexOf(ch)
    if (idx === -1) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return new Uint8Array(out)
}

/** A fresh 20-byte (160-bit) secret, base32-encoded for authenticator apps. */
export function generateTotpSecret(): string {
  return base32Encode(crypto.getRandomValues(new Uint8Array(20)))
}

function counterBytes(counter: number): Uint8Array {
  const buf = new Uint8Array(8)
  // JS bit ops are 32-bit; split high/low. Counters here fit comfortably in 53 bits.
  let hi = Math.floor(counter / 0x100000000)
  let lo = counter >>> 0
  for (let i = 7; i >= 4; i--) { buf[i] = lo & 0xff; lo = Math.floor(lo / 256) }
  for (let i = 3; i >= 0; i--) { buf[i] = hi & 0xff; hi = Math.floor(hi / 256) }
  return buf
}

async function hotp(secret: string, counter: number): Promise<string> {
  const keyBytes = base32Decode(secret)
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, counterBytes(counter)))
  const offset = sig[sig.length - 1]! & 0x0f
  const bin =
    ((sig[offset]! & 0x7f) << 24) |
    ((sig[offset + 1]! & 0xff) << 16) |
    ((sig[offset + 2]! & 0xff) << 8) |
    (sig[offset + 3]! & 0xff)
  return String(bin % 10 ** DIGITS).padStart(DIGITS, '0')
}

/** Constant-time-ish compare over fixed-length numeric codes. */
function codeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** Verify a code with a ±1 step tolerance (clock drift). `now` in ms for tests. */
export async function verifyTotp(secret: string, code: string, now = Date.now()): Promise<boolean> {
  const trimmed = code.replace(/\s/g, '')
  if (!/^\d{6}$/.test(trimmed)) return false
  const counter = Math.floor(now / 1000 / STEP_SECONDS)
  for (let w = -1; w <= 1; w++) {
    if (codeEqual(await hotp(secret, counter + w), trimmed)) return true
  }
  return false
}

export function totpUri(secret: string, account: string, issuer = 'Bansal Sons'): string {
  const label = encodeURIComponent(`${issuer}:${account}`)
  const params = new URLSearchParams({ secret, issuer, algorithm: 'SHA1', digits: String(DIGITS), period: String(STEP_SECONDS) })
  return `otpauth://totp/${label}?${params.toString()}`
}
