// Reads `wrangler d1 execute --json` output from stdin and prints the public path
// (/collections/<collection>/<piece>) for the first result row, or nothing.
//   npx wrangler d1 execute DB --remote --json --command "SELECT c.slug c, p.slug p …" | node scripts/piece-path.mjs
let s = ''
process.stdin.on('data', (d) => (s += d))
process.stdin.on('end', () => {
  try {
    const r = JSON.parse(s)[0]?.results?.[0]
    process.stdout.write(r && r.c && r.p ? `/collections/${r.c}/${r.p}` : '')
  } catch {
    process.stdout.write('')
  }
})
