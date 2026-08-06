// Studio desk structure (docs/03 § Studio configuration). Plain groupings for
// jewellers, not developers. Settings is a singleton; appointment requests are
// a sorted, read-only list.
import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Bansal Sons')
    .items([
      S.listItem()
        .title('Content')
        .child(
          S.list()
            .title('Content')
            .items([
              S.documentTypeListItem('collection').title('Collections'),
              S.documentTypeListItem('piece').title('Pieces'),
              S.documentTypeListItem('journalPost').title('Journal'),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title('The House')
        .child(
          S.list()
            .title('The House')
            .items([
              S.documentTypeListItem('timelineEvent').title('Timeline'),
              S.documentTypeListItem('processStep').title('Process'),
              S.documentTypeListItem('faq').title('FAQ'),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title('Enquiries')
        .child(
          S.documentTypeList('appointmentRequest')
            .title('Appointment requests')
            .defaultOrdering([{ field: 'submittedAt', direction: 'desc' }]),
        ),
      S.divider(),
      // Settings singleton
      S.listItem()
        .title('Settings')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ])
