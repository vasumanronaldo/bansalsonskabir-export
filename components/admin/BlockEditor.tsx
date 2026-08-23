'use client'
// Page-copy editor (docs/11 § 1). One auto-growing field per block, grouped by
// page. Save persists; Reset restores the committed default. Dirty state and a
// per-field status line make it obvious what has changed and what has saved.
import { useState } from 'react'
import type { BlockRow } from '@/lib/admin/blocks-db'

const PAGE_TITLE: Record<string, string> = { home: 'Home page' }
const H = 'font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.24em] text-stone-light'

function Field({ block, csrf }: { block: BlockRow; csrf: string }) {
  const [value, setValue] = useState(block.value)
  const [saved, setSaved] = useState(block.value)
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle')
  const [msg, setMsg] = useState('')
  const [isDefault, setIsDefault] = useState(!block.edited)
  const dirty = value !== saved
  const multiline = block.default_value.length > 60

  async function send(url: string, method: 'PATCH' | 'POST', body?: unknown) {
    setStatus('saving')
    setMsg('')
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: body ? JSON.stringify(body) : undefined,
      })
      const data = (await res.json().catch(() => ({}))) as { value?: string; edited?: boolean; error?: string }
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
      const v = data.value ?? value
      setValue(v)
      setSaved(v)
      setIsDefault(!data.edited)
      setStatus('ok')
    } catch (e) {
      setStatus('err')
      setMsg(e instanceof Error ? e.message : 'Failed')
    }
  }

  return (
    <div className="border-t border-hairline-inv py-4">
      <div className="flex items-baseline justify-between gap-4">
        <label className="text-sm text-pearl">{block.label}</label>
        {!isDefault && <span className="shrink-0 font-[family-name:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.16em] text-gold-soft">Edited</span>}
      </div>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => { setValue(e.target.value); setStatus('idle') }}
          rows={Math.max(2, Math.ceil(value.length / 70))}
          className="mt-2 w-full resize-y border border-hairline-inv bg-charcoal/40 px-3 py-2 text-pearl focus:border-gold-soft focus:outline-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => { setValue(e.target.value); setStatus('idle') }}
          className="mt-2 w-full border border-hairline-inv bg-charcoal/40 px-3 py-2 text-pearl focus:border-gold-soft focus:outline-none"
        />
      )}
      <div className="mt-2 flex items-center gap-3 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.14em]">
        <button
          onClick={() => send(`/admin/api/blocks/${encodeURIComponent(block.key)}`, 'PATCH', { value })}
          disabled={!dirty || status === 'saving'}
          className="border border-gold-soft px-3 py-1.5 text-gold-soft transition-colors hover:bg-gold-soft hover:text-obsidian disabled:cursor-not-allowed disabled:opacity-30"
        >
          {status === 'saving' ? 'Saving…' : 'Save'}
        </button>
        {!isDefault && (
          <button
            onClick={() => { if (confirm('Restore the original wording for this block?')) send(`/admin/api/blocks/${encodeURIComponent(block.key)}`, 'POST') }}
            disabled={status === 'saving'}
            className="text-stone-light hover:text-pearl"
          >
            Reset to default
          </button>
        )}
        {status === 'ok' && !dirty && <span className="text-[#8fbf8f]">Saved</span>}
        {status === 'err' && <span className="text-[#c98b8b]">{msg}</span>}
      </div>
    </div>
  )
}

export function BlockEditor({ blocks, csrf }: { blocks: BlockRow[]; csrf: string }) {
  const pages = Array.from(new Set(blocks.map((b) => b.page)))
  return (
    <div className="space-y-10">
      {pages.map((page) => (
        <section key={page}>
          <p className={H}>{PAGE_TITLE[page] ?? page}</p>
          <div className="mt-2 border border-hairline-inv bg-charcoal/20 px-5 pb-2">
            {blocks.filter((b) => b.page === page).map((b) => <Field key={b.key} block={b} csrf={csrf} />)}
          </div>
        </section>
      ))}
    </div>
  )
}
