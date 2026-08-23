// PATCH /admin/api/settings — save business details + per-page SEO overrides.
import { requireApiMutation } from '@/lib/admin/guard'
import { saveSettings, SEO_PAGES, BUSINESS_FIELDS, type SettingsForm, type Business, type Seo } from '@/lib/admin/settings-db'
import { jsonError } from '@/lib/admin/http'

export const dynamic = 'force-dynamic'
const json = (d: unknown, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

export async function PATCH(req: Request): Promise<Response> {
  const g = await requireApiMutation(req)
  if ('error' in g) return g.error
  const b = (await req.json().catch(() => null)) as { business?: Record<string, unknown>; seo?: Record<string, { title?: unknown; description?: unknown }> } | null
  if (!b) return jsonError(400, 'Invalid body')

  const business = {} as Business
  for (const f of BUSINESS_FIELDS) business[f.name] = str(b.business?.[f.name])
  const seo: Record<string, Seo> = {}
  for (const p of SEO_PAGES) seo[p.key] = { title: str(b.seo?.[p.key]?.title), description: str(b.seo?.[p.key]?.description) }

  const form: SettingsForm = { business, seo }
  await saveSettings(form, g.session.user.id)
  return json({ ok: true })
}
