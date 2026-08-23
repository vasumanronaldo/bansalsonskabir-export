import 'server-only'
// Enquiry retention. The period is READ from the published privacy policy
// (content/client/08-privacy.md) — never hardcoded — so the policy and the code
// can't drift. Purges run at most once/24h, triggered when the appointments
// screen loads (the screen the family uses most). A standalone cron Worker can
// replace this trigger later for a background guarantee; the purge logic is the same.
import { adminEnv } from './session'
import { getPrivacy } from '@/lib/client-content'
import { audit } from './db'

/** Months after the appointment that we keep an enquiry, per the privacy policy. */
export function retentionMonths(): number {
  const m = getPrivacy().body.match(/(\d+)\s*months?\s+after your appointment/i)
  return m ? parseInt(m[1]!, 10) : 12
}

export async function purgeExpiredEnquiries(userId: string): Promise<number> {
  const months = retentionMonths()
  const res = await adminEnv().DB.prepare("DELETE FROM enquiries WHERE submitted_at < datetime('now', ?)").bind(`-${months} months`).run()
  const purged = (res.meta?.changes as number | undefined) ?? 0
  if (purged > 0) await audit(userId, 'delete', 'enquiry', 'retention', { purged, months })
  return purged
}

/** Runs the purge if it hasn't run in the last 24h (guarded by a settings row). */
export async function runRetentionIfDue(userId: string): Promise<void> {
  const db = adminEnv().DB
  const row = await db.prepare("SELECT value FROM settings WHERE key = 'retention_last_run'").first<{ value: string }>()
  const last = row?.value ? Date.parse(row.value) : 0
  if (Number.isFinite(last) && Date.now() - last < 24 * 3600 * 1000) return
  await purgeExpiredEnquiries(userId)
  await db
    .prepare("INSERT INTO settings (key, value, updated_by) VALUES ('retention_last_run', ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')")
    .bind(new Date().toISOString(), userId)
    .run()
}
