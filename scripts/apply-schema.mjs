// Apply a .sql schema file to D1 idempotently. Runs each statement individually
// and TOLERATES "duplicate column" / "already exists" (SQLite can't express
// ADD COLUMN IF NOT EXISTS, and wrangler d1 execute --file aborts at the first
// error, skipping the rest). Any other error fails loudly.
//   node scripts/apply-schema.mjs <d1-name> <file.sql>
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const [db, file] = process.argv.slice(2)
if (!db || !file) {
  console.error('Usage: apply-schema.mjs <d1-name> <file.sql>')
  process.exit(1)
}
const WRANGLER = process.platform === 'win32' ? 'wrangler' : './node_modules/.bin/wrangler'
const TOLERATE = /duplicate column name|already exists/i

// Strip full-line comments, then split on ';' terminators. These schema files
// have no ';' inside string literals or comments, so this split is safe here.
const sql = readFileSync(file, 'utf8')
const statements = sql
  .split('\n')
  .filter((l) => !/^\s*--/.test(l))
  .join('\n')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean)

let applied = 0
let skipped = 0
for (const stmt of statements) {
  try {
    execFileSync(WRANGLER, ['d1', 'execute', db, '--remote', '--command', `${stmt};`, '--yes'], { stdio: ['ignore', 'ignore', 'pipe'] })
    applied++
  } catch (e) {
    const msg = (e.stderr?.toString() || e.message || '')
    if (TOLERATE.test(msg)) {
      skipped++
    } else {
      const head = stmt.replace(/\s+/g, ' ').slice(0, 80)
      console.error(`\napply-schema: FAILED on: ${head}…\n${msg}`)
      process.exit(1)
    }
  }
}
console.log(`    ${file}: ${applied} applied, ${skipped} already present`)
