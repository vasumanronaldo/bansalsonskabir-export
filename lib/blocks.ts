import 'server-only'
// Reads editable page-copy blocks for a page. Always returns every registered
// key: the committed default first, overridden by a D1 row when one exists. If D1
// is unavailable the defaults stand — a page can never break on a missing block.
import { readRows } from '@/lib/site-db'
import { BLOCKS } from '@/lib/admin/blocks-registry'

export async function getPageBlocks(page: string): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  for (const [key, def] of Object.entries(BLOCKS)) if (def.page === page) out[key] = def.default
  // D1 rows override the committed defaults; null (build/outage) → defaults stand.
  const rows = await readRows<{ key: string; value: string }>('SELECT key, value FROM page_blocks WHERE page = ?', page)
  for (const r of rows ?? []) if (r.key in out) out[r.key] = r.value
  return out
}
