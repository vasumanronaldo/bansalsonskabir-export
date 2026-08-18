// POST /admin/api/images — multipart upload. The browser has resized to WebP
// (2400 + 640); the worker verifies by MAGIC BYTES (not filename/MIME), enforces
// the 8MB cap and the allowlist, and stores both variants in R2.
import { requireApiMutation } from '@/lib/admin/guard'
import { sniffImage, putImage, MAX_BYTES } from '@/lib/admin/images'
import { jsonError } from '@/lib/admin/http'

export const dynamic = 'force-dynamic'

const ALLOW = ['image/webp', 'image/jpeg', 'image/png']

export async function POST(req: Request): Promise<Response> {
  const guard = await requireApiMutation(req)
  if ('error' in guard) return guard.error

  const form = await req.formData()
  const pieceId = String(form.get('pieceId') ?? '')
  const full = form.get('full')
  const thumb = form.get('thumb')
  const width = Number(form.get('width') ?? 0)
  const height = Number(form.get('height') ?? 0)
  if (!pieceId || !(full instanceof Blob) || !(thumb instanceof Blob)) return jsonError(400, 'Missing fields')
  if (full.size > MAX_BYTES || thumb.size > MAX_BYTES) return jsonError(413, 'Image exceeds the 8MB limit')

  const fullBuf = await full.arrayBuffer()
  const thumbBuf = await thumb.arrayBuffer()
  if (!ALLOW.includes(sniffImage(fullBuf) ?? '') || !ALLOW.includes(sniffImage(thumbBuf) ?? '')) {
    return jsonError(415, 'That file is not a valid image')
  }

  const image = await putImage(pieceId, fullBuf, thumbBuf, { width, height }, guard.session.user.id)
  return new Response(JSON.stringify({ image }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
}
