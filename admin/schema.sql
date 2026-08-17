-- Bansal Sons Jewellers — admin portal schema (Cloudflare D1 / SQLite)
-- Apply:  wrangler d1 execute bansal-sons --file=admin/schema.sql
-- NOTE: there is no price column in this file and none may be added.

PRAGMA foreign_keys = ON;

-- ---------- auth ----------

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,            -- PBKDF2-SHA256, 600k iters, base64
  password_salt TEXT NOT NULL,            -- 16 random bytes, base64
  role          TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner','editor')),
  must_change   INTEGER NOT NULL DEFAULT 1,
  disabled      INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,            -- sha256(token). NEVER store the token.
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  csrf       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  ip         TEXT,
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user    ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS login_attempts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  identifier TEXT NOT NULL,               -- lowercased email as submitted
  ip         TEXT NOT NULL,
  ok         INTEGER NOT NULL,
  at         TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_attempts_id ON login_attempts(identifier, at);
CREATE INDEX IF NOT EXISTS idx_attempts_ip ON login_attempts(ip, at);

-- ---------- content ----------

CREATE TABLE IF NOT EXISTS collections (
  id         TEXT PRIMARY KEY,
  slug       TEXT NOT NULL UNIQUE,
  title      TEXT NOT NULL,
  intro      TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  published  INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pieces (
  id            TEXT PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  subtitle      TEXT NOT NULL DEFAULT '',
  collection_id TEXT REFERENCES collections(id) ON DELETE SET NULL,
  description   TEXT NOT NULL DEFAULT '',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  featured      INTEGER NOT NULL DEFAULT 0,   -- shows in the homepage grid
  published     INTEGER NOT NULL DEFAULT 0,   -- nothing is live until ticked
  deleted_at    TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  created_by    TEXT REFERENCES users(id),
  updated_by    TEXT REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_pieces_collection ON pieces(collection_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_pieces_published  ON pieces(published, deleted_at);

CREATE TABLE IF NOT EXISTS images (
  id         TEXT PRIMARY KEY,
  piece_id   TEXT NOT NULL REFERENCES pieces(id) ON DELETE CASCADE,
  r2_key     TEXT NOT NULL UNIQUE,        -- pieces/{piece_id}/{uuid}.webp
  r2_key_640 TEXT,                        -- pieces/{piece_id}/{uuid}@640.webp
  width      INTEGER NOT NULL,
  height     INTEGER NOT NULL,
  bytes      INTEGER NOT NULL,
  alt        TEXT NOT NULL DEFAULT '',    -- required before publish
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover   INTEGER NOT NULL DEFAULT 0,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_images_piece ON images(piece_id, sort_order);

-- one cover per piece
CREATE UNIQUE INDEX IF NOT EXISTS idx_images_one_cover
  ON images(piece_id) WHERE is_cover = 1 AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS redirects (
  from_path  TEXT PRIMARY KEY,            -- written when a slug is deliberately changed
  to_path    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,            -- 'contact' | 'hours' | 'homepage'
  value      TEXT NOT NULL,               -- JSON blob
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by TEXT REFERENCES users(id)
);

-- ---------- enquiries ----------

CREATE TABLE IF NOT EXISTS enquiries (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL,
  email          TEXT,
  preferred_date TEXT,
  preferred_time TEXT,
  occasion       TEXT,
  interest       TEXT,                    -- JSON array
  budget         TEXT,
  requirement    TEXT,
  contact_method TEXT,
  status         TEXT NOT NULL DEFAULT 'new'
                 CHECK (status IN ('new','contacted','booked','closed')),
  note           TEXT NOT NULL DEFAULT '',
  submitted_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status, submitted_at DESC);

-- ---------- audit ----------

CREATE TABLE IF NOT EXISTS audit_log (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id   TEXT REFERENCES users(id),
  action    TEXT NOT NULL,                -- create | update | publish | unpublish | delete | login
  entity    TEXT NOT NULL,                -- piece | image | collection | settings | user | session
  entity_id TEXT,
  detail    TEXT,                         -- JSON, changed fields only
  at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_at ON audit_log(at DESC);
