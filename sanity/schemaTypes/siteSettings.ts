// Singleton. Text facts (phone, hours, address…) are developer-edited in
// content/client/00-settings.json and stay there (docs/03 § Migration). This
// document exists mainly for assets that need Sanity's pipeline — the map image
// and the default OG image — plus optional overrides.
import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Settings',
  type: 'document',
  fields: [
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'whatsapp', title: 'WhatsApp', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'object',
      fields: [
        defineField({ name: 'line1', type: 'string', title: 'Line 1' }),
        defineField({ name: 'line2', type: 'string', title: 'Line 2' }),
        defineField({ name: 'city', type: 'string', title: 'City' }),
        defineField({ name: 'postalCode', type: 'string', title: 'Postal code' }),
      ],
    }),
    defineField({
      name: 'hours',
      title: 'Opening hours',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'days', type: 'string', title: 'Days' }),
            defineField({ name: 'open', type: 'string', title: 'Opens' }),
            defineField({ name: 'close', type: 'string', title: 'Closes' }),
            defineField({ name: 'label', type: 'string', title: 'Label (e.g. Closed)' }),
          ],
        },
      ],
    }),
    defineField({ name: 'instagram', title: 'Instagram handle', type: 'string' }),
    defineField({ name: 'gstin', title: 'GSTIN', type: 'string' }),
    defineField({ name: 'mapImage', title: 'Static map image', type: 'image' }),
    defineField({ name: 'defaultOgImage', title: 'Default share image', type: 'image' }),
  ],
  preview: { prepare: () => ({ title: 'Settings' }) },
})
