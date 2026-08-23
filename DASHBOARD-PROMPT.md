# Dashboard v2 — prompts

Eight steps, `docs/11-admin-dashboard.md`. **11a is urgent; run it on its own,
now.** The rest can land over a week.

---

## Step 11a — appointments must not be disappearing

Run this before anything else, in its own session.

```
Urgent check, then fix. Read docs/11-admin-dashboard.md section 0 only.

Trace what POST /api/appointment actually does right now. Report which of these
is true:
  1. It writes to the enquiries table in D1.
  2. It only sends an email.
  3. It does nothing — the data is discarded.

Do not guess from the file name. Read the handler and follow it through.

If it is 2 or 3: fix it. Every submission must write a row to enquiries AND send
an email to bansalsonsjewellers18@gmail.com via Resend with the enquiry inline,
so it is actionable from a phone without logging in. Record notified_at.

Also check: does the form on the live site actually reach that endpoint? Check
the client-side handler, not just the route.

Then tell me how to test it end to end on the live site, and whether any
submissions since launch are recoverable from anywhere.

Commit as "fix(appointment): persist and notify on submission". Then stop.
```

---

## Step 11b — schema and media library

```
Read docs/11-admin-dashboard.md sections 1 and 3. Nothing else.

Apply admin/schema-v2.sql. Migrate existing images rows to entity_type='piece'
with entity_id = piece_id. Verify the migration before continuing — count rows
before and after.

Then build the media library screen: every uploaded image, grid view, search by
filename and alt text, shows where each image is used, blocks deletion when in
use. Reuses the existing upload path from Phase 10 — browser-side resize, magic
byte validation, 8MB cap, 640 variant. Do not write a second upload path.

/qa, commit, stop.
```

---

## Step 11c — the journal

```
Read docs/11-admin-dashboard.md section 4 and section 1 (journal row). Nothing else.

Build the journal end to end: admin list, editor, publish gate, preview, and the
public /journal and /journal/[slug] pages reading from D1.

The editor mirrors the piece editor — one screen, explicit save, never autosave.
Body is a plain textarea with three rules only: blank line = paragraph,
"> " = pull quote, "## " = subheading. Live preview pane beside it. No WYSIWYG
toolbar: four occasional editors produce cleaner pages with three rules than with
a toolbar.

Publish is gated on excerpt, cover image, cover alt text, and SEO description all
being present. Disabled button stating the reason, not a dismissible warning.

published_at is set on first publish and stays editable, so a post can carry its
real date.

/qa, commit, stop.
```

---

## Step 11d — appointments screen

```
Read docs/11-admin-dashboard.md section 5. Nothing else.

Build the appointments screen: default filter status=new newest first, filter by
status and date range, detail view with a wa.me deep link and a tel: link, status
buttons (new → contacted → booked → closed), internal note, CSV export of any
filtered view.

Then the retention job: a scheduled Worker that purges enquiries older than the
period stated in content/client/08-privacy.md. Read the period from that file —
do not hardcode it. If the file says [TK], do not build the job; tell me the
policy needs a number first.

This screen holds customers' names and phone numbers — the most sensitive surface
in the build. No enquiry data in URLs, no analytics on /admin, Cache-Control:
no-store, and every CSV export writes an audit_log row.

/qa, commit, stop.
```

---

## Step 11e — the dashboard

```
Read docs/11-admin-dashboard.md section 2. Nothing else.

Build /admin as the landing screen, exactly the five blocks in that section, in
that order. "Needs you" comes first and is the point of the page — anything
blocked, waiting or unanswered surfaces there.

No charts. No vanity metrics. No "total page views". If a number does not lead to
an action, leave it out.

/qa, commit, stop.
```

---

## Steps 11f–11h — the rest

Three more sessions, one prompt each:

```
Read docs/11-admin-dashboard.md section 1 (page copy table) and section 3
(page_blocks). Build 11f: the page_blocks table seeded from content/client/, the
block editor grouped by page, reset-to-default per block, and every page reading
its blocks with the committed file as fallback so nothing breaks if a row is
missing. /qa, commit, stop.
```

```
Build 11g: timeline events, process steps, people and FAQs. Four small CRUD
screens sharing one list/edit component — do not write four separate UIs.
Nobody renders publicly without consent_on_file = 1 on the people table.
Seed each table from its content/client/ file. /qa, commit, stop.
```

```
Build 11h: settings, per-page SEO overrides, subscribers list with CSV export,
redirects, audit log viewer, and the backup button (full JSON export, every table
except sessions). /qa, commit, stop.
```

---

## Two things worth deciding now

**2FA.** Once 11d ships, this portal holds customers' names and phone numbers. It
stops being a content tool and becomes a system holding personal data on a
shared login. I would add TOTP before 11f — it is an evening's work and it is the
difference between a leaked password being an inconvenience and being a breach.

**What the privacy policy promises.** `content/client/08-privacy.md` currently
says enquiries are kept for `[TK]` months. Whatever number goes in there has to
be enforced by the retention job in 11d. A stated retention period with no job
behind it is a false statement in a published policy — pick a number the family
is comfortable with, then make the code true.
