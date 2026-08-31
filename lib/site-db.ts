import 'server-only'
// The single place every public reader reaches D1. Returns null (rows) / null
// (row) when D1 is unavailable — at build, or a momentary outage — so each caller
// can fall back to its committed content. Behaviour is identical to the per-file
// helpers it replaces; this only unifies the call path (audit Q20).
import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function readRows<T>(sql: string, ...binds: unknown[]): Promise<T[] | null> {
  try {
    const { results } = await getCloudflareContext().env.DB.prepare(sql).bind(...binds).all<T>()
    return results ?? []
  } catch {
    return null
  }
}

export async function readRow<T>(sql: string, ...binds: unknown[]): Promise<T | null> {
  try {
    return (await getCloudflareContext().env.DB.prepare(sql).bind(...binds).first<T>()) ?? null
  } catch {
    return null
  }
}
