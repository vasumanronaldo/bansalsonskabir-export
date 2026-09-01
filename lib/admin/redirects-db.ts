import 'server-only'
// Records a from→to redirect when a slug changes. Repoints any existing redirect
// that pointed at the old path so chains collapse (a→b then b→c becomes a→c).
import { adminEnv } from './session'
import { audit } from './db'

export async function recordRedirect(fromPath: string, toPath: string, userId: string): Promise<void> {
  if (!fromPath || !toPath || fromPath === toPath) return
  const db = adminEnv().DB
  await db.batch([
    db.prepare('INSERT INTO redirects (from_path, to_path) VALUES (?, ?) ON CONFLICT(from_path) DO UPDATE SET to_path = excluded.to_path').bind(fromPath, toPath),
    // Collapse chains: anything that pointed at the old path now points at the new.
    db.prepare('UPDATE redirects SET to_path = ? WHERE to_path = ?').bind(toPath, fromPath),
  ])
  await audit(userId, 'create', 'redirect', fromPath, { to: toPath })
}
