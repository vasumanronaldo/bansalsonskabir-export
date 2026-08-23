'use client'
// The piece editor — one screen, no tabs (docs/10 § 6). Explicit Save (no
// autosave), optimistic concurrency, publish gated on alt text. Images are
// resized in the browser to WebP (2400 + 640) before upload.
import { useRef, useState } from 'react'
import type { PieceRecord, ImageRow, CollectionOption } from '@/lib/admin/db'

const DESC_MAX = 2000

async function toWebp(file: File, maxEdge: number): Promise<{ blob: Blob; w: number; h: number }> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, maxEdge / Math.max(bmp.width, bmp.height))
  const w = Math.max(1, Math.round(bmp.width * scale))
  const h = Math.max(1, Math.round(bmp.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, w, h)
  bmp.close?.()
  const blob: Blob = await new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('encode failed'))), 'image/webp', 0.86))
  return { blob, w, h }
}

export function PieceEditor({ piece, collections, csrf }: { piece: PieceRecord; collections: CollectionOption[]; csrf: string }) {
  const [name, setName] = useState(piece.name)
  const [subtitle, setSubtitle] = useState(piece.subtitle)
  const [collectionId, setCollectionId] = useState(piece.collection_id ?? '')
  const [description, setDescription] = useState(piece.description)
  const [featured, setFeatured] = useState(piece.featured === 1)
  const [published, setPublished] = useState(piece.published === 1)
  const [updatedAt, setUpdatedAt] = useState(piece.updated_at)
  const [images, setImages] = useState<ImageRow[]>(piece.images)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(0)
  const fileInput = useRef<HTMLInputElement>(null)

  const headers = { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }
  const missingAlt = images.some((i) => !i.alt.trim())

  async function save() {
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch(`/admin/api/pieces/${piece.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ name, subtitle, collection_id: collectionId || null, description, featured, updatedAt }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 409) {
        setMsg({ kind: 'err', text: `${data.updatedBy ? data.updatedBy + ' edited' : 'This was edited'} since you opened it. Reload to get the latest — your changes here are not saved.` })
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
      const path = published ? 'unpublish' : 'publish'
      const res = await fetch(`/admin/api/pieces/${piece.id}/${path}`, { method: 'POST', headers: { 'X-CSRF-Token': csrf } })
      if (res.status === 422) {
        const d = await res.json().catch(() => ({}))
        setMsg({ kind: 'err', text: d.error || 'Add alt text to every image first.' })
        return
      }
      if (!res.ok) throw new Error('Failed')
      setPublished(!published)
      setMsg({ kind: 'ok', text: published ? 'Unpublished.' : 'Published — live within a minute.' })
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message })
    } finally {
      setBusy(false)
    }
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return
    setMsg(null)
    for (const file of Array.from(files)) {
      setUploading((n) => n + 1)
      try {
        const [full, thumb] = await Promise.all([toWebp(file, 2400), toWebp(file, 640)])
        const fd = new FormData()
        fd.append('pieceId', piece.id)
        fd.append('full', full.blob, 'full.webp')
        fd.append('thumb', thumb.blob, 'thumb.webp')
        fd.append('width', String(full.w))
        fd.append('height', String(full.h))
        const res = await fetch('/admin/api/images', { method: 'POST', headers: { 'X-CSRF-Token': csrf }, body: fd })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        setImages((imgs) => [...imgs, data.image as ImageRow])
      } catch (e) {
        setMsg({ kind: 'err', text: (e as Error).message })
      } finally {
        setUploading((n) => n - 1)
      }
    }
    if (fileInput.current) fileInput.current.value = ''
  }

  async function patchImage(id: string, patch: { alt?: string; is_cover?: boolean }) {
    await fetch(`/admin/api/images/${id}`, { method: 'PATCH', headers, body: JSON.stringify(patch) })
  }
  function setAlt(id: string, alt: string) {
    setImages((imgs) => imgs.map((i) => (i.id === id ? { ...i, alt } : i)))
  }
  async function makeCover(id: string) {
    setImages((imgs) => imgs.map((i) => ({ ...i, is_cover: i.id === id ? 1 : 0 })))
    await patchImage(id, { is_cover: true })
  }
  async function removeImage(id: string) {
    setImages((imgs) => imgs.filter((i) => i.id !== id))
    await fetch(`/admin/api/images/${id}`, { method: 'DELETE', headers: { 'X-CSRF-Token': csrf } })
  }
  async function move(id: string, dir: -1 | 1) {
    const idx = images.findIndex((i) => i.id === id)
    const to = idx + dir
    if (idx < 0 || to < 0 || to >= images.length) return
    const next = images.slice()
    ;[next[idx], next[to]] = [next[to]!, next[idx]!]
    setImages(next)
    await fetch('/admin/api/images/reorder', { method: 'POST', headers, body: JSON.stringify({ pieceId: piece.id, ids: next.map((i) => i.id) }) })
  }

  const label = 'block font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-stone'
  const field = 'mt-2 block w-full border border-hairline bg-white px-3 py-2 text-charcoal outline-none focus:border-gold'

  return (
    <div className="pb-28">
      <div className="flex items-baseline justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl">{name || 'Untitled piece'}</h1>
        <span className={`font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.16em] ${published ? 'text-[#3f7d3f]' : 'text-stone'}`}>
          {published ? 'Published' : 'Draft'} · /{piece.slug}
        </span>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <label className={label}>
          Name<input value={name} onChange={(e) => setName(e.target.value)} className={field} />
        </label>
        <label className={label}>
          Subtitle<input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={field} />
        </label>
        <label className={label}>
          Collection
          <select value={collectionId} onChange={(e) => setCollectionId(e.target.value)} className={field}>
            <option value="">— none —</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </label>
        <label className={`${label} flex-row items-center gap-3`}>
          <span className="mt-2 inline-flex items-center gap-2">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Featured on the homepage
          </span>
        </label>
      </div>

      <label className={`${label} mt-8`}>
        Description
        <textarea value={description} maxLength={DESC_MAX} onChange={(e) => setDescription(e.target.value)} rows={8} className={`${field} resize-y font-[family-name:var(--font-body)] normal-case tracking-normal`} />
        <span className="mt-1 block text-right text-[0.6rem] text-stone">{description.length}/{DESC_MAX}</span>
      </label>

      {/* Images */}
      <div className="mt-10">
        <p className={label}>Photographs</p>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files) }}
          className="mt-2 flex items-center justify-center border border-dashed border-hairline bg-white px-6 py-8 text-center text-sm text-stone"
        >
          <div>
            Drag photographs here, or{' '}
            <button type="button" onClick={() => fileInput.current?.click()} className="text-gold underline underline-offset-4">choose files</button>.
            <br />
            <span className="text-[0.7rem]">Resized to WebP in your browser before upload. {uploading > 0 && `Uploading ${uploading}…`}</span>
            <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
          </div>
        </div>

        {images.length > 0 && (
          <ul className="mt-4 space-y-3">
            {images.map((img, i) => (
              <li key={img.id} className="flex items-start gap-3 border border-hairline bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/img/${img.r2_key_640 ?? img.r2_key}`} alt="" className="h-20 w-20 shrink-0 object-cover" />
                <div className="min-w-0 flex-1">
                  <input
                    value={img.alt}
                    placeholder="Alt text (required to publish)"
                    onChange={(e) => setAlt(img.id, e.target.value)}
                    onBlur={(e) => patchImage(img.id, { alt: e.target.value })}
                    className={`w-full border bg-white px-2 py-1 text-sm text-charcoal outline-none focus:border-gold ${img.alt.trim() ? 'border-hairline' : 'border-[#7a5a2e]'}`}
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-3 font-[family-name:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.14em]">
                    {img.is_cover ? (
                      <span className="text-gold">Cover</span>
                    ) : (
                      <button type="button" onClick={() => makeCover(img.id)} className="text-stone hover:text-gold">Set cover</button>
                    )}
                    <button type="button" onClick={() => move(img.id, -1)} disabled={i === 0} className="text-stone hover:text-charcoal disabled:opacity-30">↑</button>
                    <button type="button" onClick={() => move(img.id, 1)} disabled={i === images.length - 1} className="text-stone hover:text-charcoal disabled:opacity-30">↓</button>
                    <button type="button" onClick={() => removeImage(img.id)} className="text-[#a23a3a] hover:text-[#a23a3a]">Delete</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-hairline bg-white/95 px-6 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <p className={`text-sm ${msg?.kind === 'err' ? 'text-[#a23a3a]' : 'text-[#3f7d3f]'}`}>{msg?.text}</p>
          <div className="flex items-center gap-3">
            <button onClick={save} disabled={busy} className="border border-hairline px-4 py-2 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-charcoal hover:border-gold disabled:opacity-40">
              Save draft
            </button>
            <button
              onClick={togglePublish}
              disabled={busy || (!published && missingAlt)}
              title={!published && missingAlt ? 'Every image needs alt text before publishing' : undefined}
              className="border border-gold bg-gold px-4 py-2 font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-obsidian hover:bg-transparent hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
            >
              {published ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        </div>
        {!published && missingAlt && <p className="mx-auto mt-1 max-w-5xl text-right text-[0.65rem] text-stone">Add alt text to every image to publish.</p>}
      </div>
    </div>
  )
}
