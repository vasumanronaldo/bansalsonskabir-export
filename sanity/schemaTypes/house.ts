// "The House" documents (docs/03): timeline, process, FAQ.
import { defineField, defineType } from 'sanity'

export const timelineEvent = defineType({
  name: 'timelineEvent',
  title: 'Timeline event',
  type: 'document',
  fields: [
    defineField({ name: 'year', title: 'Year', type: 'number', validation: (r) => r.required() }),
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
  ],
  orderings: [{ title: 'Year', name: 'year', by: [{ field: 'year', direction: 'asc' }] }],
  preview: { select: { year: 'year', title: 'title', media: 'image' }, prepare: ({ year, title, media }) => ({ title: title || '', subtitle: year ? String(year) : '', media }) },
})

export const processStep = defineType({
  name: 'processStep',
  title: 'Process step',
  type: 'document',
  fields: [
    defineField({ name: 'order', title: 'Order', type: 'number', validation: (r) => r.required() }),
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
  ],
  orderings: [{ title: 'Order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { order: 'order', title: 'title', media: 'image' }, prepare: ({ order, title, media }) => ({ title: title || '', subtitle: order ? `Step ${order}` : '', media }) },
})

export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({ name: 'question', title: 'Question', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'answer', title: 'Answer', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'group', title: 'Group', type: 'string', description: 'Which page/section this belongs to, e.g. craftsmanship, appointment.' }),
  ],
  preview: { select: { title: 'question', subtitle: 'group' } },
})
