import 'server-only'
// Guards for admin API routes: valid session, and (for mutations) a matching
// CSRF token in the X-CSRF-Token header.
import { adminEnv } from './session'
import { getSession, checkCsrf } from './auth'
import { jsonError } from './http'

type SessionUser = { id: string; email: string; name: string; role: string }

export async function requireApiSession(req: Request): Promise<{ session: { user: SessionUser; csrf: string; sessionId: string } } | { error: Response }> {
  const session = await getSession(adminEnv(), req)
  if (!session) return { error: jsonError(401, 'Not signed in') }
  return { session }
}

export async function requireApiMutation(req: Request): Promise<{ session: { user: SessionUser; csrf: string; sessionId: string } } | { error: Response }> {
  const guard = await requireApiSession(req)
  if ('error' in guard) return guard
  if (!checkCsrf(req, guard.session.csrf)) return { error: jsonError(403, 'Bad CSRF token') }
  return guard
}
