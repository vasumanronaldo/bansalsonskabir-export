import 'server-only'
// Audit log viewer (docs/11 § 1). Read-only list, filterable by user and entity.
import { adminEnv } from './session'

export interface AuditEntry {
  id: number
  action: string
  entity: string
  entity_id: string | null
  detail: string | null
  at: string
  user: string | null
}

export async function listAudit(filter: { user?: string; entity?: string; limit?: number }): Promise<AuditEntry[]> {
  const where: string[] = []
  const binds: string[] = []
  if (filter.user) { where.push('a.user_id = ?'); binds.push(filter.user) }
  if (filter.entity) { where.push('a.entity = ?'); binds.push(filter.entity) }
  const sql = `SELECT a.id, a.action, a.entity, a.entity_id, a.detail, a.at, u.name AS user
                 FROM audit_log a LEFT JOIN users u ON a.user_id = u.id
                ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
                ORDER BY a.at DESC LIMIT ?`
  const { results } = await adminEnv().DB.prepare(sql).bind(...binds, filter.limit ?? 200).all<AuditEntry>()
  return results ?? []
}

export async function auditFilters(): Promise<{ users: { id: string; name: string }[]; entities: string[] }> {
  const db = adminEnv().DB
  const [users, entities] = await Promise.all([
    db.prepare('SELECT id, name FROM users ORDER BY name').all<{ id: string; name: string }>(),
    db.prepare('SELECT DISTINCT entity FROM audit_log ORDER BY entity').all<{ entity: string }>(),
  ])
  return { users: users.results ?? [], entities: (entities.results ?? []).map((r) => r.entity) }
}
