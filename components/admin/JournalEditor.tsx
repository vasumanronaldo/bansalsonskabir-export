'use client'
// Journal editor — one screen, explicit save (no autosave), optimistic
// concurrency, 3-rule body with a live preview, publish gated on excerpt +
// cover(+alt) + SEO description (docs/11 § 4).
import { useRef, useState } from 'react'
import { JOURNAL_CATEGORIES } from '@/lib/journal'
import { JournalBody } from '@/components/JournalBody'
import type { JournalRecord } from '@/lib/admin/journal-db'

const SEO_DESC_MAX = 160

async function toWebp(file: File, maxEdge: number): Promise<{ blob: Blob; w: number; h: number }> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, maxEdge / Math.max(bmp.width, bmp.height))
  const w = Math.max(1, Math.round(bmp.width * scale))
  const h = Math.max(1, Math.round(bmp.height * scale))
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  c.getContext('2d')!.drawImage(bmp, 0, 0, w, h)
  bmp.close?.()
  const blob: Blob = await new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('encode failed'))), 'image/webp', 0.86))
  return { blob, w, h }
}

export function JournalEditor({ post, csrf }: { post: JournalRecord; csrf: string }) {
  const [title, setTitle] = useState(post.title)
  const [slug, setSlug] = useState(post.slug)
  const [excerpt, setExcerpt] = useState(post.excerpt)
  const [body, setBody] = useState(post.body)
  const [category, setCategory] = useState(post.category)
  const [author, setAuthor] = useState(post.author)
  const [publishedAt, setPublishedAt] = useState(post.published_at ? post.published_at.slice(0, 10) : '')
  const [seoTitle, setSeoTitle] = useState(post.seo_title)
  const [seoDescription, setSeoDescription] = useState(post.seo_description)
  const [coverImageId, setCoverImageId] = useState(post.cover_image_id)
  const [coverKey, setCoverKey] = useState(post.cover_key_640 ?? post.cover_key ?? null)
  const [coverAlt, setCoverAlt] = useState(post.cover_alt ?? '')
  const [published, setPublished] = useState(post.published === 1)
  const [updatedAt, setUpdatedAt] = useState(post.updated_at)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const frozen = !!post.published_at

  const jsonHeaders = { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }
  const missing = [
    !excerpt.trim() && 'excerpt',
    !coverImageId && 'cover image',
    coverImageId && !coverAlt.trim() && 'cover alt text',
    !seoDescription.trim() && 'SEO description',
  ].filter(Boolean) as string[]

  async function save() {
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch(`/admin/api/journal/${post.id}`, {
        method: 'PATCH',
        headers: jsonHeaders,
        body: JSON.stringify({ title, slug, excerpt, body, category, author, cover_image_id: coverImageId, published_at: publishedAt, seo_title: seoTitle, seo_description: seoDescription, updatedAt }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 409) {
        setMsg({ kind: 'err', text: `${data.updatedBy ? data.updatedBy + ' edited' : 'Edited'} since you opened it — reload; your changes here are unsaved.` })
        return
      }
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setUpdatedAt(data.updatedAt)
      setMsg({ kind: 'ok', text: 'Saved.' })
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message })
    } finally {
      setBusy(false)
    }
  }

  async function togglePublish() {
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch(`/admin/api/journal/${post.id}/${published ? 'unpublish' : 'publish'}`, { method: 'POST', headers: { 'X-CSRF-Token': csrf } })
      if (res.status === 422) {
        const d = await res.json().catch(() => ({}))
        setMsg({ kind: 'err', text: d.error || 'Not ready to publish.' })
        return
      }
      if (!res.ok) throw new Error('Failed')
      setPublished(!published)
      if (!published && !publishedAt) setPublishedAt(new Date().toISOString().slice(0, 10))
      setMsg({ kind: 'ok', text: published ? 'Unpublished.' : 'Published — live within a minute.' })
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message })
    } finally {
      setBusy(false)
    }
  }

  async function onCover(file: File | undefined) {
    if (!file) return
    setUploading(true)
    setMsg(null)
    try {
      const [full, thumb] = await Promise.all([toWebp(file, 2400), toWebp(file, 640)])
      const fd = new FormData()
      fd.append('entityType', 'journal')
      fd.append('entityId', post.id)
      fd.append('full', full.blob, 'full.webp')
      fd.append('thumb', thumb.blob, 'thumb.webp')
      fd.append('width', String(full.w))
      fd.append('height', String(full.h))
      const res = await fetch('/admin/api/images', { method: 'POST', headers: { 'X-CSRF-Token': csrf }, body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setCoverImageId(data.image.id)
      setCoverKey(data.image.r2_key_640)
      setCoverAlt('')
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message })
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  async function saveCoverAlt(alt: string) {
    if (coverImageId) await fetch(`/admin/api/images/${coverImageId}`, { method: 'PATCH', headers: jsonHeaders, body: JSON.stringify({ alt }) })
  }

  const label = 'block font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-stone'
  const field = 'mt-2 block w-full border border-hairline bg-white px-3 py-2 text-charcoal outline-none focus:border-gold'

  return (
    <div className="pb-28">
      <div className="flex items-baseline justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl">{title || 'Untitled post'}</h1>
        <span className={`font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.16em] ${published ? 'text-[#3f7d3f]' : 'text-stone'}`}>{published ? 'Published' : 'Draft'} · /journal/{slug}</span>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <label className={label}>Title<input value={title} onChange={(e) => setTitle(e.target.value)} className={field} /></label>
        <label className={label}>
          Slug {frozen && <span className="text-stone">(frozen — published)</span>}
          <input value={slug} onChange={(e) => setSlug(e.target.value)} disabled={frozen} className={`${field} disabled:opacity-50`} />
        </label>
        <label className={label}>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
            {JOURNAL_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </label>
        <label className={label}>Author<input value={author} onChange={(e) => setAuthor(e.target.value)} className={field} /></label>
        <label className={label}>Published date<input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className={field} /></label>
      </div>

      <label className={`${label} mt-6`}>
        Excerpt
        <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className={`${field} resize-y font-[family-name:var(--font-body)] normal-case tracking-normal`} />
      </label>

      {/* Cover */}
      <div className="mt-6">
        <p className={label}>Cover image</p>
        <div className="mt-2 flex items-start gap-4">
          <div className="h-28 w-40 shrink-0 overflow-hidden bg-pearl">
            {coverKey ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/img/${coverKey}`} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-[0.6rem] uppercase tracking-widest text-stone">None</div>
            )}
          </div>
          <div className="flex-1">
            <button type="button" onClick={() => fileInput.current?.click()} className="border border-hairline px-3 py-1.5 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.16em] text-charcoal hover:border-gold">
              {uploading ? 'Uploading…' : coverKey ? 'Replace cover' : 'Upload cover'}
            </button>
            <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => onCover(e.target.files?.[0])} />
            {coverImageId && (
              <input
                value={coverAlt}
                placeholder="Cover alt text (required to publish)"
                onChange={(e) => setCoverAlt(e.target.value)}
                onBlur={(e) => saveCoverAlt(e.target.value)}
                className={`mt-2 w-full border bg-white px-2 py-1 text-sm text-charcoal outline-none focus:border-gold ${coverAlt.trim() ? 'border-hairline' : 'border-[#7a5a2e]'}`}
              />
            )}
          </div>
        </div>
      </div>

      {/* Body + live preview */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div>
          <p className={label}>Body — blank line = paragraph · &ldquo;&gt; &rdquo; = pull quote · &ldquo;## &rdquo; = subheading</p>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={18} className={`${field} resize-y font-[family-name:var(--font-mono)] text-sm normal-case tracking-normal`} />
        </div>
        <div>
          <p className={label}>Preview</p>
          <div className="mt-2 max-h-[28rem] overflow-auto bg-pearl px-6 py-5 text-charcoal">
            <JournalBody body={body} />
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <label className={label}>SEO title<input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={field} /><span className="mt-1 block text-right text-[0.6rem] text-stone">{seoTitle.length}/60</span></label>
        <label className={label}>
          SEO description
          <textarea value={seoDescription} maxLength={SEO_DESC_MAX} onChange={(e) => setSeoDescription(e.target.value)} rows={2} className={`${field} resize-y font-[family-name:var(--font-body)] normal-case tracking-normal`} />
          <span className="mt-1 block text-right text-[0.6rem] text-stone">{seoDescription.length}/{SEO_DESC_MAX}</span>
        </label>
      </div>

      {/* Action bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-hairline bg-white/95 px-6 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <p className={`text-sm ${msg?.kind === 'err' ? 'text-[#a23a3a]' : 'text-[#3f7d3f]'}`}>{msg?.text}</p>
          <div className="flex items-center gap-3">
            <button onClick={save} disabled={busy} className="border border-hairline px-4 py-2 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-charcoal hover:border-gold disabled:opacity-40">Save draft</button>
            <button onClick={togglePublish} disabled={busy || (!published && missing.length > 0)} title={!published && missing.length ? `Add ${missing.join(', ')} first` : undefined} className="border border-gold bg-gold px-4 py-2 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-obsidian hover:bg-transparent hover:text-gold disabled:cursor-not-allowed disabled:opacity-40">
              {published ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        </div>
        {!published && missing.length > 0 && <p className="mx-auto mt-1 max-w-5xl text-right text-[0.65rem] text-stone">Add {missing.join(', ')} to publish.</p>}
      </div>
    </div>
  )
}
