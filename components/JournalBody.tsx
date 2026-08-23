// Markdown-lite journal body, three rules only (docs/11 § 4): blank line =
// paragraph, "> " = pull quote, "## " = subheading. Shared by the public article
// page and the editor's live preview so what you type is what ships.
import { Display, Body } from '@/components/type'

export function JournalBody({ body, className = '' }: { body: string; className?: string }) {
  const blocks = body.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)
  if (blocks.length === 0) return null
  return (
    <div className={`space-y-6 ${className}`}>
      {blocks.map((b, i) => {
        if (b.startsWith('## ')) {
          return (
            <Display key={i} size="sm" as="h2" className="pt-2">
              {b.slice(3).trim()}
            </Display>
          )
        }
        if (b.startsWith('> ')) {
          return (
            <blockquote
              key={i}
              className="border-l-2 border-gold pl-5 font-[family-name:var(--font-display)] text-[length:var(--text-display-sm)] leading-snug text-charcoal"
            >
              {b.slice(2).replace(/\n>?\s?/g, ' ').trim()}
            </blockquote>
          )
        }
        return <Body key={i}>{b.replace(/\n/g, ' ')}</Body>
      })}
    </div>
  )
}
