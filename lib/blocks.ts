import 'server-only'
// Reads editable page-copy blocks for a page. Always returns every registered
// key: the committed default first, overridden by a D1 row when one exists. If D1
// is unavailable the defaults stand — a page can never break on a missing block.
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { BLOCKS } from '@/lib/admin/blocks-registry'

export async function getPageBlocks(page: string): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  for (const [key, def] of Object.entries(BLOCKS)) if (def.page === page) out[key] = def.default
  try {
    const { results } = await getCloudflareContext()
      .env.DB.prepare('SELECT key, value FROM page_blocks WHERE page = ?')
      .bind(page)
      .all<{ key: string; value: string }>()
    for (const r of results ?? []) if (r.key in out) out[r.key] = r.value
  } catch {
    // D1 not available (e.g. at build) — committed defaults stand.
  }
  return out
}
