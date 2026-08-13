'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Bell, Menu, LogOut, User } from 'lucide-react'
import { navItems } from '@/lib/nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/components/auth-provider'
import { useState, useEffect, useRef } from 'react'
import { getStats, latestPerSource } from '@/lib/api'
import { relativeTime } from '@/lib/api'

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname()
  const current = navItems.find((n) => n.href === pathname) ?? navItems[0]
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  const email = user?.email ?? ''
  const initials = email ? email.slice(0, 2).toUpperCase() : '??'

  const [hasUnread, setHasUnread] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [notifications, setNotifications] = useState<{ id: string, text: string, time: string, unread: boolean }[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showDropdown) return

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  useEffect(() => {
    getStats().then(snapshots => {
      if (snapshots.length === 0) {
        setNotifications([{ id: '1', text: 'Welcome! Add your handles in the Profile tab.', time: 'Just now', unread: true }])
        setHasUnread(true)
        return
      }
      const latest = latestPerSource(snapshots)
      const newNotifs = []
      if (latest.github) {
        newNotifs.push({ id: 'gh', text: `GitHub sync complete: ${latest.github.value} repos/gists.`, time: relativeTime(latest.github.recorded_at), unread: true })
      }
      if (latest.codeforces) {
        newNotifs.push({ id: 'cf', text: `Codeforces rating updated: ${latest.codeforces.value}`, time: relativeTime(latest.codeforces.recorded_at), unread: true })
      }
      if (latest.leetcode) {
        newNotifs.push({ id: 'lc', text: `LeetCode progress tracked: ${latest.leetcode.value} solved.`, time: relativeTime(latest.leetcode.recorded_at), unread: true })
      }
      if (newNotifs.length > 0) setHasUnread(true)
      setNotifications(newNotifs)
    }).catch(console.error)
  }, [])

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    router.push('/login')
  }

  function markAllAsRead() {
    setHasUnread(false)
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md transition-theme sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
          {current.label}
        </h1>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">{current.description}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-label="Notifications"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Bell className="h-[18px] w-[18px]" />
            {hasUnread && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-success ring-2 ring-background" />
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                {hasUnread && (
                  <button onClick={markAllAsRead} className="text-xs font-medium text-primary hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto p-2">
                {notifications.map(n => (
                  <div key={n.id} className={`mb-1 flex flex-col rounded-lg px-3 py-2 ${n.unread ? 'bg-muted/50' : 'hover:bg-muted/30'}`}>
                    <p className={`text-sm ${n.unread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{n.text}</p>
                    <span className="mt-1 text-[10px] text-muted-foreground">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <ThemeToggle />

        {/* User avatar + sign-out */}
        <div className="flex items-center gap-2 pl-1">
          <span className="hidden text-xs text-muted-foreground sm:block truncate max-w-[120px]" title={email}>
            {email}
          </span>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {user?.user_metadata?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            title="Sign out"
            aria-label="Sign out"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
