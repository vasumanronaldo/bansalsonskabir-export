import { defineField, defineType } from 'sanity'

export const CATEGORY_LIST = [
  'bridal', 'diamond', 'polki', 'kundan', 'jadau', 'temple',
  'platinum', 'gold', 'gemstone', 'mens', 'everyday',
] as const

export const STATUS_LIST = ['available', 'inWorkshop', 'sold', 'archive'] as const

export const piece = defineType({
  name: 'piece',
  title: 'Piece',
  type: 'document',
  groups: [
    { name: 'main', title: 'Piece', default: true },
    { name: 'images', title: 'Photography' },
    { name: 'dossier', title: "Maker's dossier" },
  ],
  fields: [
    defineField({ name: 'reference', title: 'Reference number', type: 'string', description: 'The house reference, e.g. BSJ-0417', group: 'main', validation: (r) => r.required() }),
    defineField({ name: 'title', title: 'Title', type: 'string', group: 'main', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, group: 'main', validation: (r) => r.required() }),
    defineField({ name: 'collection', title: 'Collection', type: 'reference', to: [{ type: 'collection' }], group: 'main' }),
    defineField({ name: 'category', title: 'Category', type: 'string', options: { list: [...CATEGORY_LIST] }, group: 'main', validation: (r) => r.required() }),
    defineField({ name: 'status', title: 'Status', type: 'string', options: { list: [...STATUS_LIST], layout: 'radio' }, initialValue: 'available', group: 'main' }),
    defineField({ name: 'description', title: 'Description', type: 'array', of: [{ type: 'block' }], group: 'main' }),
    defineField({ name: 'isBespoke', title: 'Made as a bespoke commission', type: 'boolean', initialValue: false, group: 'main' }),
    defineField({ name: 'featured', title: 'Feature on the home page', type: 'boolean', initialValue: false, group: 'main' }),
    defineField({ name: 'consentOnFile', title: 'Client consent on file', type: 'boolean', initialValue: false, description: 'Required before any client name or face linked to this piece is published.', group: 'main' }),
    defineField({ name: 'publishedAt', title: 'Published at', type: 'datetime', group: 'main' }),

    defineField({ name: 'images', title: 'Images', type: 'array', of: [{ type: 'image', options: { hotspot: true } }], group: 'images', description: 'Shot on charcoal, stone or black marble — never a white sweep.' }),

    defineField({ name: 'dossier', title: "The maker's dossier", type: 'dossier', group: 'dossier' }),
    // NO price field. Do not add one, ever. (docs/03)
  ],
  preview: {
    select: { reference: 'reference', title: 'title', media: 'images.0' },
    prepare: ({ reference, title, media }) => ({ title: title || 'Untitled piece', subtitle: reference, media }),
  },
})
