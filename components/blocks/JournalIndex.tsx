'use client'

// Journal index grid (docs/04 § Journal). 2-column editorial grid, category
// filter, 12 per page. Client-side filter/pagination over the fetched posts.
import { useMemo, useState } from 'react'
import { JournalCard } from '@/components/blocks/JournalCard'
import { Body } from '@/components/type'
import { JOURNAL_CATEGORIES } from '@/lib/journal'
import type { JournalCardData } from '@/lib/journal'

const PER_PAGE = 12

export function JournalIndex({ posts }: { posts: JournalCardData[] }) {
  const [cat, setCat] = useState<string>('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => (cat === 'all' ? posts : posts.filter((p) => p.category === cat)), [posts, cat])
  const shown = filtered.slice(0, page * PER_PAGE)

  if (posts.length === 0) {
    return (
      <Body className="text-stone">
        The journal is being written. Come back soon — or subscribe below and we will send the first letters when
        they are ready.
      </Body>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {[{ value: 'all', label: 'All' }, ...JOURNAL_CATEGORIES].map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => {
              setCat(c.value)
              setPage(1)
            }}
            className={`font-[family-name:var(--font-mono)] text-[length:var(--text-label)] uppercase tracking-[0.12em] transition-colors duration-200 ${
              cat === c.value ? 'text-gold' : 'text-stone hover:text-charcoal'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2">
        {shown.map((p) => (
          <JournalCard key={p._id} post={p} />
        ))}
      </div>

      {shown.length < filtered.length && (
        <div className="mt-14">
          <button
            type="button"
            onClick={() => setPage((n) => n + 1)}
            className="border border-gold px-6 py-3 font-[family-name:var(--font-mono)] text-[length:var(--text-label-lg)] font-medium uppercase tracking-[0.12em] text-charcoal transition-colors duration-[250ms] hover:bg-gold hover:text-obsidian"
          >
            More
          </button>
        </div>
      )}
    </div>
  )
}
