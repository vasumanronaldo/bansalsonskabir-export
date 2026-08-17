import { defineCloudflareConfig } from '@opennextjs/cloudflare'

// Runs the full Next.js app (App Router, API routes, next/og) on Cloudflare
// Workers. Default config: no external incremental cache — fine for this mostly
// static, content-driven site. Add an R2 cache here later if ISR needs it.
export default defineCloudflareConfig({})
