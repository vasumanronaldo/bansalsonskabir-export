// Shell for the authenticated admin: a dark gold-accented sidebar (crest, nav,
// help + account) beside a warm cream content column. Matches the luxury admin
// design; every screen renders its own content inside <main>.
import type { ReactNode } from 'react'
import { AdminSidebarNav } from './AdminSidebarNav'
import { adminEnv } from '@/lib/admin/session'

function Crest({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 92" fill="none" className={className} aria-hidden>
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M50 6 L58 16 L50 20 L42 16 Z" />
        <path d="M30 24 h40 l-4 34 a16 16 0 0 1 -32 0 Z" />
        <path d="M38 24 l-3 30 M62 24 l3 30" opacity="0.5" />
        <circle cx="50" cy="42" r="7" />
        <path d="M50 35 v14 M43 42 h14" opacity="0.6" />
        <path d="M34 70 h32 M38 76 h24 M43 82 h14" />
      </g>
    </svg>
  )
}

async function newEnquiryCount(): Promise<number | undefined> {
  try {
    const r = await adminEnv().DB.prepare("SELECT COUNT(*) AS n FROM enquiries WHERE status = 'new'").first<{ n: number }>()
    return r?.n || undefined
  } catch {
    return undefined
  }
}

export async function AdminChrome({ name, csrf, children }: { name: string; csrf: string; children: ReactNode }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  const badges = { appointments: (await newEnquiryCount()) ?? 0 }

  return (
    <div className="min-h-screen bg-pearl text-charcoal md:flex">
      {/* Sidebar */}
      <aside className="flex flex-col gap-6 bg-obsidian px-4 py-6 text-pearl md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0">
        <div className="flex items-center gap-3 px-2">
          <span className="text-gold-soft"><Crest className="h-9 w-9" /></span>
          <span className="leading-tight">
            <span className="block font-[family-name:var(--font-display)] text-[0.95rem] tracking-[0.18em] text-pearl">BANSAL &amp; SONS</span>
            <span className="block font-[family-name:var(--font-mono)] text-[0.52rem] uppercase tracking-[0.36em] text-gold-soft">Jewellers</span>
          </span>
        </div>

        <AdminSidebarNav badges={badges} />

        <div className="mt-auto space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="font-[family-name:var(--font-display)] text-sm text-pearl">Need a hand?</p>
            <p className="mt-1 text-[0.72rem] leading-relaxed text-stone-light">Full guide to every screen lives in the docs.</p>
            <a href="mailto:bansalsonsjewellers18@gmail.com" className="mt-3 inline-block rounded-lg border border-gold-soft/50 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-gold-soft transition-colors hover:bg-gold-soft hover:text-obsidian">Contact support</a>
          </div>

          <div className="flex items-center gap-3 border-t border-white/10 pt-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-soft/15 font-[family-name:var(--font-mono)] text-[0.7rem] text-gold-soft">{initials}</span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[0.8rem] text-pearl">{name}</span>
              <span className="block text-[0.6rem] uppercase tracking-[0.16em] text-stone-light">Administrator</span>
            </span>
            <form method="POST" action="/admin/api/logout">
              <input type="hidden" name="csrf" value={csrf} />
              <button title="Sign out" className="grid h-8 w-8 place-items-center rounded-lg text-stone-light transition-colors hover:bg-white/5 hover:text-pearl">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
