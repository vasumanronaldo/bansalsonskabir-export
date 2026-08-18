// Seed D1 from the file content (content/client/04-collections.json,
// 05-pieces.json). Idempotent by slug — safe to re-run. After this, D1 is the
// source of truth for pieces + collections (docs/10 § 8). Writes remote + local
// by default. Collections and pieces use their slug as the primary key so re-runs
// upsert cleanly.
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs'

const DB = 'bansal-sons-admin'
const WRANGLER = process.platform === 'win32' ? 'wrangler' : './node_modules/.bin/wrangler'
const targets = process.argv.includes('--remote-only') ? ['--remote'] : process.argv.includes('--local-only') ? ['--local'] : ['--remote', '--local']

const sq = (s) => `'${String(s ?? '').replace(/'/g, "''")}'`
const collections = JSON.parse(readFileSync('content/client/04-collections.json', 'utf8')).collections ?? []
const pieces = JSON.parse(readFileSync('content/client/05-pieces.json', 'utf8')).pieces ?? []

const lines = ['PRAGMA foreign_keys = ON;']
collections.forEach((c, i) => {
  lines.push(
    `INSERT INTO collections (id, slug, title, intro, sort_order, published) VALUES (${sq(c.slug)}, ${sq(c.slug)}, ${sq(c.title)}, ${sq(c.introText ?? c.shortDescription ?? '')}, ${c.order ?? i}, 1)
     ON CONFLICT(slug) DO UPDATE SET title=excluded.title, intro=excluded.intro, sort_order=excluded.sort_order;`,
  )
})
pieces.forEach((p, i) => {
  lines.push(
    `INSERT INTO pieces (id, slug, name, subtitle, collection_id, description, sort_order, featured, published) VALUES (${sq(p.slug)}, ${sq(p.slug)}, ${sq(p.name)}, ${sq(p.subtitle ?? '')}, ${sq(p.collection)}, ${sq(p.description ?? '')}, ${i}, ${i < 6 ? 1 : 0}, 1)
     ON CONFLICT(slug) DO UPDATE SET name=excluded.name, subtitle=excluded.subtitle, collection_id=excluded.collection_id, description=excluded.description, updated_at=datetime('now');`,
  )
})

const tmp = '.admin-seed.sql'
writeFileSync(tmp, lines.join('\n'))
try {
  for (const t of targets) {
    process.stdout.write(`Seeding ${collections.length} collections + ${pieces.length} pieces → D1 (${t.replace('--', '')}) … `)
    execFileSync(WRANGLER, ['d1', 'execute', DB, t, `--file=${tmp}`, '--yes'], { stdio: ['ignore', 'ignore', 'inherit'] })
    console.log('ok')
  }
} finally {
  unlinkSync(tmp)
}
