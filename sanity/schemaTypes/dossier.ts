// The Maker's Dossier (docs/03 § Sanity schema, docs/07 § D1) — the site's
// differentiator. Every field is OPTIONAL at the record level; the page renders
// only what exists. NO price field anywhere. Do not add one, ever.
import { defineField, defineType } from 'sanity'

export const metalLine = defineType({
  name: 'metalLine',
  title: 'Metal',
  type: 'object',
  fields: [
    defineField({ name: 'karat', title: 'Karat / purity', type: 'string', description: 'e.g. 22K, 18K, 950 platinum' }),
    defineField({ name: 'colour', title: 'Colour', type: 'string', description: 'e.g. yellow, white, rose' }),
    defineField({ name: 'weight', title: 'Weight (grams)', type: 'number' }),
  ],
  preview: { select: { karat: 'karat', colour: 'colour', weight: 'weight' }, prepare: ({ karat, colour, weight }) => ({ title: [karat, colour].filter(Boolean).join(' · '), subtitle: weight ? `${weight} g` : '' }) },
})

export const stoneLine = defineType({
  name: 'stoneLine',
  title: 'Stone',
  type: 'object',
  fields: [
    defineField({ name: 'type', title: 'Stone', type: 'string', description: 'e.g. diamond, emerald, uncut polki' }),
    defineField({ name: 'cut', title: 'Cut', type: 'string' }),
    defineField({ name: 'count', title: 'Number of stones', type: 'number' }),
    defineField({ name: 'carat', title: 'Total carat weight', type: 'number' }),
    defineField({ name: 'certifier', title: 'Certified by', type: 'string', options: { list: ['GIA', 'IGI', 'none'] } }),
    defineField({ name: 'reportNumber', title: 'Certificate / report number', type: 'string' }),
    defineField({ name: 'treatment', title: 'Treatment', type: 'text', rows: 2, description: 'Any treatment the stone has had. Say "none" if untreated — disclosure builds trust.' }),
    defineField({ name: 'treatmentDisclosedAt', title: 'Treatment disclosed on', type: 'date' }),
  ],
  preview: { select: { type: 'type', count: 'count', carat: 'carat' }, prepare: ({ type, count, carat }) => ({ title: type || 'Stone', subtitle: [count && `${count}×`, carat && `${carat} ct`].filter(Boolean).join(' · ') }) },
})

export const operationLine = defineType({
  name: 'operationLine',
  title: 'Bench operation',
  type: 'object',
  fields: [
    defineField({ name: 'step', title: 'Step', type: 'string', description: 'e.g. casting, stone-setting, polishing' }),
    defineField({ name: 'performedBy', title: 'Performed by', type: 'string' }),
    defineField({ name: 'hours', title: 'Hours', type: 'number' }),
  ],
  preview: { select: { step: 'step', by: 'performedBy', hours: 'hours' }, prepare: ({ step, by, hours }) => ({ title: step || 'Operation', subtitle: [by, hours && `${hours} h`].filter(Boolean).join(' · ') }) },
})

export const outsourcedStep = defineType({
  name: 'outsourcedStep',
  title: 'Outsourced step',
  type: 'object',
  description: 'Leave empty when nothing is outsourced — "made entirely in-house" is the claim.',
  fields: [
    defineField({ name: 'step', title: 'Step', type: 'string' }),
    defineField({ name: 'reason', title: 'Reason', type: 'string' }),
  ],
})

export const hallmark = defineType({
  name: 'hallmark',
  title: 'Hallmark',
  type: 'object',
  fields: [
    defineField({ name: 'bisMark', title: 'BIS mark', type: 'string' }),
    defineField({ name: 'huid', title: 'HUID', type: 'string', description: 'Six-character Hallmark Unique ID' }),
    defineField({ name: 'assayedAt', title: 'Assayed at', type: 'string' }),
  ],
})

export const serviceRecord = defineType({
  name: 'serviceRecord',
  title: 'Service record',
  type: 'object',
  fields: [
    defineField({ name: 'date', title: 'Date', type: 'date' }),
    defineField({ name: 'work', title: 'Work done', type: 'string' }),
    defineField({ name: 'chargeable', title: 'Chargeable?', type: 'boolean' }),
  ],
})

export const dossier = defineType({
  name: 'dossier',
  title: "The maker's dossier",
  type: 'object',
  description: 'The full record of how this piece was made. Fill in what you know — the page shows only the fields you complete. There is deliberately no price here.',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: 'grossWeight', title: 'Gross weight (grams)', type: 'number' }),
    defineField({ name: 'netMetalWeight', title: 'Net metal weight (grams)', type: 'number' }),
    defineField({ name: 'metals', title: 'Metals', type: 'array', of: [{ type: 'metalLine' }] }),
    defineField({ name: 'stones', title: 'Stones', type: 'array', of: [{ type: 'stoneLine' }] }),
    defineField({ name: 'operations', title: 'Bench operations', type: 'array', of: [{ type: 'operationLine' }] }),
    defineField({ name: 'benchHours', title: 'Total bench hours', type: 'number' }),
    defineField({ name: 'outsourcedSteps', title: 'Outsourced steps', type: 'array', of: [{ type: 'outsourcedStep' }], description: 'Empty means the piece was made entirely in-house.' }),
    defineField({ name: 'hallmark', title: 'Hallmark', type: 'hallmark' }),
    defineField({ name: 'qcSignedOffBy', title: 'Quality checked & signed off by', type: 'string' }),
    defineField({ name: 'completedAt', title: 'Completed on', type: 'date' }),
    defineField({ name: 'serviceHistory', title: 'Service history', type: 'array', of: [{ type: 'serviceRecord' }] }),
  ],
})
