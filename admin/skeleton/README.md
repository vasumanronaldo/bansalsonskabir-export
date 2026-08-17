# Skeleton

Reference implementations of the parts that are easy to get subtly wrong.
Copy into `src/` during the build; these are not wired up.

| File | Covers |
|---|---|
| `auth.ts` | PBKDF2 hashing, constant-time compare, session issue/verify |
| `routes.md` | Every endpoint, method, auth requirement and response |
| `env.d.ts` | Worker bindings |

Everything else — screens, forms, list views — is ordinary work. Build it from
`docs/10-admin-portal.md` § 6.
