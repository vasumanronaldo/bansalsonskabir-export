// Surgical global types for the Cloudflare bindings the admin portal uses.
// We alias only the binding types via `import(...)` instead of triple-slash
// referencing all of @cloudflare/workers-types, which would replace the DOM lib
// Next relies on (Request/Response/fetch) and break the rest of the build.
declare global {
  type D1Database = import('@cloudflare/workers-types').D1Database
  type R2Bucket = import('@cloudflare/workers-types').R2Bucket

  // The env exposed by @opennextjs/cloudflare's getCloudflareContext().
  interface CloudflareEnv {
    DB: D1Database
    SESSION_PEPPER: string
    PREVIEW_SECRET?: string
    BUCKET?: R2Bucket
  }
}

export {}
