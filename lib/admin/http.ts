// Small response helpers shared by the admin route handlers.
export function seeOther(location: string, cookie?: string): Response {
  const res = new Response(null, { status: 303, headers: { Location: location } })
  if (cookie) res.headers.append('Set-Cookie', cookie)
  return res
}

export function jsonError(status: number, error: string): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}
