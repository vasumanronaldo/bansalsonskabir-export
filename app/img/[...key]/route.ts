// GET /img/:key — public R2 passthrough. Keys contain a UUID, so the object is
// immutable and cached forever. Only the pieces/ prefix is served.
import { getObject } from '@/lib/admin/images'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }): Promise<Response> {
  const { key } = await params
  const k = key.join('/')
  if (!/^(pieces|journals)\//.test(k) || k.includes('..')) return new Response('Not found', { status: 404 })

  const obj = await getObject(k)
  if (!obj) return new Response('Not found', { status: 404 })

  return new Response(obj.body as unknown as ReadableStream, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType ?? 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable',
      ETag: obj.httpEtag,
    },
  })
}
