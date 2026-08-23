import 'server-only'
// Dashboard metrics. Only numbers that lead to an action (docs/11 § 2) — no
// vanity metrics, no charts.
import { adminEnv } from './session'

export interface ActivityRow {
  action: string
  entity: string
  label: string | null
  user: string | null
  at: string
}
export interface DashboardData {
  newAppointments: number
  piecesMissingAlt: number
  journalDrafts: number
  weekAppointments: number
  mostRecent: string | null
  recent: ActivityRow[]
  unpublished: { pieces: number; journal: number; collections: number }
}

const num = (r: { n: number } | null) => r?.n ?? 0

export async function getDashboard(): Promise<DashboardData> {
  const db = adminEnv().DB
  const [newAppt, piecesAlt, jDrafts, week, unpubP, unpubJ, unpubC, activity] = await Promise.all([
    db.prepare("SELECT COUNT(*) AS n FROM enquiries WHERE status = 'new'").first<{ n: number }>(),
    db.prepare("SELECT COUNT(DISTINCT p.id) AS n FROM pieces p JOIN images i ON i.entity_type = 'piece' AND i.entity_id = p.id WHERE p.deleted_at IS NULL AND i.deleted_at IS NULL AND TRIM(i.alt) = ''").first<{ n: number }>(),
    db.prepare('SELECT COUNT(*) AS n FROM journal_posts WHERE published = 0 AND deleted_at IS NULL').first<{ n: number }>(),
    db.prepare("SELECT COUNT(*) AS n, MAX(submitted_at) AS recent FROM enquiries WHERE submitted_at >= datetime('now', '-7 days')").first<{ n: number; recent: string | null }>(),
    db.prepare('SELECT COUNT(*) AS n FROM pieces WHERE published = 0 AND deleted_at IS NULL').first<{ n: number }>(),
    db.prepare('SELECT COUNT(*) AS n FROM journal_posts WHERE published = 0 AND deleted_at IS NULL').first<{ n: number }>(),
    db.prepare('SELECT COUNT(*) AS n FROM collections WHERE published = 0').first<{ n: number }>(),
    db
      .prepare(
        `SELECT a.action, a.entity, a.entity_id, a.at, u.name AS user, p.name AS piece_name, j.title AS journal_title
           FROM audit_log a
           LEFT JOIN users u ON a.user_id = u.id
           LEFT JOIN pieces p ON a.entity = 'piece' AND a.entity_id = p.id
           LEFT JOIN journal_posts j ON a.entity = 'journal' AND a.entity_id = j.id
          ORDER BY a.at DESC LIMIT 8`,
      )
      .all<{ action: string; entity: string; entity_id: string | null; at: string; user: string | null; piece_name: string | null; journal_title: string | null }>(),
  ])

  return {
    newAppointments: num(newAppt),
    piecesMissingAlt: num(piecesAlt),
    journalDrafts: num(jDrafts),
    weekAppointments: num(week),
    mostRecent: week?.recent ?? null,
    recent: (activity.results ?? []).map((r) => ({
      action: r.action,
      entity: r.entity,
      label: r.piece_name ?? r.journal_title ?? null,
      user: r.user,
      at: r.at,
    })),
    unpublished: { pieces: num(unpubP), journal: num(unpubJ), collections: num(unpubC) },
  }
}
