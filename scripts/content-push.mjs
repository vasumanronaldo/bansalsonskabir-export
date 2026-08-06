#!/usr/bin/env node
/**
 * pnpm content:push
 *
 * Reads the staff-editable dummies (02 timeline, 03 process, 04 collections,
 * 05 pieces, 09 faq) and writes Sanity NDJSON to sanity/import/seed.ndjson.
 *
 * Approval is preserved via Sanity's own draft model: content from an
 * unapproved file imports as a DRAFT (id prefixed `drafts.`), so nothing
 * unconfirmed is ever published. Approved files import as published documents.
 *
 * After it runs:
 *   npx sanity dataset import sanity/import/seed.ndjson production --replace
 *
 * IDs are deterministic, so re-running upserts rather than duplicating.
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CLIENT = join(ROOT, 'content', 'client')
const OUT_DIR = join(ROOT, 'sanity', 'import')
const OUT = join(OUT_DIR, 'seed.ndjson')

const read = (f) => JSON.parse(readFileSync(join(CLIENT, f), 'utf8'))

let keySeq = 0
const key = () => `k${(keySeq++).toString(36)}`
const stamp = (type, obj) => ({ _type: type, _key: key(), ...obj })
const idFor = (approved, id) => (approved ? id : `drafts.${id}`)
const slug = (current) => ({ _type: 'slug', current })
const portableText = (text) =>
  text ? [{ _type: 'block', _key: key(), style: 'normal', children: [{ _type: 'span', _key: key(), text: String(text) }] }] : undefined

const docs = []

// ── 04 collections ──
{
  const { _approved, collections } = read('04-collections.json')
  for (const c of collections) {
    docs.push({
      _id: idFor(_approved, `collection-${c.slug}`),
      _type: 'collection',
      title: c.title,
      slug: slug(c.slug),
      order: c.order ?? null,
      shortDescription: c.shortDescription ?? null,
      introText: portableText(c.introText),
    })
  }
}

// ── 05 pieces ── (collection slug == category enum, conveniently)
{
  const { _approved, pieces } = read('05-pieces.json')
  for (const p of pieces) {
    const d = p.dossier || {}
    const dossier = {
      grossWeight: d.grossWeight,
      netMetalWeight: d.netMetalWeight,
      benchHours: d.benchHours,
      qcSignedOffBy: d.qcSignedOffBy,
      completedAt: d.completedAt ? String(d.completedAt) : undefined,
      operations: Array.isArray(d.operations)
        ? d.operations.map((o) => (typeof o === 'string' ? stamp('operationLine', { step: o }) : stamp('operationLine', o)))
        : undefined,
      outsourcedSteps: Array.isArray(d.outsourcedSteps) ? d.outsourcedSteps.map((o) => stamp('outsourcedStep', o)) : undefined,
      stones: Array.isArray(d.stones) ? d.stones.map((s) => stamp('stoneLine', s)) : undefined,
      metals: Array.isArray(d.metals) ? d.metals.map((m) => stamp('metalLine', m)) : undefined,
      hallmark: d.hallmark
        ? { _type: 'hallmark', bisMark: d.hallmark.bisMark === true ? 'BIS' : d.hallmark.bisMark || undefined, huid: d.hallmark.huid, assayedAt: d.hallmark.assayedAt != null ? String(d.hallmark.assayedAt) : undefined }
        : undefined,
      serviceHistory: Array.isArray(d.serviceHistory) ? d.serviceHistory.map((s) => stamp('serviceRecord', s)) : undefined,
    }
    docs.push({
      _id: idFor(_approved, `piece-${p.slug}`),
      _type: 'piece',
      reference: p.reference,
      title: p.title,
      slug: slug(p.slug),
      collection: { _type: 'reference', _ref: idFor(_approved, `collection-${p.collection}`) },
      category: p.collection, // slugs align with the category enum
      status: p.status || 'archive',
      isBespoke: !!p.isBespoke,
      featured: !!p.featured,
      consentOnFile: !!p.consentOnFile,
      description: portableText(p.description),
      dossier,
    })
  }
}

// ── 02 timeline ──
{
  const { _approved, events } = read('02-timeline.json')
  events.forEach((e, i) => {
    docs.push({ _id: idFor(_approved, `timeline-${e.year}-${i}`), _type: 'timelineEvent', year: e.year, title: e.title, description: e.description ?? null })
  })
}

// ── 03 process ──
{
  const { _approved, steps } = read('03-process.json')
  for (const s of steps) {
    docs.push({ _id: idFor(_approved, `process-${s.order}`), _type: 'processStep', order: s.order, title: s.title, description: s.description ?? null })
  }
}

// ── 09 faq ──
{
  const { _approved, faqs } = read('09-faq.json')
  faqs.forEach((f, i) => {
    docs.push({ _id: idFor(_approved, `faq-${i}`), _type: 'faq', question: f.question, answer: portableText(f.answer), group: f.group ?? null })
  })
}

// strip undefined for clean NDJSON
const clean = (o) => JSON.parse(JSON.stringify(o))
const ndjson = docs.map((d) => JSON.stringify(clean(d))).join('\n') + '\n'

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(OUT, ndjson)

const drafts = docs.filter((d) => d._id.startsWith('drafts.')).length
console.log(`\n  content:push`)
console.log(`  ─────────────────────────────────────────`)
console.log(`  ${docs.length} documents → ${OUT.replace(ROOT + '/', '')}`)
console.log(`  ${drafts} imported as drafts (unapproved), ${docs.length - drafts} published`)
console.log(`\n  Import into Sanity (after a project exists):`)
console.log(`    npx sanity dataset import sanity/import/seed.ndjson production --replace\n`)
