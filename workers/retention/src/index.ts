// Standalone nightly Worker that enforces enquiry retention as a background
// guarantee (docs/11). Mirrors lib/admin/retention.ts: deletes enquiries older
// than the retention window, records an audit row, and stamps retention_last_run
// so the app's opportunistic purge stays quiet. Bound to the same D1 database.
//
// The window defaults to 12 months (matching the published privacy policy) and
// can be overridden by a settings row `retention_months` without redeploying.

interface D1Result {
  meta?: { changes?: number }
}
interface D1PreparedStatement {
  bind(...args: unknown[]): D1PreparedStatement
  first<T>(): Promise<T | null>
  run(): Promise<D1Result>
}
interface D1Database {
  prepare(query: string): D1PreparedStatement
}
interface Env {
  DB: D1Database
}
interface ScheduledController {
  cron: string
  scheduledTime: number
}

async function purge(env: Env): Promise<void> {
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'retention_months'").first<{ value: string }>()
  const parsed = row ? parseInt(row.value, 10) : NaN
  const months = Number.isFinite(parsed) && parsed > 0 ? parsed : 12

  const res = await env.DB.prepare("DELETE FROM enquiries WHERE submitted_at < datetime('now', ?)").bind(`-${months} months`).run()
  const purged = res.meta?.changes ?? 0

  if (purged > 0) {
    await env.DB.prepare("INSERT INTO audit_log (user_id, action, entity, entity_id, detail) VALUES (NULL, 'delete', 'enquiry', 'retention', ?)")
      .bind(JSON.stringify({ purged, months, by: 'cron' }))
      .run()
  }

  await env.DB.prepare("INSERT INTO settings (key, value) VALUES ('retention_last_run', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')")
    .bind(new Date().toISOString())
    .run()
}

export default {
  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    await purge(env)
  },
}
