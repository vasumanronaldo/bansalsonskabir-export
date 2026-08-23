'use client'
// Status buttons (new → contacted → booked → closed) + internal note for one enquiry.
import { useState } from 'react'

const STATUSES = ['new', 'contacted', 'booked', 'closed'] as const

export function EnquiryActions({ id, status: initial, note: initialNote, csrf }: { id: string; status: string; note: string; csrf: string }) {
  const [status, setStatus] = useState(initial)
  const [note, setNote] = useState(initialNote)
  const [msg, setMsg] = useState<string | null>(null)

  async function patch(body: Record<string, unknown>): Promise<boolean> {
    const r = await fetch(`/admin/api/appointments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }, body: JSON.stringify(body) })
    if (!r.ok) setMsg('Could not save.')
    return r.ok
  }
  async function pick(s: string) {
    if (await patch({ status: s })) {
      setStatus(s)
      setMsg('Status updated.')
    }
  }
  async function saveNote() {
    if (await patch({ note })) setMsg('Note saved.')
  }

  return (
    <div className="mt-10 max-w-xl">
      <p className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-stone-light">Status</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => pick(s)}
            className={`border px-3 py-1.5 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.16em] transition-colors ${
              s === status ? 'border-gold-soft bg-gold-soft text-obsidian' : 'border-hairline-inv text-pearl hover:border-gold-soft'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <p className="mt-6 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-stone-light">Internal note</p>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} className="mt-2 w-full resize-y border border-hairline-inv bg-charcoal px-3 py-2 text-sm text-pearl outline-none focus:border-gold-soft" />
      <div className="mt-2 flex items-center gap-4">
        <button type="button" onClick={saveNote} className="border border-hairline-inv px-4 py-2 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-pearl hover:border-gold-soft">Save note</button>
        {msg && <span className="text-sm text-[#8fbf8f]">{msg}</span>}
      </div>
    </div>
  )
}
