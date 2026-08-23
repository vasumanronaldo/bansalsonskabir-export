'use client'
// One form for all four house-content collections (11g). Fields render from the
// descriptor; the same component creates (POST) or updates (PATCH) by whether an
// id is present. Delete sits behind a confirm. On success we navigate back to
// the list so the change is visible immediately.
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Field } from '@/lib/admin/collections'
import type { Row } from '@/lib/admin/collection-db'

const LABEL = 'block font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-stone'
const INPUT = 'mt-2 w-full border border-hairline bg-white px-3 py-2 text-charcoal focus:border-gold focus:outline-none'

export function CollectionEditor({
  type,
  fields,
  row,
  csrf,
  backHref,
  singular,
}: {
  type: string
  fields: Field[]
  row: Row | null
  csrf: string
  backHref: string
  singular: string
}) {
  const router = useRouter()
  const init: Record<string, string | boolean> = {}
  for (const f of fields) {
    const v = row?.[f.name]
    if (f.type === 'checkbox') init[f.name] = v != null ? Boolean(v) : Boolean(f.default)
    else init[f.name] = v != null ? String(v) : f.default != null ? String(f.default) : ''
  }
  const [form, setForm] = useState(init)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  function set(name: string, value: string | boolean) {
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function save() {
    setBusy(true)
    setErr('')
    const url = row ? `/admin/api/collections/${type}/${row.id}` : `/admin/api/collections/${type}`
    try {
      const res = await fetch(url, {
        method: row ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: JSON.stringify(form),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
      router.push(backHref)
      router.refresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to save')
      setBusy(false)
    }
  }

  async function remove() {
    if (!row || !confirm(`Delete this ${singular}? This cannot be undone.`)) return
    setBusy(true)
    setErr('')
    try {
      const res = await fetch(`/admin/api/collections/${type}/${row.id}`, { method: 'DELETE', headers: { 'X-CSRF-Token': csrf } })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      router.push(backHref)
      router.refresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to delete')
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      {fields.map((f) => (
        <div key={f.name}>
          {f.type === 'checkbox' ? (
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={Boolean(form[f.name])} onChange={(e) => set(f.name, e.target.checked)} className="h-4 w-4 accent-[color:var(--color-gold)]" />
              <span className="text-sm text-charcoal">{f.label}</span>
            </label>
          ) : (
            <label className="block">
              <span className={LABEL}>{f.label}{f.required && <span className="text-gold"> *</span>}</span>
              {f.type === 'textarea' ? (
                <textarea value={String(form[f.name] ?? '')} onChange={(e) => set(f.name, e.target.value)} rows={4} className={`${INPUT} resize-y`} />
              ) : f.type === 'select' ? (
                <select value={String(form[f.name] ?? '')} onChange={(e) => set(f.name, e.target.value)} className={INPUT}>
                  {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type === 'number' ? 'number' : 'text'} value={String(form[f.name] ?? '')} onChange={(e) => set(f.name, e.target.value)} className={INPUT} />
              )}
              {f.help && <span className="mt-1 block text-[0.7rem] text-stone">{f.help}</span>}
            </label>
          )}
        </div>
      ))}

      {err && <p className="text-[#a23a3a]">{err}</p>}

      <div className="flex items-center gap-4 pt-2 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em]">
        <button onClick={save} disabled={busy} className="border border-gold px-4 py-2.5 text-gold transition-colors hover:bg-gold hover:text-obsidian disabled:opacity-40">
          {busy ? 'Saving…' : row ? 'Save changes' : `Add ${singular}`}
        </button>
        <a href={backHref} className="text-stone hover:text-charcoal">Cancel</a>
        {row && <button onClick={remove} disabled={busy} className="ml-auto text-[#a23a3a] hover:text-[#a23a3a]">Delete</button>}
      </div>
    </div>
  )
}
