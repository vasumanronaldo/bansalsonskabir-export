// The people at the bench (docs/04 § Maison #4). A referred visitor is verifying
// PEOPLE. CONSENT GATE (CLAUDE.md, docs): a person's NAME is never rendered
// without consentOnFile — in any environment. Without consent: in production the
// entry is omitted entirely; in development it shows anonymously with an amber
// flag so the family can see who is staged and chase consent. Never clients.
import { getPeople } from '@/lib/client-content'
import { DraftFlag } from '@/components/DraftFlag'
import { Placeholder } from '@/components/ui/Placeholder'
import { Display, Body, Label } from '@/components/type'

interface Person {
  name: string
  role: string
  since: number | null
  consentOnFile: boolean
  note?: string
}

const DEV = process.env.NODE_ENV !== 'production'

export function PeopleBench({ people: provided }: { people?: Person[] } = {}) {
  const file = provided === undefined ? getPeople() : null
  const people = provided ?? (file!.data.people as Person[]) ?? []

  // Public: only consented people. Dev on the file path also surfaces unconsented
  // ones — but anonymously (no name) — so the gate is visible and actionable.
  // Data from the portal is already published-filtered upstream.
  const visible = people.filter((p) => p.consentOnFile || (file && DEV))
  if (!visible.length) return null

  return (
    <div>
      <Label className="mb-8 block">
        At the bench
        {file && <DraftFlag meta={file._meta} />}
      </Label>
      <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p, i) => {
          const named = p.consentOnFile
          return (
            <li key={i}>
              <Placeholder ratio="4:5" ground="charcoal" seed={p.role} label={named ? `${p.name} — portrait` : 'Portrait — consent pending'} />
              <div className="mt-4">
                {named ? (
                  <Display size="sm" as="h3">
                    {p.name}
                  </Display>
                ) : (
                  <p className="font-[family-name:var(--font-display)] text-[length:var(--text-display-sm)] text-stone">
                    Name withheld
                    <span className="ml-2 align-middle rounded-none bg-[#fbe6c2] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.12em] text-[#7a5a00]">
                      consent not on file
                    </span>
                  </p>
                )}
                <Label className="mt-2 block">
                  {p.role}
                  {p.since ? ` · since ${p.since}` : ''}
                </Label>
                {p.note && (
                  <Body size="sm" muted className="mt-3">
                    {p.note}
                  </Body>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
