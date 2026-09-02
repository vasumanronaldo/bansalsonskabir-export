// Prepare a wrangler d1 export for import into a FRESH account. Statement-based
// (not line-based) so multi-line string values — e.g. documents.body markdown —
// survive intact.
//   1. NULL the columns that reference the (excluded) users table — created_by,
//      updated_by, user_id — so content doesn't dangle onto users that no longer
//      exist. They are recreated when the new owner is seeded.
//   2. Reorder INSERTs so parent tables precede child tables (FK-safe), since
//      wrangler batches a large --file import and PRAGMA defer_foreign_keys only
//      holds within one batch.
//   node scripts/reorder-snapshot.mjs [data/snapshot.sql]
import { readFileSync, writeFileSync } from 'node:fs'

const file = process.argv[2] || 'data/snapshot.sql'
const NULL_COLS = new Set(['created_by', 'updated_by', 'user_id'])
const ORDER = ['collections', 'pieces', 'images', 'journal_posts', 'timeline_events', 'process_steps', 'people', 'faqs', 'page_blocks', 'documents', 'redirects', 'settings']

// Split SQL into statements on top-level ';', preserving single-quoted strings
// (which may contain ';' and newlines; '' escapes a quote inside a string).
function splitStatements(sql) {
  const out = []
  let cur = ''
  let q = false
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i]
    if (q) {
      if (c === "'" && sql[i + 1] === "'") { cur += "''"; i++ }
      else if (c === "'") { cur += "'"; q = false }
      else cur += c
    } else if (c === "'") { cur += "'"; q = true }
    else if (c === ';') { out.push(cur); cur = '' }
    else cur += c
  }
  if (cur.trim()) out.push(cur)
  return out.map((s) => s.trim()).filter(Boolean)
}

// Split a VALUES(...) body into cells, preserving quoting for a valid re-join.
// Tracks parenthesis depth so commas inside function calls — wrangler encodes
// newlines as replace('…', char(10), '…') — are not treated as cell separators.
function splitCells(s) {
  const out = []
  let cur = ''
  let q = false
  let depth = 0
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (q) {
      if (c === "'" && s[i + 1] === "'") { cur += "''"; i++ }
      else if (c === "'") { cur += "'"; q = false }
      else cur += c
    } else if (c === "'") { cur += "'"; q = true }
    else if (c === '(') { depth++; cur += c }
    else if (c === ')') { depth--; cur += c }
    else if (c === ',' && depth === 0) { out.push(cur); cur = '' }
    else cur += c
  }
  out.push(cur)
  return out
}

const INSERT_RE = /^INSERT INTO "?([a-z_]+)"?\s*\(([^)]*)\)\s*VALUES\s*\((.*)\)$/s

function transform(stmt) {
  const m = stmt.match(INSERT_RE)
  if (!m) return { table: null, sql: stmt }
  const [, table, colList, valsBody] = m
  const cols = colList.split(',').map((c) => c.replace(/["\s]/g, ''))
  if (!cols.some((c) => NULL_COLS.has(c))) return { table, sql: `INSERT INTO "${table}" (${colList}) VALUES(${valsBody})`, nulled: false }
  const cells = splitCells(valsBody)
  if (cells.length !== cols.length) throw new Error(`cell/column mismatch in ${table} (${cells.length} vs ${cols.length})`)
  cols.forEach((c, i) => { if (NULL_COLS.has(c)) cells[i] = 'NULL' })
  return { table, sql: `INSERT INTO "${table}" (${colList}) VALUES(${cells.join(',')})`, nulled: true }
}

const statements = splitStatements(readFileSync(file, 'utf8'))
const header = []
const byTable = new Map()
let nulled = 0

for (const stmt of statements) {
  if (!/^INSERT INTO/i.test(stmt)) { header.push(stmt); continue }
  const { table, sql, nulled: n } = transform(stmt)
  if (n) nulled++
  if (!byTable.has(table)) byTable.set(table, [])
  byTable.get(table).push(sql)
}

const ordered = []
const done = new Set()
for (const t of ORDER) if (byTable.has(t)) { ordered.push(...byTable.get(t)); done.add(t) }
for (const [t, arr] of byTable) if (!done.has(t)) ordered.push(...arr)

const out = [...header.map((h) => `${h};`), ...ordered.map((s) => `${s};`)].join('\n') + '\n'
writeFileSync(file, out)
console.log(`    prepared ${file} → FK-safe order, ${nulled} rows had user refs nulled, ${byTable.size} tables`)
