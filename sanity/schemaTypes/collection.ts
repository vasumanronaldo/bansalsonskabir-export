import { defineField, defineType } from 'sanity'

export const collection = defineType({
  name: 'collection',
  title: 'Collection',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (r) => r.required() }),
    defineField({ name: 'order', title: 'Order', type: 'number', description: 'Lower numbers show first.' }),
    defineField({ name: 'shortDescription', title: 'Short description', type: 'text', rows: 2 }),
    defineField({ name: 'heroImage', title: 'Hero image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'introText', title: 'Introduction', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'pieces', title: 'Pieces', type: 'array', of: [{ type: 'reference', to: [{ type: 'piece' }] }] }),
  ],
  orderings: [{ title: 'Order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'shortDescription', media: 'heroImage' } },
})
