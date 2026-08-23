// Reset an existing admin user's password to a fresh one-time password and force
// a change on next login. Same PBKDF2 construction as lib/admin/auth.ts (6 × 100k
// = 600k, Workers-capped per call). Writes remote + local.
//
//   pnpm admin:user:reset vasumanronaldo@gmail.com
import { execFileSync } from 'node:child_process'
import { writeFileSync, unlinkSync } from 'node:fs'

const DB = 'bansal-sons-admin'
const WRANGLER = process.platform === 'win32' ? 'wrangler' : './node_modules/.bin/wrangler'
const email = process.argv.slice(2).find((a) => !a.startsWith('--'))
if (!email) { console.error('Usage: admin:user:reset <email>'); process.exit(1) }
const targets = process.argv.includes('--remote-only') ? ['--remote'] : process.argv.includes('--local-only') ? ['--local'] : ['--remote', '--local']

const enc = new TextEncoder()
const b64 = (u8) => Buffer.from(u8).toString('base64')
const PBKDF2_ITERATIONS = 100_000
const PBKDF2_ROUNDS = 6
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  let material = enc.encode(password)
  let bits
  for (let r = 0; r < PBKDF2_ROUNDS; r++) {
    const key = await crypto.subtle.importKey('raw', material, 'PBKDF2', false, ['deriveBits'])
    bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' }, key, 256)
    material = new Uint8Array(bits)
  }
  return { hash: b64(new Uint8Array(bits)), salt: b64(salt) }
}

const oneTimePassword = b64(crypto.getRandomValues(new Uint8Array(10))).replace(/[+/=]/g, '').slice(0, 14)
const { hash, salt } = await hashPassword(oneTimePassword)
const sq = (s) => `'${String(s).replace(/'/g, "''")}'`
const sql = `UPDATE users SET password_hash=${sq(hash)}, password_salt=${sq(salt)}, must_change=1 WHERE email=${sq(email)} COLLATE NOCASE;
DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE email=${sq(email)} COLLATE NOCASE);`

const tmp = `.admin-reset-${Date.now ? '' : ''}${Math.floor(Number(process.hrtime.bigint() % 1000000n))}.sql`
writeFileSync(tmp, sql)
try {
  for (const t of targets) {
    process.stdout.write(`Resetting ${email} → D1 (${t.replace('--', '')}) … `)
    execFileSync(WRANGLER, ['d1', 'execute', DB, t, `--file=${tmp}`, '--yes'], { stdio: ['ignore', 'ignore', 'inherit'] })
    console.log('ok')
  }
} finally {
  unlinkSync(tmp)
}
console.log('\n──────────────────────────────────────────────')
console.log(`  email:             ${email}`)
console.log(`  new one-time pass: ${oneTimePassword}`)
console.log('──────────────────────────────────────────────')
console.log('  Log in with this, then set a new password. All existing sessions were revoked.')
