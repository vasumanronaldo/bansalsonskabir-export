// Rewrites wrangler.jsonc in place with a new worker name, D1 (name + id) and R2
// bucket, preserving all other formatting and comments via targeted replacement.
//   node scripts/patch-wrangler.mjs <workerName> <d1Name> <d1Id> <bucketName>
import { readFileSync, writeFileSync } from 'node:fs'

const [workerName, d1Name, d1Id, bucketName] = process.argv.slice(2)
if (!workerName || !d1Name || !d1Id || !bucketName) {
  console.error('Usage: patch-wrangler.mjs <workerName> <d1Name> <d1Id> <bucketName>')
  process.exit(1)
}

const path = 'wrangler.jsonc'
let src = readFileSync(path, 'utf8')

const replace = (label, re, value) => {
  if (!re.test(src)) {
    console.error(`patch-wrangler: could not find ${label} in ${path}`)
    process.exit(1)
  }
  src = src.replace(re, `$1"${value}"`)
}

// Worker name is the first top-level "name" key (before any nested block).
replace('worker name', /("name":\s*)"[^"]*"/, workerName)
replace('database_name', /("database_name":\s*)"[^"]*"/, d1Name)
replace('database_id', /("database_id":\s*)"[^"]*"/, d1Id)
replace('bucket_name', /("bucket_name":\s*)"[^"]*"/, bucketName)

writeFileSync(path, src)
console.log(`    wrangler.jsonc → name=${workerName} d1=${d1Name} (${d1Id}) r2=${bucketName}`)
