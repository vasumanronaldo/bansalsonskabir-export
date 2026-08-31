import 'server-only'
// Public resolver for editable long-form prose: the edited body from D1 when
// present, otherwise the committed file body. Never throws — a missing row or
// unavailable D1 falls back to the committed content.
import { readRow } from '@/lib/site-db'
import { DOC_BY_KEY } from './admin/documents'

export async function resolveDocument(key: string): Promise<string> {
  const fallback = DOC_BY_KEY[key]?.body() ?? ''
  const row = await readRow<{ body: string }>('SELECT body FROM documents WHERE key = ?', key)
  return row?.body ?? fallback
}
