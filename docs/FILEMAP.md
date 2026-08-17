# FILEMAP

Generated from `git ls-files` + a grep for content-reader usage. Section → file
and route → file, so change rounds name targets without re-searching.

## Routes
/                          app/(site)/page.tsx
/legacy                    app/(site)/legacy/page.tsx
/craftsmanship             app/(site)/craftsmanship/page.tsx
/maison                    app/(site)/maison/page.tsx
/bespoke                   app/(site)/bespoke/page.tsx
/collections               app/(site)/collections/page.tsx
/collections/[slug]        app/(site)/collections/[slug]/page.tsx
/collections/[slug]/[piece] app/(site)/collections/[slug]/[piece]/page.tsx
/journal                   app/(site)/journal/page.tsx
/journal/[slug]            app/(site)/journal/[slug]/page.tsx
/appointment               app/(site)/appointment/page.tsx
/contact                   app/(site)/contact/page.tsx
/privacy                   app/(site)/privacy/page.tsx
/studio                    app/studio/[[...tool]]/page.tsx
(site layout)              app/(site)/layout.tsx
(root layout, metadata)    app/layout.tsx
robots / sitemap / og      app/robots.ts · app/sitemap.ts · app/api/og/route.tsx

## Sections
Home / Hero                components/blocks/Hero.tsx
Home / Five proofs         components/blocks/Proofs.tsx
Home / Bansal Standard     components/blocks/StandardManifesto.tsx  (lazy: StandardManifestoLazy.tsx)
Home / Selected work grid  components/blocks/SelectedWork.tsx  (card: PieceCard.tsx)
Home / House intro         components/blocks/HouseIntro.tsx
Home / Appointment CTA     components/blocks/AppointmentCta.tsx
Legacy / Founder block     app/(site)/legacy/page.tsx  (prose: components/Prose.tsx)
Legacy / Timeline          components/blocks/Timeline.tsx
Craftsmanship / Sequence   components/blocks/ProcessSequence.tsx
Maison / People bench      components/blocks/PeopleBench.tsx
Maison / Visit block       app/(site)/maison/page.tsx
Collections / Piece card   components/blocks/PieceCard.tsx
Collections / Dossier      components/blocks/DossierRecord.tsx
Journal / Index + card     components/blocks/JournalIndex.tsx · JournalCard.tsx
Appointment / Form         components/blocks/AppointmentForm.tsx
Newsletter                 components/blocks/NewsletterSignup.tsx
CTA band                   components/blocks/CtaBand.tsx

## Content readers
lib/client-content.ts      → defines getSettings, getFounder, getTimeline, getProcess, getCollections, getPieces, getPricing, getAftercare, getPrivacy, getFaq, getPeople, getCommissionTerms
lib/collections.ts         → getCollections, getPieces
lib/pieces.ts              → getPieces, getFeaturedPieces
components/blocks/Hero.tsx  → getSettings
components/blocks/Proofs.tsx → (static copy in component)
components/blocks/StandardManifesto.tsx → (static copy in component)
components/blocks/Timeline.tsx → getTimeline
components/blocks/ProcessSequence.tsx → getProcess
components/blocks/PeopleBench.tsx → getPeople
components/layout/Footer.tsx → getSettings
app/(site)/legacy/page.tsx → getFounder
app/(site)/craftsmanship/page.tsx → getPricing, getAftercare
app/(site)/bespoke/page.tsx → getCommissionTerms
app/(site)/maison/page.tsx → getSettings  (visit block is static — needs getVisit)
app/(site)/appointment/page.tsx → getSettings, getFaq
app/(site)/contact/page.tsx → getSettings
app/(site)/privacy/page.tsx → getPrivacy
app/layout.tsx             → getSettings

## Shared
components/ui/ButtonGhost.tsx   the only button style
components/ui/LinkArrow.tsx     text link with trailing arrow
components/ui/Placeholder.tsx   image slot / demo art
components/ui/fields.tsx        form field primitives
components/Wordmark.tsx         crest + name lockup (the logo)
components/type/*               Display · Body · Label · Lede type scale
components/layout/*             Container · Section · Header · Footer · Hairline
components/DraftFlag.tsx        dev-only unapproved-content flag
