// Prints the first column of the first row from `wrangler d1 execute --json`
// output (empty string if none). Used for COUNT(*)-style probes in setup.sh.
let s = ''
process.stdin.on('data', (d) => (s += d))
process.stdin.on('end', () => {
  try {
    const row = JSON.parse(s)[0]?.results?.[0]
    process.stdout.write(row ? String(Object.values(row)[0] ?? '') : '')
  } catch {
    process.stdout.write('')
  }
})
