-- Bansal Sons Jewellers — admin dashboard v2 schema delta
-- Apply AFTER admin/schema.sql
--   wrangler d1 execute bansal-sons --file=admin/schema-v2.sql
-- No price column exists in this file and none may be added.

PRAGMA foreign_keys = ON;

-- ---------- journal ----------

CREATE TABLE IF NOT EXISTS journal_posts (
  id              TEXT PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  excerpt         TEXT NOT NULL DEFAULT '',
  body            TEXT NOT NULL DEFAULT '',
  category        TEXT NOT NULL DEFAULT 'house'
                  CHECK (category IN ('education','craft','house','guides')),
  author          TEXT NOT NULL DEFAULT '',
  cover_image_id  TEXT REFERENCES images(id) ON DELETE SET NULL,
  published       INTEGER NOT NULL DEFAULT 0,
  published_at    TEXT,
  seo_title       TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  deleted_at      TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  created_by      TEXT REFERENCES users(id),
  updated_by      TEXT REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_journal_pub ON journal_posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_cat ON journal_posts(category, published_at DESC);

-- ---------- editable page copy ----------

CREATE TABLE IF NOT EXISTS page_blocks (
  key           TEXT PRIMARY KEY,   -- 'home.hero.headline', 'maison.room.body'
  value         TEXT NOT NULL,
  default_value TEXT NOT NULL,      -- seeded from content/client/, enables reset
  label         TEXT NOT NULL DEFAULT '',
  page          TEXT NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by    TEXT REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_blocks_page ON page_blocks(page, sort_order);

-- ---------- house content ----------

CREATE TABLE IF NOT EXISTS timeline_events (
  id          TEXT PRIMARY KEY,
  year        INTEGER NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_id    TEXT REFERENCES images(id) ON DELETE SET NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  published   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS process_steps (
  id          TEXT PRIMARY KEY,
  sort_order  INTEGER NOT NULL,
  title       TEXT NOT NULL,
  duration    TEXT,                -- null renders no duration
  description TEXT NOT NULL DEFAULT '',
  image_id    TEXT REFERENCES images(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS people (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT '',
  since           INTEGER,
  note            TEXT NOT NULL DEFAULT '',
  portrait_id     TEXT REFERENCES images(id) ON DELETE SET NULL,
  consent_on_file INTEGER NOT NULL DEFAULT 0,   -- 0 = never renders publicly
  sort_order      INTEGER NOT NULL DEFAULT 0,
  published       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS faqs (
  id         TEXT PRIMARY KEY,
  grp        TEXT NOT NULL DEFAULT 'buying'
             CHECK (grp IN ('buying','visiting','bespoke','aftercare')),
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  published  INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_faqs_grp ON faqs(grp, sort_order);

-- ---------- newsletter ----------

CREATE TABLE IF NOT EXISTS subscribers (
  id              TEXT PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE COLLATE NOCASE,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','unsubscribed')),
  confirm_token   TEXT,
  confirmed_at    TEXT,
  unsubscribed_at TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------- images become shared across entity types ----------

ALTER TABLE images ADD COLUMN entity_type TEXT NOT NULL DEFAULT 'piece';
ALTER TABLE images ADD COLUMN entity_id   TEXT;
UPDATE images SET entity_type = 'piece', entity_id = piece_id WHERE entity_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_images_entity ON images(entity_type, entity_id, sort_order);

-- ---------- enquiries: internal handling ----------

ALTER TABLE enquiries ADD COLUMN handled_by  TEXT REFERENCES users(id);
ALTER TABLE enquiries ADD COLUMN handled_at  TEXT;
-- notified_at was already added in step 11a (the appointment persist+notify fix);
-- re-adding it here would fail with a duplicate-column error.
-- ALTER TABLE enquiries ADD COLUMN notified_at TEXT;   -- when the email went out

-- 2FA (TOTP) — opt-in per user; default off so no one can be locked out.
ALTER TABLE users ADD COLUMN totp_secret TEXT;
ALTER TABLE users ADD COLUMN totp_enabled INTEGER NOT NULL DEFAULT 0;

-- Long-form editable page prose (founder, pricing, privacy, ...).
CREATE TABLE IF NOT EXISTS documents (key TEXT PRIMARY KEY, body TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT (datetime('now')), updated_by TEXT REFERENCES users(id));
