// A tiny, safe Markdown renderer for the file-based prose (founder, pricing,
// aftercare, commission terms). Covers the subset those files use: ## / ###
// headings, paragraphs, "- " lists, and **bold**. No dependency, no raw HTML.
//
// [TK] markers render amber in DEVELOPMENT only. In production they render as
// plain text — and `content:status --strict` fails the launch build before any
// [TK] can ship (docs/03), so they never actually reach a live page.
import { Fragment, type ReactNode } from 'react'
import { Display, Body } from '@/components/type'

const DEV = process.env.NODE_ENV !== 'production'

function inline(text: string, keyBase: string): ReactNode[] {
  // Split on **bold** and [TK], preserving delimiters.
  const parts = text.split(/(\*\*[^*]+\*\*|\[TK\])/g).filter(Boolean)
  return parts.map((p, i) => {
    const key = `${keyBase}-${i}`
    if (p.startsWith('**') && p.endsWith('**')) {
      return (
        <strong key={key} className="font-medium text-charcoal">
          {p.slice(2, -2)}
        </strong>
      )
    }
    if (p === '[TK]') {
      return DEV ? (
        <mark key={key} className="bg-[#fbe6c2] px-1 font-[family-name:var(--font-mono)] text-[0.85em] text-[#7a5a00]">
          [TK]
        </mark>
      ) : (
        <Fragment key={key}>[TK]</Fragment>
      )
    }
    return <Fragment key={key}>{p}</Fragment>
  })
}

export function Prose({ markdown, onDark = false }: { markdown: string; onDark?: boolean }) {
  // Strip editorial HTML comments (<!-- ... -->) so notes-to-the-family never
  // leak onto the rendered page.
  const clean = markdown.replace(/<!--[\s\S]*?-->/g, '')
  const blocks = clean.trim().split(/\n{2,}/)
  const out: ReactNode[] = []
  let list: string[] = []

  const flushList = (key: string) => {
    if (!list.length) return
    out.push(
      <ul key={key} className={`ml-5 list-disc space-y-1.5 ${onDark ? 'text-stone-light' : 'text-stone'}`}>
        {list.map((li, i) => (
          <li key={i} className="max-w-[62ch]">
            {inline(li.replace(/^-\s+/, ''), `${key}-${i}`)}
          </li>
        ))}
      </ul>,
    )
    list = []
  }

  blocks.forEach((block, bi) => {
    const key = `b${bi}`
    if (/^-\s+/m.test(block) && block.split('\n').every((l) => /^-\s+/.test(l.trim()) || !l.trim())) {
      list.push(...block.split('\n').filter((l) => l.trim()))
      return
    }
    flushList(`${key}-list`)
    if (block.startsWith('### ')) {
      out.push(
        <Display key={key} size="sm" as="h3" className={onDark ? 'text-pearl' : ''}>
          {inline(block.slice(4), key)}
        </Display>,
      )
    } else if (block.startsWith('## ')) {
      out.push(
        <Display key={key} size="md" as="h2" className={onDark ? 'text-pearl' : ''}>
          {inline(block.slice(3), key)}
        </Display>,
      )
    } else if (block.startsWith('# ')) {
      out.push(
        <Display key={key} size="lg" as="h2" className={onDark ? 'text-pearl' : ''}>
          {inline(block.slice(2), key)}
        </Display>,
      )
    } else {
      out.push(
        <Body key={key} className={onDark ? 'text-stone-light' : 'text-stone'}>
          {inline(block, key)}
        </Body>,
      )
    }
  })
  flushList('tail-list')

  return <div className="space-y-6">{out}</div>
}
