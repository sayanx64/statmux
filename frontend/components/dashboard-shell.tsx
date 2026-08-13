'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { DesktopSidebar, MobileSidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { useAuth } from '@/components/auth-provider'
import { LoadingLogo } from '@/components/loading-logo'

// Pages that don't need the dashboard shell or auth
const PUBLIC_PATHS = ['/login', '/auth/callback', '/terms', '/u', '/compare']

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { session, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  useEffect(() => {
    if (!loading && !session && !isPublic) {
      router.push('/login')
    }
  }, [loading, session, isPublic, router])

  // Public routes (login page) — render without the dashboard chrome
  if (isPublic) {
    return <>{children}</>
  }

  // Still determining auth state — show nothing to avoid flash
  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingLogo size={96} />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DesktopSidebar />
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
