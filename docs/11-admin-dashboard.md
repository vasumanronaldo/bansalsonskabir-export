# 11 — Admin dashboard v2

Supersedes the scope in `docs/10-admin-portal.md` § 2. That version deliberately
left the journal, the policy pages and most page copy in files. This version puts
**everything the family might want to change** behind the login.

`10-admin-portal.md` still governs auth, image handling and security. Nothing in
this file relaxes any of it.

---

## 0 — Urgent: check the appointment form first

Before building any dashboard, establish whether `POST /api/appointment` persists
anything. Three possibilities:

1. **It writes to a table** — good, the data exists and just needs a screen.
2. **It emails only** — the data is in an inbox, recoverable, but not queryable.
3. **It does nothing** — every enquiry submitted since launch is gone.

If it is 2 or 3, fix that in the first commit, before the dashboard. A jewellery
house silently dropping appointment requests is worse than having no form at all.
Then check the live site's form actually submits end to end, with a real
submission, and confirm it lands.

---

## 1 — Complete inventory of what becomes editable

Everything below moves into the portal. The old rule ("things that change once a
year stay in files") is dropped — the family asked for full control.

### Content types (full CRUD)

| Type | Fields | Notes |
|---|---|---|
| **Journal posts** | title, slug, excerpt, cover image, body, category, author, published_at, draft/published, seo_title, seo_description | The gap you hit. Full editor |
| **Pieces** | as `10-admin-portal.md` § 3 | Already specced |
| **Collections** | title, slug, intro, order, published | |
| **Timeline events** | year, title, description, image, order | Drives `/legacy` |
| **Process steps** | order, title, duration, description, image | Drives `/craftsmanship` and `/bespoke` |
| **People** | name, role, since, note, portrait, consent_on_file | Nothing renders without consent ticked |
| **FAQs** | group, question, answer, order | Groups: buying, visiting, bespoke, aftercare |

### Page copy (edit in place, no CRUD)

| Page | Editable blocks |
|---|---|
| Home | hero eyebrow, headline, lede, the five proof rows, the Bansal Standard lines, section CTAs |
| Legacy | hero, founder prose, manifesto |
| Maison | hero, "the room" copy, "what a visit is like" lines |
| Craftsmanship | hero, "how a price is built", "aftercare, buyback and exchange" |
| Bespoke | hero, lede, commission terms |
| Appointment | intro line, the reassurance line under the button |
| Privacy | full text |
| 404 | headline and body |

Store as a `page_blocks` table keyed `page.block`, value markdown. Rendered as
paragraphs — no rich text editor. Every block has a "reset to default" action that
restores the committed text from `content/client/`, so a bad edit is one click to
undo rather than a git operation.

### Operational data

| Screen | Does |
|---|---|
| **Appointments** | List, filter by status and date, open a request, change status, add an internal note, **export CSV**. Status: new → contacted → booked → closed |
| **Newsletter** | Subscribers list, subscribed/unsubscribed, export CSV |
| **Media library** | Every uploaded image, reusable across pieces, journal and pages. Search by filename and alt text. Shows where each image is used, and blocks deletion if in use |
| **Redirects** | from → to, for changed slugs |
| **Users** | Owner only. Add, disable, change role |
| **Audit log** | Who changed what, when. Filterable by user and entity |
| **Backup** | One button, downloads the full JSON export |

### Settings

Contact details, hours, valet, metro, Instagram handle, GST display toggle,
homepage featured selection and order, per-page SEO title and description
overrides, OG image.

---

## 2 — The dashboard screen

Landing page after login. Five blocks, no charts, no vanity metrics:

```
NEEDS YOU
  3 new appointment requests          → /admin/appointments?status=new
  2 pieces missing alt text           → blocked from publishing
  1 journal post in draft             → /admin/journal

THIS WEEK
  Appointment requests        7
  Most recent                 2 hours ago

QUICK ACTIONS
  [ Add a piece ]  [ Write a journal post ]  [ Upload photographs ]

RECENT ACTIVITY
  Karan published "Kanakprabha"                    14:22
  Chetan updated hours                             11:05
  Rajeev added 4 photographs to "Ratneshvari"      09:40

UNPUBLISHED
  Pieces 3 · Journal 1 · Collections 0
```

**"Needs you" is the whole point of the screen.** Anything that is blocked,
waiting, or unanswered surfaces here. A dashboard nobody has to act on is a
dashboard nobody opens.

---

## 3 — Schema additions

Applies on top of `admin/schema.sql`. Full DDL in `admin/schema-v2.sql`.

```
journal_posts     id, slug, title, excerpt, body, category, author,
                  cover_image_id → images(id), published, published_at,
                  seo_title, seo_description, deleted_at,
                  created_at, updated_at, created_by, updated_by

page_blocks       key (e.g. 'home.hero.headline'), value, default_value,
                  updated_at, updated_by

timeline_events   id, year, title, description, image_id, sort_order, published
process_steps     id, sort_order, title, duration, description, image_id
people            id, name, role, since, note, portrait_id,
                  consent_on_file, sort_order, published
faqs              id, grp, question, answer, sort_order, published

subscribers       id, email, status, confirmed_at, unsubscribed_at, created_at

images            + entity_type, entity_id   -- so images serve pieces,
                                                journal and pages alike
```

`images` gains `entity_type` / `entity_id` so the media library is genuinely
shared rather than piece-only. Migrate existing rows to
`entity_type = 'piece'`.

`enquiries` already exists in v1. If the live form is not writing to it, that is
step 0.

---

## 4 — The journal editor

Same shape as the piece editor: one screen, explicit save, no autosave.

- Title, slug (frozen after first publish, with an explicit change action that
  writes a redirect), excerpt, category, author, cover image
- Body is a **plain textarea**, markdown-lite: blank line for a paragraph, `> ` for
  a pull quote, `## ` for a subheading. Nothing else. A live preview pane beside
  it. No WYSIWYG — four occasional editors will produce cleaner pages with three
  rules than with a toolbar
- SEO title and description, with character counters and a Google-result preview
- Draft by default. `published_at` is set on first publish and editable after,
  so a post can carry its real date
- Preview via signed token, same mechanism as pieces

**Publish gate:** excerpt present, cover image present with alt text, SEO
description present. Blocked button with the reason shown, not a dismissible
warning.

---

## 5 — Appointments

The screen the family will use most after the editor.

- Default view: `status = new`, newest first
- Each row: name, phone, occasion, preferred date, submitted time, status
- Open a request → all fields, a WhatsApp deep link (`wa.me/91…`) and a `tel:`
  link, status buttons, internal note field
- **CSV export** of any filtered view
- **Email on new submission** to `bansalsonsjewellers18@gmail.com` via Resend,
  with the enquiry inline so it is actionable from a phone without logging in.
  This matters more than the dashboard itself
- Retention: enquiries older than the period stated in the privacy policy are
  purged by a scheduled Worker. Whatever the policy says must actually happen —
  otherwise the policy is false

**Privacy.** This screen holds customers' names and phone numbers. It is the most
sensitive surface in the build. No enquiry data in URLs, `Cache-Control: no-store`,
no analytics on `/admin`, and CSV export writes an `audit_log` row every time.

---

## 6 — Build order

Each step commits and stops.

- [ ] **11a** — Step 0. Verify and fix appointment persistence. Wire the Resend
      notification. Confirm with a real submission on the live site.
- [ ] **11b** — `admin/schema-v2.sql` applied. `images` migrated to
      `entity_type`/`entity_id`. Media library screen.
- [ ] **11c** — Journal: schema, editor, publish gate, preview, public
      `/journal` and `/journal/[slug]` reading from D1.
- [ ] **11d** — Appointments screen: list, filter, detail, status, note, CSV,
      retention job.
- [ ] **11e** — The dashboard screen, "needs you" first.
- [ ] **11f** — `page_blocks`: table, editor, reset-to-default, and every page
      reading blocks with the committed file as fallback.
- [ ] **11g** — Timeline, process steps, people, FAQs — four small CRUD screens
      sharing one list/edit pattern.
- [ ] **11h** — Settings, SEO overrides, subscribers, redirects, audit log
      viewer, backup button.

11a is the only urgent one. The rest can land over a week.

---

## 7 — Still deliberately out

Versioning and rollback beyond reset-to-default · scheduled publishing ·
multi-language · comments · roles beyond owner and editor · a WYSIWYG editor ·
analytics dashboards inside the portal · 2FA.

**2FA is the one to revisit.** Once this portal holds customer names and phone
numbers, it stops being a content tool and becomes a system holding personal
data. Add TOTP before adding anything else on this list.
