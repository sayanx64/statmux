'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { navItems } from '@/lib/nav'
import { cn } from '@/lib/utils'

function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b0d10] shadow-sm border border-[#242933] overflow-hidden shrink-0">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="36" height="36" aria-hidden="true">
          <rect x="6" y="6" width="188" height="188" rx="42" fill="#0b0d10" stroke="#242933" strokeWidth="2"/>
          <rect x="24" y="24" width="70" height="152" rx="10" fill="#12151a" stroke="#242933" strokeWidth="1.5"/>
          <rect x="106" y="24" width="70" height="68" rx="10" fill="#12151a" stroke="#242933" strokeWidth="1.5"/>
          <rect x="106" y="108" width="70" height="68" rx="10" fill="#12151a" stroke="#242933" strokeWidth="1.5"/>
          <circle cx="34" cy="36" r="4" fill="#34d399"/>
          <circle cx="116" cy="36" r="4" fill="#60a5fa"/>
          <circle cx="116" cy="120" r="4" fill="#fbbf24"/>
          <text x="59" y="116" fontFamily="'JetBrains Mono','Fira Code',monospace" fontSize="46" fontWeight="700" fill="#34d399" textAnchor="middle">&gt;_</text>
          <rect x="120" y="70" width="6" height="12" fill="#60a5fa"/>
          <rect x="131" y="62" width="6" height="20" fill="#60a5fa"/>
          <rect x="142" y="54" width="6" height="28" fill="#60a5fa"/>
          <rect x="153" y="66" width="6" height="16" fill="#60a5fa"/>
          <rect x="164" y="58" width="6" height="24" fill="#60a5fa"/>
          <polyline points="120,158 132,150 143,154 154,140 165,146" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-tight text-foreground">statmux</span>
        <span className="mt-1 text-[11px] font-medium text-muted-foreground">Coding analytics</span>
      </span>
    </Link>
  )
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1 px-3" aria-label="Primary">
      {navItems.map((item) => {
        const active = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
            )}
          >
            <Icon
              className={cn(
                'h-[18px] w-[18px] shrink-0 transition-colors',
                active ? 'text-success' : 'text-muted-foreground group-hover:text-foreground',
              )}
            />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

import { useEffect, useState } from 'react'
import { getStats, relativeTime } from '@/lib/api'

function SyncFooter() {
  const [lastSync, setLastSync] = useState<string | null>(null)

  useEffect(() => {
    getStats()
      .then((snaps) => {
        if (snaps.length > 0) {
          setLastSync(relativeTime(snaps[0].recorded_at))
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="mx-3 mb-4 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          {lastSync ? (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
          ) : null}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${lastSync ? 'bg-success' : 'bg-muted-foreground/50'}`} />
        </span>
        <span className="text-xs font-medium text-foreground">
          {lastSync ? 'Systems connected' : 'No data yet'}
        </span>
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        {lastSync ? `Last sync ${lastSync}` : 'Add handles in profile'}
      </p>
    </div>
  )
}

export function DesktopSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col transition-theme">
      <div className="flex h-16 items-center px-5">
        <BrandMark />
      </div>
      <div className="mt-2 flex-1 overflow-y-auto">
        <NavLinks />
      </div>
      <SyncFooter />
    </aside>
  )
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      className={cn('fixed inset-0 z-50 lg:hidden', open ? 'pointer-events-auto' : 'pointer-events-none')}
      aria-hidden={!open}
    >
      <div
        className={cn(
          'absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'absolute left-0 top-0 flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar shadow-xl transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        role="dialog"
        aria-label="Navigation menu"
      >
        <div className="flex h-16 items-center justify-between px-5">
          <BrandMark />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-2 flex-1 overflow-y-auto">
          <NavLinks onNavigate={onClose} />
        </div>
        <SyncFooter />
      </aside>
    </div>
  )
}
