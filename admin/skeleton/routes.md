# Admin routes

All `/admin/*` responses carry `ADMIN_HEADERS`. All mutations require a valid
session **and** a matching `X-CSRF-Token`. Unauthenticated requests to `/admin/*`
redirect to `/admin/login`; unauthenticated API calls return `401` as JSON.

## Pages

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/admin/login` | none | Redirects to `/admin` if already signed in |
| POST | `/admin/login` | none | Rate limited. Same error and timing for unknown user and wrong password |
| POST | `/admin/logout` | session | Deletes the session row, clears the cookie |
| GET | `/admin` | session | Dashboard |
| GET | `/admin/pieces` | session | List |
| GET | `/admin/pieces/new` | session | |
| GET | `/admin/pieces/:id` | session | Editor |
| GET | `/admin/collections` | session | |
| GET | `/admin/enquiries` | session | |
| GET | `/admin/settings` | session | |
| GET | `/admin/users` | **owner** | |
| GET | `/admin/password` | session | Forced when `must_change = 1` |

## API

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/admin/api/pieces` | session | Create. Slug generated from name, checked unique |
| PATCH | `/admin/api/pieces/:id` | session | Requires `If-Unmodified-Since: updated_at`; `409` on conflict |
| POST | `/admin/api/pieces/:id/publish` | session | `422` if any image lacks alt text |
| POST | `/admin/api/pieces/:id/unpublish` | session | |
| DELETE | `/admin/api/pieces/:id` | session | Soft delete |
| POST | `/admin/api/pieces/reorder` | session | Array of ids |
| POST | `/admin/api/images` | session | Multipart. Validates magic bytes, MIME allowlist, 8MB cap |
| PATCH | `/admin/api/images/:id` | session | Alt text, cover flag |
| DELETE | `/admin/api/images/:id` | session | Soft delete row, delete R2 object |
| POST | `/admin/api/images/reorder` | session | |
| PATCH | `/admin/api/collections/:id` | session | |
| PATCH | `/admin/api/settings/:key` | session | |
| PATCH | `/admin/api/enquiries/:id` | session | Status and note only |
| POST | `/admin/api/users` | **owner** | Returns a one-time password, `must_change = 1` |
| PATCH | `/admin/api/users/:id` | **owner** | Disable, rename, change role. Cannot disable yourself |
| POST | `/admin/api/password` | session | Current password required |

## Public

| Method | Path | Notes |
|---|---|---|
| GET | `/img/:key` | R2 passthrough. `public, max-age=31536000, immutable` |
| GET | `/collections/:c/:p?preview=<token>` | HMAC of piece id + `PREVIEW_SECRET`, 30 min expiry |
| POST | `/api/appointment` | Public form. Writes `enquiries`. Honeypot plus timing check |

## Scripts

```
pnpm admin:migrate        wrangler d1 execute --file=admin/schema.sql
pnpm admin:user:add       seed a user, print a one-time password
pnpm admin:seed           import content/client/05-pieces.json, idempotent by slug
pnpm admin:backup         backups/YYYY-MM-DD.json, all tables except sessions
```
