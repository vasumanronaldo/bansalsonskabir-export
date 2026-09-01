import 'server-only'
// Public redirect lookup. When a slug changes the admin records from→to here, and
// the dynamic pages consult this before 404-ing so old links keep working.
import { readRow } from '@/lib/site-db'

export async function lookupRedirect(fromPath: string): Promise<string | null> {
  const row = await readRow<{ to_path: string }>('SELECT to_path FROM redirects WHERE from_path = ?', fromPath)
  return row?.to_path ?? null
}
