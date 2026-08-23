'use client'
// Sidebar navigation for the admin. Active state from the current path. Icons are
// inline strokes (no icon dependency) tuned to a fine, jewellery-plate weight.
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="h-[1.05rem] w-[1.05rem] shrink-0">
      <path d={d} />
    </svg>
  )
}

// Minimal single-path glyphs.
const ICONS: Record<string, ReactNode> = {
  dashboard: <Icon d="M3 12l9-8 9 8M5 10v10h14V10" />,
  pieces: <Icon d="M6 3h12l3 6-9 12L3 9l3-6zM3 9h18M9 3l3 18M15 3l-3 18" />,
  journal: <Icon d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2V5zM8 7h8M8 11h8M8 15h5" />,
  media: <Icon d="M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6" />,
  pages: <Icon d="M6 2h9l5 5v15H6zM14 2v6h6" />,
  house: <Icon d="M4 7l8-4 8 4-8 4-8-4zM4 12l8 4 8-4M4 17l8 4 8-4" />,
  appointments: <Icon d="M4 5h16v16H4zM4 9h16M8 3v4M16 3v4" />,
  settings: <Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.3.9a7 7 0 0 0-2-1.2L16 2H8l-.6 2.3a7 7 0 0 0-2 1.2L3 4.6l-2 3.4 2 1.6A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.6 2 3.4 2.3-.9a7 7 0 0 0 2 1.2L8 22h8l.6-2.3a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.6c.06-.4.1-.8.1-1.2z" />,
}

const NAV: { href: string; label: string; icon: string; badgeKey?: string }[] = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/pieces', label: 'Pieces', icon: 'pieces' },
  { href: '/admin/journal', label: 'Journal', icon: 'journal' },
  { href: '/admin/media', label: 'Media', icon: 'media' },
  { href: '/admin/pages', label: 'Pages', icon: 'pages' },
  { href: '/admin/content', label: 'House content', icon: 'house' },
  { href: '/admin/appointments', label: 'Appointments', icon: 'appointments', badgeKey: 'appointments' },
  { href: '/admin/settings', label: 'Settings', icon: 'settings' },
]

export function AdminSidebarNav({ badges }: { badges?: Record<string, number> }) {
  const pathname = usePathname()
  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href))

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {NAV.map((item) => {
        const active = isActive(item.href)
        const badge = item.badgeKey ? badges?.[item.badgeKey] : undefined
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[0.82rem] tracking-[0.01em] transition-colors ${
              active ? 'bg-gold/15 text-gold-soft' : 'text-stone-light hover:bg-white/5 hover:text-pearl'
            }`}
          >
            <span className={active ? 'text-gold-soft' : 'text-stone-light group-hover:text-gold-soft'}>{ICONS[item.icon]}</span>
            <span className="whitespace-nowrap">{item.label}</span>
            {badge ? (
              <span className="ml-auto rounded-full bg-gold px-1.5 py-0.5 text-[0.62rem] font-medium leading-none text-obsidian">{badge}</span>
            ) : (
              active && <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-gold-soft md:block" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
