// Sanity → Vercel revalidation webhook (docs/03 § Rendering, docs/06). Sanity
// POSTs here on publish; we verify the shared secret and revalidate. Configure
// the webhook in Sanity with the same SANITY_REVALIDATE_SECRET.
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  const provided = req.headers.get('x-revalidate-secret') || new URL(req.url).searchParams.get('secret')
  if (!secret || provided !== secret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: { _type?: string; slug?: string; collectionSlug?: string } = {}
  try {
    body = (await req.json()) as typeof body
  } catch {
    /* body optional */
  }

  // Revalidate the affected surfaces. Broad by design — the site is small.
  const paths = new Set<string>(['/', '/collections', '/journal'])
  if (body._type === 'piece' && body.slug && body.collectionSlug) paths.add(`/collections/${body.collectionSlug}/${body.slug}`)
  if (body._type === 'collection' && body.slug) paths.add(`/collections/${body.slug}`)
  if (body._type === 'journalPost' && body.slug) paths.add(`/journal/${body.slug}`)

  for (const p of paths) revalidatePath(p)
  return NextResponse.json({ ok: true, revalidated: [...paths] })
}
