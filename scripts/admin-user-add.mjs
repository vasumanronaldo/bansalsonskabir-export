// Seed an admin user. Generates a one-time password, hashes it with the SAME
// PBKDF2 parameters as lib/admin/auth.ts (PBKDF2-SHA256, 600k iters, 16-byte
// salt, base64), sets must_change=1, and prints the password ONCE. Writes to
// both remote and local D1 by default so production and `wrangler dev` match.
//
//   pnpm admin:user:add chetan@example.com "Chetan Bansal"          # editor
//   pnpm admin:user:add vasu@example.com   "Vasu Vij" --owner       # owner
//   ... --remote-only | --local-only
import { execFileSync } from 'node:child_process'
import { writeFileSync, unlinkSync, existsSync } from 'node:fs'

const DB = 'bansal-sons-admin'
const WRANGLER = process.platform === 'win32' ? 'wrangler' : './node_modules/.bin/wrangler'

const args = process.argv.slice(2)
const flags = new Set(args.filter((a) => a.startsWith('--')))
const [email, name] = args.filter((a) => !a.startsWith('--'))
if (!email || !name) {
  console.error('Usage: admin:user:add <email> "<name>" [--owner] [--remote-only|--local-only]')
  process.exit(1)
}
const role = flags.has('--owner') ? 'owner' : 'editor'
const targets = flags.has('--remote-only') ? ['--remote'] : flags.has('--local-only') ? ['--local'] : ['--remote', '--local']

const enc = new TextEncoder()
const b64 = (u8) => Buffer.from(u8).toString('base64')

// Must match lib/admin/auth.ts exactly: Workers caps PBKDF2 at 100k/call, so we
// chain 6 rounds (600k effective), feeding each round's output into the next.
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

// URL-safe one-time password, ~14 chars, no ambiguous punctuation.
const oneTimePassword = b64(crypto.getRandomValues(new Uint8Array(10))).replace(/[+/=]/g, '').slice(0, 14)
const id = crypto.randomUUID()
const sq = (s) => `'${String(s).replace(/'/g, "''")}'`

const { hash, salt } = await hashPassword(oneTimePassword)
const sql = `INSERT INTO users (id, email, name, password_hash, password_salt, role, must_change)
VALUES (${sq(id)}, ${sq(email)}, ${sq(name)}, ${sq(hash)}, ${sq(salt)}, ${sq(role)}, 1);`

if (!existsSync(WRANGLER) && process.platform !== 'win32') {
  console.error(`wrangler not found at ${WRANGLER} — run from the project root after pnpm install.`)
  process.exit(1)
}

const tmp = `.admin-user-${id}.sql`
writeFileSync(tmp, sql)
try {
  for (const target of targets) {
    process.stdout.write(`Seeding ${role} ${email} → D1 (${target.replace('--', '')}) … `)
    execFileSync(WRANGLER, ['d1', 'execute', DB, target, `--file=${tmp}`, '--yes'], { stdio: ['ignore', 'ignore', 'inherit'] })
    console.log('ok')
  }
} catch (e) {
  console.error('\nInsert failed (email may already exist).')
  unlinkSync(tmp)
  process.exit(1)
}
unlinkSync(tmp)

console.log('\n──────────────────────────────────────────────')
console.log(`  ${role.toUpperCase()} account created`)
console.log(`  email:            ${email}`)
console.log(`  one-time password: ${oneTimePassword}`)
console.log('──────────────────────────────────────────────')
console.log('  Give this password by phone, not email. The user must change it on first login.')
