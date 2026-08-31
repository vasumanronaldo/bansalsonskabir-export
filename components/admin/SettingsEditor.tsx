'use client'
// Business details + per-page SEO overrides in one form (11h). Everything
// optional; a blank field means "use the committed default". One Save writes it all.
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BUSINESS_FIELDS, type SettingsForm } from '@/lib/admin/settings-shared'

const LABEL = 'block font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-stone'
const INPUT = 'mt-2 w-full border border-hairline bg-white px-3 py-2 text-charcoal focus:border-gold focus:outline-none'
const SUB = 'font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-stone'

export function SettingsEditor({ form: initial, seoPages, csrf }: { form: SettingsForm; seoPages: { key: string; label: string }[]; csrf: string }) {
  const router = useRouter()
  const [form, setForm] = useState<SettingsForm>(initial)
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle')
  const [msg, setMsg] = useState('')

  const setBiz = (k: string, v: string) => setForm((f) => ({ ...f, business: { ...f.business, [k]: v } }))
  const setSeo = (page: string, field: 'title' | 'description', v: string) =>
    setForm((f) => ({ ...f, seo: { ...f.seo, [page]: { ...f.seo[page]!, [field]: v } } }))

  async function save() {
    setStatus('saving')
    setMsg('')
    try {
      const res = await fetch('/admin/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      setStatus('ok')
      router.refresh()
    } catch (e) {
      setStatus('err')
      setMsg(e instanceof Error ? e.message : 'Failed')
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {BUSINESS_FIELDS.map((f) => (
          <label key={f.name} className={`block ${f.multiline ? 'sm:col-span-2' : ''}`}>
            <span className={LABEL}>{f.label}</span>
            {f.multiline ? (
              <textarea value={String(form.business[f.name] ?? '')} onChange={(e) => setBiz(f.name, e.target.value)} rows={4} className={`${INPUT} resize-y font-[family-name:var(--font-mono)] text-[0.8rem]`} />
            ) : (
              <input value={String(form.business[f.name] ?? '')} onChange={(e) => setBiz(f.name, e.target.value)} className={INPUT} />
            )}
            {f.help && <span className="mt-1 block text-[0.7rem] text-stone">{f.help}</span>}
          </label>
        ))}
      </div>

      <div>
        <p className={SUB}>Search-result wording, per page</p>
        <div className="mt-3 space-y-5">
          {seoPages.map((p) => (
            <div key={p.key} className="border border-hairline bg-white p-4">
              <p className="text-sm text-charcoal">{p.label}</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <input placeholder="Title (blank = default)" value={form.seo[p.key]?.title ?? ''} onChange={(e) => setSeo(p.key, 'title', e.target.value)} className={INPUT} />
                <input placeholder="Description (blank = default)" value={form.seo[p.key]?.description ?? ''} onChange={(e) => setSeo(p.key, 'description', e.target.value)} className={INPUT} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 font-[family-name:var(--font-mono)] text-[0.62rem] uppercase tracking-[0.16em]">
        <button onClick={save} disabled={status === 'saving'} className="border border-gold px-4 py-2.5 text-gold transition-colors hover:bg-gold hover:text-obsidian disabled:opacity-40">
          {status === 'saving' ? 'Saving…' : 'Save settings'}
        </button>
        {status === 'ok' && <span className="text-[#3f7d3f]">Saved</span>}
        {status === 'err' && <span className="text-[#a23a3a]">{msg}</span>}
      </div>
    </div>
  )
}
