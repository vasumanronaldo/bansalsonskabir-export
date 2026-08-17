export interface Env {
  DB: D1Database;              // wrangler d1
  MEDIA: R2Bucket;             // wrangler r2
  SESSION_PEPPER: string;      // wrangler secret put SESSION_PEPPER
  PREVIEW_SECRET: string;      // wrangler secret put PREVIEW_SECRET
  ENVIRONMENT: 'development' | 'production';
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'editor';
  csrf: string;
}
