import { defineField, defineType } from 'sanity'

export const JOURNAL_CATEGORIES = ['education', 'craft', 'house', 'guides'] as const

export const journalPost = defineType({
  name: 'journalPost',
  title: 'Journal post',
  type: 'document',
  groups: [
    { name: 'main', title: 'Article', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', group: 'main', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, group: 'main', validation: (r) => r.required() }),
    defineField({ name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3, group: 'main' }),
    defineField({ name: 'coverImage', title: 'Cover image', type: 'image', options: { hotspot: true }, group: 'main' }),
    defineField({ name: 'body', title: 'Body', type: 'array', of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }], group: 'main' }),
    defineField({ name: 'category', title: 'Category', type: 'string', options: { list: [...JOURNAL_CATEGORIES] }, group: 'main' }),
    defineField({ name: 'author', title: 'Author', type: 'string', group: 'main' }),
    defineField({ name: 'publishedAt', title: 'Published at', type: 'datetime', group: 'main' }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      fields: [
        defineField({ name: 'title', title: 'Meta title', type: 'string' }),
        defineField({ name: 'description', title: 'Meta description', type: 'text', rows: 2 }),
      ],
    }),
  ],
  orderings: [{ title: 'Newest', name: 'newest', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'category', media: 'coverImage' } },
})
