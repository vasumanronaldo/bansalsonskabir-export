import 'server-only'
// Public resolver for editable long-form prose: the edited body from D1 when
// present, otherwise the committed file body. Never throws — a missing row or
// unavailable D1 falls back to the committed content.
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { DOC_BY_KEY } from './admin/documents'

export async function resolveDocument(key: string): Promise<string> {
  const fallback = DOC_BY_KEY[key]?.body() ?? ''
  try {
    const row = await getCloudflareContext().env.DB.prepare('SELECT body FROM documents WHERE key = ?').bind(key).first<{ body: string }>()
    return row?.body ?? fallback
  } catch {
    return fallback
  }
}
