// Stateless HMAC signing for the newsletter double opt-in — a confirm link
// carries an email + signature, so no database is needed to verify a click.
const secret = () => process.env.SESSION_SECRET || 'bansal-sons-dev-secret'

async function hmacHex(msg: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg))
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function signValue(value: string): Promise<string> {
  return hmacHex(value.toLowerCase())
}

export async function verifyValue(value: string, token: string): Promise<boolean> {
  const good = await hmacHex(value.toLowerCase())
  if (good.length !== token.length) return false
  let out = 0
  for (let i = 0; i < good.length; i++) out |= good.charCodeAt(i) ^ token.charCodeAt(i)
  return out === 0
}
