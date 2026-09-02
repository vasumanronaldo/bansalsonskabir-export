// Reads `wrangler d1 list --json` from stdin and prints the uuid of the named
// database (empty string if not found). d1 list is authoritative; d1 info exits 0
// even for a missing database, so it can't be used to test existence.
//   npx wrangler d1 list --json | node scripts/d1-id.mjs <name>
const name = process.argv[2]
let s = ''
process.stdin.on('data', (d) => (s += d))
process.stdin.on('end', () => {
  try {
    const list = JSON.parse(s)
    const row = Array.isArray(list) ? list.find((r) => r.name === name) : null
    process.stdout.write(row ? row.uuid || row.database_id || '' : '')
  } catch {
    process.stdout.write('')
  }
})
