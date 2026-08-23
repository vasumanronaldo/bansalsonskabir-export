'use client'
// The media library grid. Search by filename or alt; each tile shows where the
// image is used; delete is blocked (and disabled) for in-use images.
import { useMemo, useState } from 'react'
import type { MediaItem } from '@/lib/admin/media'

function kb(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`
}

export function MediaLibrary({ items, csrf }: { items: MediaItem[]; csrf: string }) {
  const [all, setAll] = useState(items)
  const [q, setQ] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return all
    return all.filter((i) => i.r2_key.toLowerCase().includes(t) || i.alt.toLowerCase().includes(t) || i.usage.toLowerCase().includes(t))
  }, [all, q])

  async function remove(id: string) {
    setMsg(null)
    const res = await fetch(`/admin/api/media/${id}`, { method: 'DELETE', headers: { 'X-CSRF-Token': csrf } })
    if (res.ok) {
      setAll((xs) => xs.filter((x) => x.id !== id))
    } else {
      const d = await res.json().catch(() => ({}))
      setMsg(d.error || 'Could not delete.')
    }
  }

  const filename = (key: string) => key.split('/').pop() ?? key

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-display)] text-2xl">Media</h1>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search filename or alt…"
          className="w-64 border border-hairline bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-gold"
        />
      </div>
      <p className="mt-2 text-[0.7rem] uppercase tracking-[0.14em] text-stone">
        {shown.length} of {all.length} image{all.length === 1 ? '' : 's'}
      </p>
      {msg && <p className="mt-3 text-sm text-[#a23a3a]">{msg}</p>}

      {all.length === 0 ? (
        <p className="mt-10 max-w-[52ch] text-stone">
          No images yet. Upload photographs from a piece&rsquo;s editor and they appear here, reusable across the site.
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((i) => (
            <li key={i.id} className="border border-hairline bg-white">
              <div className="aspect-[4/5] overflow-hidden bg-pearl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/img/${i.r2_key_640 ?? i.r2_key}`} alt={i.alt} className="h-full w-full object-cover" />
              </div>
              <div className="p-3">
                <p className="truncate text-xs text-charcoal" title={filename(i.r2_key)}>{filename(i.r2_key)}</p>
                <p className="mt-1 truncate text-[0.68rem] text-stone" title={i.alt || 'No alt text'}>{i.alt || '— no alt —'}</p>
                <div className="mt-2 flex items-center justify-between gap-2 font-[family-name:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.12em]">
                  <span className={i.inUse ? 'text-gold' : 'text-stone'}>{i.usage}</span>
                  <span className="text-stone">{i.width}×{i.height} · {kb(i.bytes)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => remove(i.id)}
                  disabled={i.inUse}
                  title={i.inUse ? 'In use — remove it from the piece or post first' : 'Delete this image'}
                  className="mt-3 w-full border border-hairline py-1.5 font-[family-name:var(--font-mono)] text-[0.58rem] uppercase tracking-[0.16em] text-[#a23a3a] transition-colors hover:border-[#e6c9c9] disabled:cursor-not-allowed disabled:text-stone disabled:opacity-50"
                >
                  {i.inUse ? 'In use' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
