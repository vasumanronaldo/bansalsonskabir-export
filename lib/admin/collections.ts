// Descriptors for the four small house-content collections (docs/11 § 1, 11g).
// One shared list/edit pattern is driven entirely by these: the field list is
// both the form definition and the column whitelist, so the generic D1 layer
// never interpolates an unbounded column name. Image fields are intentionally
// left off the editor for now — the public blocks fall back to their existing
// photography — and can be added when a picker lands.
export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'checkbox'

export interface Field {
  name: string
  label: string
  type: FieldType
  required?: boolean
  options?: readonly string[] // for select
  help?: string
  default?: string | number | boolean
}

export interface Collection {
  type: string // url slug + audit entity
  table: string
  label: string // plural, for nav/headings
  singular: string
  drives: string // where it shows publicly (shown as a hint)
  fields: Field[]
  orderBy: string // SQL ORDER BY clause (trusted, from here only)
  titleField: string // which field labels a row in the list
  subtitleField?: string
  seedFile: string // content/client json
  seedKey: string // array key inside that json
}

export const COLLECTIONS: Record<string, Collection> = {
  timeline: {
    type: 'timeline',
    table: 'timeline_events',
    label: 'Timeline',
    singular: 'timeline event',
    drives: 'the Legacy page',
    orderBy: 'year ASC',
    titleField: 'title',
    subtitleField: 'year',
    seedFile: '02-timeline.json',
    seedKey: 'events',
    fields: [
      { name: 'year', label: 'Year', type: 'number', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'sort_order', label: 'Manual order (ties)', type: 'number', default: 0 },
      { name: 'published', label: 'Shown on the site', type: 'checkbox', default: true },
    ],
  },
  process: {
    type: 'process',
    table: 'process_steps',
    label: 'Process steps',
    singular: 'process step',
    drives: 'the Craftsmanship and Bespoke pages',
    orderBy: 'sort_order ASC',
    titleField: 'title',
    subtitleField: 'duration',
    seedFile: '03-process.json',
    seedKey: 'steps',
    fields: [
      { name: 'sort_order', label: 'Order', type: 'number', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'duration', label: 'Duration', type: 'text', help: 'Leave blank to show no duration' },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  people: {
    type: 'people',
    table: 'people',
    label: 'People',
    singular: 'person',
    drives: 'the Maison page — a name never appears without consent ticked',
    orderBy: 'sort_order ASC, name ASC',
    titleField: 'name',
    subtitleField: 'role',
    seedFile: '10-people.json',
    seedKey: 'people',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'role', label: 'Role', type: 'text' },
      { name: 'since', label: 'At the bench since (year)', type: 'number' },
      { name: 'note', label: 'Note', type: 'textarea' },
      { name: 'consent_on_file', label: 'Consent on file (required to show the name publicly)', type: 'checkbox', default: false },
      { name: 'sort_order', label: 'Order', type: 'number', default: 0 },
      { name: 'published', label: 'Shown on the site', type: 'checkbox', default: false },
    ],
  },
  faqs: {
    type: 'faqs',
    table: 'faqs',
    label: 'FAQs',
    singular: 'FAQ',
    drives: 'the FAQ sections',
    orderBy: "grp ASC, sort_order ASC",
    titleField: 'question',
    subtitleField: 'grp',
    seedFile: '09-faq.json',
    seedKey: 'faqs',
    fields: [
      { name: 'grp', label: 'Group', type: 'select', required: true, options: ['buying', 'visiting', 'bespoke', 'aftercare'], default: 'buying' },
      { name: 'question', label: 'Question', type: 'text', required: true },
      { name: 'answer', label: 'Answer', type: 'textarea' },
      { name: 'sort_order', label: 'Order', type: 'number', default: 0 },
      { name: 'published', label: 'Shown on the site', type: 'checkbox', default: true },
    ],
  },
  collections: {
    type: 'collections',
    table: 'collections',
    label: 'Collections',
    singular: 'collection',
    drives: 'the Collections page — pieces are assigned to a collection in the piece editor',
    orderBy: 'sort_order ASC, title ASC',
    titleField: 'title',
    subtitleField: 'slug',
    seedFile: '04-collections.json',
    seedKey: 'collections',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug (URL)', type: 'text', required: true, help: 'Lower-case, hyphenated — changing it breaks existing links' },
      { name: 'intro', label: 'Intro', type: 'textarea' },
      { name: 'sort_order', label: 'Order', type: 'number', default: 0 },
      { name: 'published', label: 'Shown on the site', type: 'checkbox', default: true },
    ],
  },
}

export const COLLECTION_TYPES = Object.keys(COLLECTIONS)
