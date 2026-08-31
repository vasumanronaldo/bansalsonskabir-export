'use client'
// Long-form prose editor. One large field per document (the page essays and
// policies). Save persists; Reset restores the committed text. Light markdown is
// preserved verbatim — blank line = new paragraph, "> " = pull quote, "## " = heading.
import { useState } from 'react'

interface Doc {
  key: string
  label: string
  page: string
  body: string
  edited: boolean
}

const PAGE_LABEL: Record<string, string> = { legacy: 'Legacy', maison: 'Maison', craftsmanship: 'Craftsmanship', bespoke: 'Bespoke', privacy: 'Privacy' }

function DocField({ doc, csrf }: { doc: Doc; csrf: string }) {
  const [value, setValue] = useState(doc.body)
  const [saved, setSaved] = useState(doc.body)
  const [edited, setEdited] = useState(doc.edited)
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle')
  const [msg, setMsg] = useState('')
  const dirty = value !== saved

  async function send(method: 'PATCH' | 'POST', body?: unknown) {
    setStatus('saving')
    setMsg('')
    try {
      const res = await fetch(`/admin/api/documents/${encodeURIComponent(doc.key)}`, {
        method,
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: body ? JSON.stringify(body) : undefined,
      })
      const data = (await res.json().catch(() => ({}))) as { body?: string; edited?: boolean; error?: string }
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
      const v = data.body ?? value
      setValue(v)
      setSaved(v)
      setEdited(Boolean(data.edited))
      setStatus('ok')
    } catch (e) {
      setStatus('err')
      setMsg(e instanceof Error ? e.message : 'Failed')
    }
  }

  return (
    <details className="rounded-xl border border-hairline bg-white">
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-3.5">
        <span className="text-sm text-charcoal">{doc.label.replace(/^[^—]+—\s*/, '')}</span>
        <span className="flex items-center gap-3">
          {edited && <span className="font-[family-name:var(--font-mono)] text-[0.56rem] uppercase tracking-[0.16em] text-gold">Edited</span>}
          <span className="font-[family-name:var(--font-mono)] text-[0.55rem] uppercase tracking-[0.16em] text-stone">{PAGE_LABEL[doc.page] ?? doc.page}</span>
        </span>
      </summary>
      <div className="border-t border-hairline px-5 py-4">
        <textarea
          value={value}
          onChange={(e) => { setValue(e.target.value); setStatus('idle') }}
          rows={Math.min(24, Math.max(6, value.split('\n').length + 1))}
          className="w-full resize-y border border-hairline bg-pearl/40 px-3 py-2 font-[family-name:var(--font-mono)] text-[0.8rem] leading-relaxed text-charcoal focus:border-gold focus:outline-none"
        />
        <div className="mt-2 flex items-center gap-3 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em]">
          <button onClick={() => send('PATCH', { body: value })} disabled={!dirty || status === 'saving'} className="border border-gold px-3 py-1.5 text-gold transition-colors hover:bg-gold hover:text-obsidian disabled:cursor-not-allowed disabled:opacity-30">
            {status === 'saving' ? 'Saving…' : 'Save'}
          </button>
          {edited && (
            <button onClick={() => { if (confirm('Restore the original wording for this section?')) send('POST') }} disabled={status === 'saving'} className="text-stone hover:text-charcoal">
              Reset to default
            </button>
          )}
          {status === 'ok' && !dirty && <span className="text-[#3f7d3f]">Saved</span>}
          {status === 'err' && <span className="text-[#a23a3a]">{msg}</span>}
        </div>
      </div>
    </details>
  )
}

export function DocumentEditor({ docs, csrf }: { docs: Doc[]; csrf: string }) {
  return (
    <div className="space-y-3">
      {docs.map((d) => <DocField key={d.key} doc={d} csrf={csrf} />)}
    </div>
  )
}
